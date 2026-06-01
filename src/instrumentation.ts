// Next.js runs register() once per server process at startup. We use it to surface
// which integrations are wired up, so a missing/forgotten env var is visible in the
// deploy logs rather than only surfacing when a user first hits the feature.
export async function register() {
  // Only meaningful on the Node.js server runtime (skip Edge/middleware).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const checks: Array<[string, boolean]> = [
    ["Firebase Admin (FIREBASE_SERVICE_ACCOUNT_KEY)", Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)],
    [
      "Google Calendar OAuth",
      Boolean(
        process.env.GOOGLE_OAUTH_CLIENT_ID &&
          process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
          process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
      ),
    ],
    ["Resend email (RESEND_API_KEY)", Boolean(process.env.RESEND_API_KEY)],
    ["Resend newsletter audience (RESEND_AUDIENCE_ID)", Boolean(process.env.RESEND_AUDIENCE_ID)],
    ["Analytics (NEXT_PUBLIC_GA_ID)", Boolean(process.env.NEXT_PUBLIC_GA_ID)],
  ];

  const enabled = checks.filter(([, on]) => on).map(([n]) => n);
  const missing = checks.filter(([, on]) => !on).map(([n]) => n);

  console.info(`[startup] integrations enabled: ${enabled.join(", ") || "none"}`);
  if (missing.length) {
    console.warn(`[startup] integrations NOT configured: ${missing.join(", ")}`);
  }
  // The Admin SDK key is required for the app to function at all (every data
  // read/write and admin auth goes through it) — make its absence loud.
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error(
      "[startup] CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is missing — Firestore access and admin auth will fail.",
    );
  }
}
