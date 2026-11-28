-- Motoropolis Online - Phase 1: accounts, wallet, ledger, junior jobs, daily salary.
-- Money only moves inside SECURITY DEFINER functions (or the service role in edge functions).
-- Invariant: wallets.balance = sum(ledger.amount) for that user. Kept by construction: the only way to change
-- a balance is inserting a ledger row (an AFTER INSERT trigger applies it), and the ledger is append-only.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  yt_channel_hash text unique,           -- sha256(channel id) hex; the raw channel id is never stored
  yt_title text,
  avatar_url text,
  display_name text,
  founder boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.ledger (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount bigint not null,
  kind text not null check (kind in ('salary','signup','adjust','purchase')),
  ref text,
  created_at timestamptz not null default now()
);
create index ledger_user_created_idx on public.ledger (user_id, created_at desc);

create table public.job_catalog (
  code text primary key,
  business text not null,
  title text not null,
  tier int not null check (tier >= 1),
  daily_salary int not null check (daily_salary > 0),
  seats int not null check (seats >= 0)
);

create table public.employment (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  job_code text not null references public.job_catalog(code),
  since timestamptz not null default now()
);
create index employment_job_code_idx on public.employment (job_code);

create table public.salary_claims (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.ledger enable row level security;
alter table public.job_catalog enable row level security;
alter table public.employment enable row level security;
alter table public.salary_claims enable row level security;

-- read-only access for the signed-in user to their own rows; no insert/update/delete policies at all
create policy profiles_select_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy wallets_select_own on public.wallets for select to authenticated using (user_id = (select auth.uid()));
create policy ledger_select_own on public.ledger for select to authenticated using (user_id = (select auth.uid()));
create policy employment_select_own on public.employment for select to authenticated using (user_id = (select auth.uid()));
create policy salary_claims_select_own on public.salary_claims for select to authenticated using (user_id = (select auth.uid()));
create policy job_catalog_select_all on public.job_catalog for select to anon, authenticated using (true);

-- belt and braces: the API roles get SELECT only (RLS still filters the rows)
revoke all on public.profiles, public.wallets, public.ledger, public.job_catalog, public.employment, public.salary_claims from anon, authenticated;
grant select on public.profiles, public.wallets, public.ledger, public.employment, public.salary_claims to authenticated;
grant select on public.job_catalog to anon, authenticated;
revoke all on sequence public.ledger_id_seq from anon, authenticated;

-- ledger is append-only, and every insert moves the wallet by the same amount (check balance >= 0 aborts overdrafts)
create function public.ledger_apply() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.wallets set balance = balance + new.amount, updated_at = now() where user_id = new.user_id;
  if not found then
    raise exception 'wallet missing for %', new.user_id;
  end if;
  return new;
end $$;
create trigger ledger_apply after insert on public.ledger for each row execute function public.ledger_apply();

create function public.ledger_immutable() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'ledger rows are append-only';
end $$;
create trigger ledger_no_update before update on public.ledger for each row execute function public.ledger_immutable();

-- a wallet balance can only change through the ledger trigger above
create function public.wallet_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.balance <> 0 then raise exception 'a new wallet starts at 0'; end if;
  elsif new.balance is distinct from old.balance and pg_trigger_depth() < 2 then
    raise exception 'wallet balance changes only through the ledger';
  end if;
  return new;
end $$;
create trigger wallet_guard before insert or update on public.wallets for each row execute function public.wallet_guard();

-- every new auth user gets a profile and a $0 wallet
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  insert into public.wallets (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- jobs with seat counts (no user ids leak: only aggregate counts)
create function public.list_jobs()
returns table (code text, business text, title text, tier int, daily_salary int, seats int, taken int)
language sql stable security definer set search_path = '' as $$
  select j.code, j.business, j.title, j.tier, j.daily_salary, j.seats,
         (select count(*)::int from public.employment e where e.job_code = j.code) as taken
  from public.job_catalog j
  order by j.tier, j.daily_salary desc, j.title;
$$;

create function public.apply_job(p_code text) returns public.employment
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  j public.job_catalog;
  n int;
  r public.employment;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from public.profiles where id = uid) then raise exception 'no profile'; end if;
  select * into j from public.job_catalog where code = p_code for update;  -- serialises applicants per job
  if not found then raise exception 'unknown job'; end if;
  if j.tier <> 1 then raise exception 'only junior (tier 1) jobs can be applied for'; end if;
  if exists (select 1 from public.employment where user_id = uid) then
    raise exception 'you already have a job';
  end if;
  select count(*) into n from public.employment where job_code = j.code;
  if n >= j.seats then raise exception 'no free seats'; end if;
  insert into public.employment (user_id, job_code) values (uid, j.code) returning * into r;
  return r;
end $$;

create function public.quit_job() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from public.employment where user_id = auth.uid();
end $$;

-- once per Lisbon calendar day; the salary_claims primary key enforces it even under races
create function public.claim_salary() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'Europe/Lisbon')::date;
  pay int;
  job text;
  bal bigint;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select e.job_code, j.daily_salary into job, pay
    from public.employment e join public.job_catalog j on j.code = e.job_code where e.user_id = uid;
  if not found then raise exception 'you need a job to collect a salary'; end if;
  begin
    insert into public.salary_claims (user_id, day) values (uid, today);
  exception when unique_violation then
    raise exception 'salary already collected today';
  end;
  insert into public.ledger (user_id, amount, kind, ref) values (uid, pay, 'salary', job || ':' || today);
  select balance into bal from public.wallets where user_id = uid;
  return jsonb_build_object('amount', pay, 'balance', bal, 'day', today,
    'next_at', ((today + 1)::timestamp at time zone 'Europe/Lisbon'));
