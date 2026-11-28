# Motoropolis Online — setup (owner steps)

Motoropolis Online lives at `/online/` (built by `tools/build_online.py` from the main page plus `src/online/`).
The back end is the Supabase test project **motoropolis-dev** (ref `bxjitnmvmjbampgyrsxf`, region eu-west-1).
The database, security rules and the `link-youtube` edge function are already deployed. The only thing missing
is **Google sign-in**, which only the owner can set up. Until then the "Sign in with YouTube" button shows
"Sign-in with YouTube is not open yet". You can still try the panel with fake data at `…/online/index.html?mock=1`.

No secret goes into the repo. The Google **Client Secret** goes only into the Supabase dashboard.

---

## 1. Google Cloud: project and YouTube API

1. Open <https://console.cloud.google.com/> and sign in with the Google account that should own the app.
2. Top bar → project picker → **New project**. Name: `Motoropolis Online` → **Create**, then select it.
3. Left menu → **APIs & Services → Library**. Search **YouTube Data API v3** → open it → **Enable**.

## 2. OAuth consent screen (Testing mode)

1. **APIs & Services → OAuth consent screen** (on newer consoles: **Google Auth Platform → Branding / Audience / Data access**).
2. User type: **External** → **Create**.
3. App information: App name `Motoropolis Online`, user support email = your email, developer contact = your email. Save.
4. **Scopes / Data access → Add or remove scopes**. Tick `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and
   type/paste `https://www.googleapis.com/auth/youtube.readonly` in "Manually add scopes" → **Add to table** → **Update** → Save.
5. **Audience / Test users → Add users**: add the Google accounts of your testers (up to **100**). Only these accounts can sign in while
   the app is in **Testing** mode. Leave the publishing status on **Testing**.

> In Testing mode Google shows an "app not verified" warning: testers click **Continue**. Sign-ins from Testing apps expire after 7 days
> (people just sign in again).

## 3. OAuth client (Web application)

1. **APIs & Services → Credentials → Create credentials → OAuth client ID** (or **Google Auth Platform → Clients → Create client**).
2. Application type: **Web application**. Name: `Motoropolis Online (Supabase)`.
3. **Authorized JavaScript origins** → add:
   - `https://torqueblueprint.github.io`
   - `https://raw.githack.com`
4. **Authorized redirect URIs** → add exactly:
   - `https://bxjitnmvmjbampgyrsxf.supabase.co/auth/v1/callback`
5. **Create**. Copy the **Client ID** and **Client Secret** (keep the secret private; do not paste it in chat or in the repo).

## 4. Supabase: switch on Google

1. Open <https://supabase.com/dashboard/project/bxjitnmvmjbampgyrsxf>.
2. **Authentication → Sign In / Providers → Google** → toggle **Enable**.
3. Paste the **Client ID** and **Client Secret** from step 3 → **Save**.
   (Leave "Skip nonce check" off. The callback URL shown there must match the one you added in Google.)

## 5. Supabase: site URLs

**Authentication → URL Configuration**:

- **Site URL**: `https://torqueblueprint.com/online/`
- **Redirect URLs** → **Add URL** for each of:
  - `https://torqueblueprint.com/online/**`
  - `https://raw.githack.com/TorqueBlueprint/motoropolis/wip-accounts/online/index.html**`
  - (optional, for local tests) `http://localhost:8000/**`

The page asks Google to come back to the exact page it was opened from, so each address people use must be on this list.

## 6. Try it

1. Open the test link (as one of your test users):
   <https://raw.githack.com/TorqueBlueprint/motoropolis/wip-accounts/online/index.html>
2. **Sign in with YouTube** → pick the Google account / YouTube channel → allow "View your YouTube account".
3. Back on the page, the panel says "Welcome to Motoropolis Online, <channel>!" and shows $0, Unemployed.
4. Apply for a junior job → **Collect today's salary** → the balance goes up and the button locks until midnight (Lisbon time).

If the channel can't be linked, the panel shows the reason (no YouTube channel on that Google account, channel already linked to
another account, YouTube access not granted).

---

## How it works (short)

| Piece | Where | What |
|---|---|---|
| Tables | `supabase/migrations/` | `profiles`, `wallets`, `ledger`, `job_catalog`, `employment`, `salary_claims`, all with RLS on. Users can only **read** their own rows; the job catalog is public. No table can be written from the browser. |
| Money | DB functions | `apply_job(code)` (tier 1 only, a free seat, unemployed), `quit_job()`, `claim_salary()` (once per Lisbon day; `salary_claims` primary key enforces it). A wallet only changes when a ledger row is inserted (trigger), the ledger is append-only and `balance >= 0` is a check, so balance = sum(ledger) always. |
| New account | DB trigger | Every new auth user gets a profile and a $0 wallet. |
| YouTube link | edge function `link-youtube` | Takes the Google token from the browser, reads `channels?mine=true`, stores **sha256(channel id)** (never the raw id), channel title and picture. One channel = one account. Re-running it only refreshes title/picture. |

The publishable (anon) key in `src/online/online.js` is meant to be public: RLS decides what it can read and it can't move money.

## Advisor notes

- "Signed-in users can execute SECURITY DEFINER function" for `apply_job`, `claim_salary`, `quit_job`: intentional. These are the only way
  money and jobs change; each one checks `auth.uid()` and its own rules, and has a fixed `search_path`.
- "Leaked password protection disabled": only matters for email/password sign-in, which Motoropolis Online does not use. Turn it on in
  **Authentication → Providers → Email** (or switch Email off) if you like.
- `list_jobs()` from the first migration is retired (no one can call it); it can be dropped later.

## Clean-up of the SQL test rows

The automated tests created two fake users and two fake jobs that the tool was not allowed to delete. Run this once in
**SQL Editor** (it only removes those test rows):

```sql
delete from public.job_catalog where code in ('test.full', 'test.senior');
delete from auth.users where id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222');
```

(The page already hides them: it only lists tier-1 jobs with at least one seat.)

## Before a public launch

Full launch pack (privacy/terms pages, account deletion, Google verification, production runbook): **`docs/ONLINE_LAUNCH.md`**.

- Google **verification** of the OAuth app is required for more than 100 users / to drop the "unverified app" warning. `youtube.readonly`
  is a sensitive scope: Google asks for a **privacy policy page** (public URL), a home page, an app logo, a short video showing the sign-in
  and how the YouTube data is used, and the authorized domain (`torqueblueprint.github.io`) verified in Search Console.
- Add a privacy policy page (what is stored: channel title, picture, a hash of the channel id, game data; how to delete the account).
- Move from the dev project to a production Supabase project (run the same migrations, deploy the same function).
