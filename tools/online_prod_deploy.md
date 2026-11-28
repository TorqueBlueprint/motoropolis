# Motoropolis Online — production deploy (launch day only)

Do **not** run this before launch day: a free Supabase project is paused after 1 week without activity.
Needs the owner's OK to create the project. Replace every `<PLACEHOLDER>`. Nothing secret goes into the repo.

| Placeholder | What |
|---|---|
| `<PROD_REF>` | ref of the new production project (20 letters, shown in its URL) |
| `<PROD_ANON_KEY>` | its public anon key (Project Settings → API keys → legacy `anon`, the `eyJ…` JWT) |
| `<GOOGLE_CLIENT_ID>` / `<GOOGLE_CLIENT_SECRET>` | from the Google OAuth client "Motoropolis Online (Supabase)" — secret only goes into the Supabase dashboard |

Two ways to do it: **(A)** ask Claude in a session with the Supabase connector (it can do steps 1–3 and 5–6), or **(B)** the Supabase CLI below.

---

## 1. Create the project

- Dashboard → org `ahevdvhhyykrmvjzhkgj` → **New project**: name `motoropolis-prod`, region **West EU (Ireland) / eu-west-1**,
  strong DB password (keep it in your password manager). Plan: Free works; Pro avoids pausing and adds daily backups.
- (A) Claude: `create_project` with the same name/region/org, after confirming the cost.

## 2. Database: apply all migrations in order

Order (from `supabase/migrations/`):

1. `20261128000001_online_phase1.sql` — tables, RLS, ledger/wallet triggers, job catalog seed, money functions
2. `20261128000002_job_taken_counter.sql` — `taken` seat counter, new `apply_job`
3. `20261128000003_account_delete.sql` — ledger delete/truncate guard that still allows account deletes
4. (only if approved) `20261128000004_youtube_data_refresh.sql` — moved from `supabase/proposed/`

(B) CLI, from the repo root:

```bash
npx supabase login
npx supabase link --project-ref <PROD_REF>      # if it asks for supabase/config.toml: run `npx supabase init` first and don't commit it
npx supabase db push                             # applies supabase/migrations/* in file-name order
```

(A) Claude: `apply_migration` once per file, in that order, with the file contents.

Check: `select count(*) from public.job_catalog;` → 17, `select count(*) from public.wallets;` → 0.

## 3. Edge functions

```bash
npx supabase functions deploy link-youtube   --project-ref <PROD_REF>
npx supabase functions deploy delete-account --project-ref <PROD_REF>
```

Both keep **verify_jwt on** (the CLI default). They read `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` from the project
automatically; no secrets to set. Their CORS lists already allow `https://torqueblueprint.github.io`
(add the custom domain to `ALLOWED` in both `index.ts` files if you move to one).

## 4. Google + Supabase auth settings (dashboard, owner)

Google Cloud → Clients → "Motoropolis Online (Supabase)":
- **Authorized redirect URIs** → add `https://<PROD_REF>.supabase.co/auth/v1/callback` (keep the dev one while testing).
- **Authorized JavaScript origins** → `https://torqueblueprint.github.io` (already there).

Supabase prod → **Authentication → Sign In / Providers**:
- **Google** → Enable → paste `<GOOGLE_CLIENT_ID>` and `<GOOGLE_CLIENT_SECRET>` → Save (leave "Skip nonce check" off).
- **Email** → **disable** (Motoropolis Online only uses Google).

Supabase prod → **Authentication → URL Configuration**:
- **Site URL**: `https://torqueblueprint.com/online/`
- **Redirect URLs**: `https://torqueblueprint.com/online/**`
  (no githack / localhost entries in production)

## 5. Point the page at production

In `src/online/online.js`, near the top, change exactly these two constants:

```js
var SB_URL = 'https://<PROD_REF>.supabase.co';
var SB_KEY = '<PROD_ANON_KEY>';
```

Nothing else holds the project: `src/online/account_delete.js` takes the project from the signed-in session, and the
edge functions use their own project's env. Then:

```bash
python3 tools/build.py
python3 tools/build.py --check          # must print "up to date" twice
node --check src/online/online.js && node --check src/online/account_delete.js
git add src/online/online.js online/index.html
git commit -m "Motoropolis Online: switch to the production Supabase project"
```

Merge to `main` (GitHub Pages publishes from it). Update the project ref in `docs/ONLINE_SETUP.md` too.

## 6. Launch checklist

See `docs/ONLINE_LAUNCH.md`, section E: sign in, apply, salary (once per Lisbon day), quit, delete account,
no-channel and channel-already-linked errors, Security Advisors clean, and **Season 1: everyone starts at $0**
(`select coalesce(sum(balance),0) from public.wallets;` → 0 before the first salary).