end $$;

revoke all on function public.ledger_apply(), public.ledger_immutable(), public.wallet_guard(), public.handle_new_user() from public, anon, authenticated;
revoke all on function public.list_jobs(), public.apply_job(text), public.quit_job(), public.claim_salary() from public, anon;
grant execute on function public.list_jobs() to anon, authenticated;
grant execute on function public.apply_job(text), public.quit_job(), public.claim_salary() to authenticated;

-- junior jobs, mirroring the businesses of the city (src/data/jobs/job_list.json); seats = city posts x 5
-- (placeholder, tune later), salaries are placeholders
insert into public.job_catalog (code, business, title, tier, daily_salary, seats) values
  ('oficina.mechanic',      'oficina',  'Mechanic',            1, 150, 30),
  ('stand.salesman',        'stand',    'Car Salesman',        1, 140, 10),
  ('inspecao.inspector',    'inspecao', 'Inspector',           1, 130, 10),
  ('reboques.driver',       'reboques', 'Tow Truck Driver',    1, 125, 15),
  ('pneus.technician',      'pneus',    'Tire Technician',     1, 115, 15),
  ('fabrica.assembly',      'fabrica',  'Assembly Worker',     1, 110, 20),
  ('taxi.driver',           'taxi',     'Taxi Driver',         1, 105, 20),
  ('bus.driver',            'bus',      'Bus Driver',          1, 105, 10),
  ('pecas.warehouse',       'pecas',    'Warehouse Worker',    1, 100, 10),
  ('sucata.crusher',        'sucata',   'Crusher Operator',    1, 100,  5),
  ('lavagem.attendant',     'lavagem',  'Wash Attendant',      1,  90, 10),
  ('bomba.fuel',            'bomba',    'Fuel Attendant',      1,  90,  5),
  ('bomba.cashier',         'bomba',    'Cashier',             1,  85,  5),
  ('market.cashier',        'market',   'Supermarket Cashier', 1,  85, 15),
  ('sanit.collector',       'sanit',    'Garbage Collector',   1,  85, 10),
  ('parque.attendant',      'parque',   'Parking Attendant',   1,  80,  5),
  ('news.vendor',           'news',     'Newspaper Vendor',    1,  80,  5);
