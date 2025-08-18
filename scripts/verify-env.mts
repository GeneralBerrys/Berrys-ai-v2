import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert";

type EnvMap = Record<string, string | undefined>;
const REQUIRED: string[] = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const OPTIONAL: string[] = [
  "REPLICATE_API_TOKEN",
];

function parseDotenv(path: string): EnvMap {
  if (!existsSync(path)) return {};
  const txt = readFileSync(path, "utf8");
  const out: EnvMap = {};
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, k, v] = m;
    if (k && typeof v === "string") {
      const cleaned = v.replace(/^['"]|['"]$/g, "");
      out[k] = cleaned;
    }
  }
  return out;
}

function color(s: string, c: "red"|"green"|"yellow"|"cyan") {
  const map = { red:31, green:32, yellow:33, cyan:36 } as const;
  return `\x1b[${map[c]}m${s}\x1b[0m`;
}

function main() {
  const localEnv = parseDotenv(".env.local");
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED) {
    const val = process.env[key] ?? localEnv[key];
    if (!val || String(val).trim() === "" || /your_.*|example\.com/i.test(String(val))) {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL) {
    const val = process.env[key] ?? localEnv[key];
    if (!val || String(val).trim() === "") {
      warnings.push(key);
    }
  }

  const hasDotenv = existsSync(".env.local");
  if (!hasDotenv) {
    console.log(color("⚠ .env.local not found (ok for now; Vercel envs can cover this).", "yellow"));
  }

  if (missing.length) {
    console.log(color("❌ Missing required env vars:", "red"), missing.join(", "));
    console.log("\nAdd them either to .env.local (for local dev) or in Vercel → Project → Settings → Environment Variables.\n");
    process.exit(1);
  }

  console.log(color("✅ Required env vars present:", "green"), REQUIRED.join(", "));
  if (warnings.length) {
    console.log(color("⚠ Optional env missing (set before Replicate integration):", "yellow"), warnings.join(", "));
  }

  // Extra sanity: simple format check for URL
  assert(/^https:\/\/.+\.supabase\.co/.test((process.env.NEXT_PUBLIC_SUPABASE_URL ?? localEnv.NEXT_PUBLIC_SUPABASE_URL) || ""), "NEXT_PUBLIC_SUPABASE_URL should look like https://xxx.supabase.co");
  console.log(color("✅ Supabase URL format looks good.", "green"));

  console.log("\n" + color("Next steps:", "cyan"));
  console.log("- Push to GitHub, then import the repo into Vercel (UI).");
  console.log("- Add envs in Vercel (Development/Preview/Production).");
  console.log("- First deploy will build automatically on push or PR.");
}
main();
