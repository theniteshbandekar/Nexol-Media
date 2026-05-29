// Session-cookie config. Kept free of `server-only` and the Admin SDK so the
// edge-style proxy (src/proxy.ts) can import the cookie name too.

// Firebase Hosting / App Hosting only forwards the `__session` cookie through
// its cache, so the session cookie must use this exact name.
export const SESSION_COOKIE = "__session";

// Firebase session cookies allow an expiry of up to 14 days.
export const SESSION_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_S = SESSION_EXPIRES_IN_MS / 1000;
