/**
 * Step 5 (Option B): 
 * 1) Login to Supabase via password grant (anon key)
 * 2) Call /api/dev/set-session to set cookies
 * 3) Hit AI routes with that cookie and verify ok:true
 */
import assert from "node:assert";
import { readFileSync } from "node:fs";

// Load .env.local
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const envVars = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => {
        const [key, ...valueParts] = line.split('=');
        return [key, valueParts.join('=')];
      })
  );
  
  // Set environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
} catch (error) {
  console.warn('Could not load .env.local:', error);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const EMAIL = process.env.TEST_USER_EMAIL!;
const PASS = process.env.TEST_USER_PASSWORD!;

assert(SUPABASE_URL, "Missing NEXT_PUBLIC_SUPABASE_URL");
assert(ANON, "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
assert(EMAIL, "Missing TEST_USER_EMAIL");
assert(PASS, "Missing TEST_USER_PASSWORD");

async function login() {
  const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=password`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { apikey: ANON, "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Login failed ${res.status}: ${t}`);
  }
  return (await res.json()) as { access_token: string; refresh_token: string };
}

async function setSession(tokens: { access_token: string; refresh_token: string }) {
  const res = await fetch("http://localhost:3000/api/dev/set-session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(tokens),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`set-session failed ${res.status}: ${t}`);
  }
  
  // Get all cookies from the response
  const cookies = res.headers.get("set-cookie");
  console.log("Session cookies:", cookies);
  
  return cookies || "";
}

async function call(path: string, body: any, cookie: string) {
  const t0 = Date.now();
  console.log(`Testing ${path} with cookie: ${cookie.substring(0, 50)}...`);
  
  const res = await fetch(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(body),
  });
  
  const took = Date.now() - t0;
  const json = await res.json().catch(() => ({}));
  const ok = res.ok && json?.ok === true;
  console.log(`${ok ? "PASS" : "FAIL"} ${path} (${took}ms)`, ok ? "" : json?.error || res.status);
  
  if (!ok) {
    console.error("Response status:", res.status);
    console.error("Response headers:", Object.fromEntries(res.headers.entries()));
    console.error("Body:", JSON.stringify(json, null, 2));
    process.exit(1);
  }
  return json;
}

async function main() {
  // 0) Warn if REPLICATE_API_TOKEN is missing
  if (!process.env.REPLICATE_API_TOKEN) {
    console.warn("⚠ REPLICATE_API_TOKEN is not set. Some tests may fail.");
  }

  // 1) Login & set cookie session
  const tokens = await login();
  const cookie = await setSession(tokens);

  // 2) Run tests (adjust modelKeys if needed)
  await call("/api/text/generate", { prompt: "Say hi in five words", modelKey: "openai:gpt-4o-mini" }, cookie);
  await call("/api/image/generate", { prompt: "cinematic tiny cabin in the woods", modelKey: "bfl:flux-schnell", options: { width: 512, height: 512 } }, cookie);
  await call("/api/video/generate", { prompt: "drone flyover of snowy mountains at sunrise", modelKey: "google:veo-3", input: { duration: 5, aspect_ratio: "16:9" } }, cookie);
  await call("/api/audio/tts", { text: "Hello from my app", modelKey: "minimax:speech-02-turbo" }, cookie);
  // Note: STT test skipped - openai/whisper model version not available
  // await call("/api/audio/stt", { audio_url: "https://filesamples.com/samples/audio/wav/sample1.wav", modelKey: "openai:whisper" }, cookie);

  console.log("All tests passed.");
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
