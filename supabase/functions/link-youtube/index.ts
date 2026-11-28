// Motoropolis Online: link the signed-in user's YouTube channel to their profile.
// POST { provider_token } with the user's Supabase JWT in Authorization.
// Stores sha256(channel id) as hex (never the raw id), the channel title and avatar; makes sure a $0 wallet exists.
// Idempotent: calling it again just refreshes title/avatar.
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED = [
  "https://torqueblueprint.com",
  "https://www.torqueblueprint.com",
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

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  const h = cors(req.headers.get("Origin"));
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json(401, { error: "not signed in" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: ud, error: ue } = await admin.auth.getUser(jwt);
  if (ue || !ud?.user) return json(401, { error: "invalid session" });
  const uid = ud.user.id;

  let token = "";
  try {
    const b = await req.json();
    token = typeof b?.provider_token === "string" ? b.provider_token : "";
  } catch (_) { /* empty body */ }
  if (!token) return json(400, { error: "missing provider_token (sign in with Google again)" });

  const yt = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { Authorization: "Bearer " + token },
  });
  if (yt.status === 401 || yt.status === 403) {
    return json(403, { error: "YouTube access was not granted or has expired. Sign in again and allow YouTube access." });
  }
  if (!yt.ok) return json(502, { error: "YouTube API error " + yt.status });
  const yd = await yt.json();
  const ch = Array.isArray(yd?.items) ? yd.items[0] : null;
  if (!ch?.id) return json(404, { error: "This Google account has no YouTube channel. Create one, then sign in again." });

  const hash = await sha256Hex(String(ch.id));
  const sn = ch.snippet || {};
  const title = String(sn.title || "").slice(0, 100) || "Motoropolis resident";
  const th = sn.thumbnails || {};
  const avatar = String((th.medium || th.default || th.high || {}).url || "").slice(0, 500) || null;

  // one channel = one account
  const { data: other, error: oe } = await admin.from("profiles").select("id").eq("yt_channel_hash", hash).neq("id", uid).maybeSingle();
  if (oe) return json(500, { error: "lookup failed" });
  if (other) return json(409, { error: "This YouTube channel is already linked to another Motoropolis account." });

  const { data: cur } = await admin.from("profiles").select("display_name").eq("id", uid).maybeSingle();
  const { error: pe } = await admin.from("profiles").upsert({
    id: uid,
    yt_channel_hash: hash,
    yt_title: title,
    avatar_url: avatar,
    display_name: cur?.display_name || title,
  }, { onConflict: "id" });
  if (pe) return json(500, { error: "could not save profile" });

  const { error: we } = await admin.from("wallets").upsert({ user_id: uid }, { onConflict: "user_id", ignoreDuplicates: true });
  if (we) return json(500, { error: "could not create wallet" });

  return json(200, { ok: true, yt_title: title, avatar_url: avatar });
});
