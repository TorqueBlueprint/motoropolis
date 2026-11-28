-- PROPOSAL, NOT APPLIED to any project yet (needs the owner's OK: it enables pg_cron and clears data on a schedule).
-- To adopt: move to supabase/migrations/ with the next number, apply on dev, then on prod.
-- Motoropolis Online - YouTube API data freshness (YouTube API Services Developer Policies III.E.4.c:
-- Authorized Data other than tokens may be kept for no longer than 30 days, then it must be refreshed or deleted).
--
-- profiles.yt_refreshed_at is stamped every time link-youtube writes the channel title/picture (each sign-in).
-- expire_youtube_data() clears the channel title and picture of anyone not refreshed for 30 days; they come back the
-- next time that person signs in. The channel fingerprint (sha256 of the channel id) is kept: it is the account key
-- that enforces "one channel = one account" and it cannot be turned back into the channel id.
-- A daily pg_cron job runs it (04:17 UTC).

alter table public.profiles add column yt_refreshed_at timestamptz;
update public.profiles set yt_refreshed_at = now() where yt_title is not null;

create function public.profiles_yt_stamp() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.yt_title is not null then
    new.yt_refreshed_at := now();
  end if;
  return new;
end $$;
create trigger profiles_yt_stamp before insert or update of yt_title, avatar_url, yt_channel_hash on public.profiles
  for each row execute function public.profiles_yt_stamp();

create function public.expire_youtube_data() returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  update public.profiles
     set display_name = case when display_name = yt_title then null else display_name end,
         yt_title = null,
         avatar_url = null
   where yt_refreshed_at < now() - interval '30 days'
     and (yt_title is not null or avatar_url is not null);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.profiles_yt_stamp(), public.expire_youtube_data() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('motoropolis-expire-youtube-data', '17 4 * * *', 'select public.expire_youtube_data()');
