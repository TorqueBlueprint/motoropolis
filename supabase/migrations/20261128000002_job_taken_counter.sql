-- Seats taken are kept on job_catalog (a counter maintained by a trigger on employment), so the public catalog
-- can be read straight from the table; the anon-callable SECURITY DEFINER list_jobs() is retired (execute revoked
-- from the API roles; it can be dropped later).
alter table public.job_catalog add column taken int not null default 0;
update public.job_catalog j set taken = (select count(*) from public.employment e where e.job_code = j.code);
alter table public.job_catalog add constraint job_catalog_taken_check check (taken >= 0 and taken <= seats);

create function public.employment_count() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op in ('INSERT','UPDATE') then
    update public.job_catalog set taken = taken + 1 where code = new.job_code;
  end if;
  if tg_op in ('DELETE','UPDATE') then
    update public.job_catalog set taken = taken - 1 where code = old.job_code;
  end if;
  return null;
end $$;
create trigger employment_count after insert or delete or update of job_code on public.employment
  for each row execute function public.employment_count();
revoke all on function public.employment_count() from public, anon, authenticated;

revoke all on function public.list_jobs() from public, anon, authenticated;

create or replace function public.apply_job(p_code text) returns public.employment
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  j public.job_catalog;
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
  if j.taken >= j.seats then raise exception 'no free seats'; end if;
  insert into public.employment (user_id, job_code) values (uid, j.code) returning * into r;
  return r;
end $$;
