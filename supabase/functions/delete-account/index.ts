// Motoropolis Online: permanently delete the signed-in user's account.
// POST {} with the user's Supabase JWT in Authorization (verify_jwt on: the gateway rejects calls without a valid JWT).
// Deletes the auth user with the service role; the database cascades to profiles, wallets, ledger, employment and
// salary_claims (see supabase/migrations/*_account_delete.sql) and gives the job seat back.
// The body must be {"confirm": "DELETE"} so a stray call can't wipe an account.
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED = [
  "https://torqueblueprint.github.io",
  "https://raw.githack.com",
  "https://rawcdn.githack.com",
  "http://localhost",
  "http://127.0.0.1",
];

function cors(origin: string | null): Record<string, string> {
  const ok = origin && ALLOWED.some((a) => origin === a || origin.startsWith(a + ":"));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : ALLOWED[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const h = cors(req.headers.get("Origin"));
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json(401, { error: "not signed in" });

  let confirm = "";
  try {
    const b = await req.json();
    confirm = typeof b?.confirm === "string" ? b.confirm : "";
  } catch (_) { /* empty body */ }
  if (confirm !== "DELETE") return json(400, { error: 'send {"confirm":"DELETE"} to delete the account' });

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // the user id always comes from the verified token, never from the request body
  const { data: ud, error: ue } = await admin.auth.getUser(jwt);
  if (ue || !ud?.user) return json(401, { error: "invalid session" });
  const uid = ud.user.id;

  const { error: de } = await admin.auth.admin.deleteUser(uid);  // hard delete -> cascades to all game rows
  if (de) {
    console.error("delete-account failed", uid, de.message);
    return json(500, { error: "could not delete the account, please try again or contact the owner" });
  }
  return json(200, { ok: true });
});
