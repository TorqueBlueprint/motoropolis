-- Motoropolis Online - account deletion.
-- An account is deleted by deleting its auth.users row (edge function delete-account, service role). That cascades:
-- auth.users -> profiles -> wallets, ledger, employment, salary_claims (all "on delete cascade"), and the
-- employment_count trigger gives the job seat back.
--
-- The ledger stays append-only for everything else: rows can never be updated (ledger_no_update, phase 1) and,
-- from now on, never deleted one by one either. The only ways a ledger row can disappear:
--   1. its owner's profile is already gone, i.e. the delete is the cascade of a full account delete, or
--   2. an admin maintenance session that sets  set local motoropolis.ledger_maintenance = 'on'  (e.g. a Season reset
--      run by the owner in the SQL editor). The API roles (anon, authenticated) have no DELETE grant on the ledger
--      anyway, so neither path is reachable from the browser.
create function public.ledger_no_delete() returns trigger
language plpgsql set search_path = '' as $$
begin
  if coalesce(current_setting('motoropolis.ledger_maintenance', true), '') = 'on' then
    return old;
  end if;
  if exists (select 1 from public.profiles where id = old.user_id) then
    raise exception 'ledger rows are append-only (delete the whole account instead)';
  end if;
  return old;  -- the profile is gone: this is the cascade of an account delete
end $$;
create trigger ledger_no_delete before delete on public.ledger for each row execute function public.ledger_no_delete();
revoke all on function public.ledger_no_delete() from public, anon, authenticated;

-- a TRUNCATE skips row triggers, so block it too (maintenance sessions can still use DELETE as above)
create trigger ledger_no_truncate before truncate on public.ledger for each statement execute function public.ledger_immutable();
