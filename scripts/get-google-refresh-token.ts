/**
 * One-time CLI: generates a Google OAuth refresh token for the booking
 * integration. Run with:
 *
 *   npx tsx scripts/get-google-refresh-token.ts
 *
 * Prerequisites:
 *   - .env.local already contains GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET
 *   - "http://localhost:3000/api/oauth/google/callback" is listed under
 *     Authorized redirect URIs in the Google Cloud OAuth client
 *   - `npm run dev` is NOT running (this script binds port 3000 briefly)
 *
 * The script prints the refresh token to stdout. Copy it into .env.local
 * as GOOGLE_OAUTH_REFRESH_TOKEN — it never touches disk from this process.
 */

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { URL } from "node:url";

import { OAuth2Client } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];
const REDIRECT_URI = "http://localhost:3000/api/oauth/google/callback";
const PORT = 3000;

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // No .env.local — fall through; values must already be in process.env.
  }
}

loadEnvLocal();

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "\nERROR: GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be in .env.local first."
  );
  console.error(
    "Get them from console.cloud.google.com → APIs & Services → Credentials.\n"
  );
  process.exit(1);
}

const oauth = new OAuth2Client({
  clientId,
  clientSecret,
  redirectUri: REDIRECT_URI,
});

const consentUrl = oauth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n──────────────────────────────────────────────────────────────");
console.log(" Google Calendar refresh-token grab");
console.log("──────────────────────────────────────────────────────────────");
console.log(
  "\n1. Make sure `npm run dev` is stopped (this binds port 3000)."
);
console.log("2. Open this URL in a browser and approve the consent:\n");
console.log(`   ${consentUrl}\n`);
console.log("3. Google will redirect to localhost — the token prints below.\n");

const server = createServer(async (req, res) => {
  if (!req.url) return;
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  if (reqUrl.pathname !== "/api/oauth/google/callback") {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }
  const code = reqUrl.searchParams.get("code");
  const error = reqUrl.searchParams.get("error");
  if (error) {
    res.end(`OAuth error: ${error}. Check the terminal.`);
    console.error(`\nOAuth error: ${error}`);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.statusCode = 400;
    res.end("Missing ?code in callback.");
    return;
  }
  try {
    const { tokens } = await oauth.getToken(code);
    res.end(
      "Got it. You can close this tab and return to the terminal — the refresh token is printed there."
    );
    console.log("\n──────────────────────────────────────────────────────────────");
    if (tokens.refresh_token) {
      console.log("\nGOOGLE_OAUTH_REFRESH_TOKEN=" + tokens.refresh_token);
      console.log(
        "\nCopy the line above into .env.local. Done — close the script with Ctrl+C if it hasn't exited."
      );
    } else {
      console.log(
        "\nNo refresh_token returned. This usually means you've already consented before — revoke at"
      );
      console.log(
        "  https://myaccount.google.com/permissions  →  remove the 'Nexol Media Booking' entry"
      );
      console.log("then re-run this script.\n");
    }
    console.log(
      "──────────────────────────────────────────────────────────────\n"
    );
    server.close();
    process.exit(tokens.refresh_token ? 0 : 1);
  } catch (err) {
    res.statusCode = 500;
    res.end("Token exchange failed — see terminal.");
    console.error("\nToken exchange failed:", err);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT} for the OAuth callback…`);
});
