/**
 * Cookie consent state — single source of truth.
 *
 * Stored in localStorage so the choice survives across visits, plus a
 * `nexol-consent` cookie so server middleware (if added later) can read it.
 *
 * Three states:
 *  - "unset"      — user hasn't decided yet; show the banner. Analytics off.
 *  - "all"        — accepted everything. Analytics + Clarity fire.
 *  - "necessary"  — only strictly-necessary cookies. Analytics + Clarity stay off.
 */

export type ConsentState = "unset" | "all" | "necessary";
export const CONSENT_STORAGE_KEY = "nexol-consent";
export const CONSENT_COOKIE_NAME = "nexol-consent";
export const CONSENT_EVENT = "nexol:consent-changed";

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (v === "all" || v === "necessary") return v;
  } catch {
    // localStorage can throw in private mode / SSR — fall through.
  }
  return "unset";
}

export function writeConsent(state: Exclude<ConsentState, "unset">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
    // 6-month max-age cookie so server-side reads stay in sync.
    const sixMonths = 60 * 60 * 24 * 180;
    document.cookie = `${CONSENT_COOKIE_NAME}=${state}; path=/; max-age=${sixMonths}; samesite=lax`;
    window.dispatchEvent(
      new CustomEvent(CONSENT_EVENT, { detail: { state } })
    );
  } catch {
    // Ignore — failing to persist consent is non-fatal; user can re-decide.
  }
}

export function clearConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    window.dispatchEvent(
      new CustomEvent(CONSENT_EVENT, { detail: { state: "unset" } })
    );
  } catch {}
}

/* ────────────────────────────────────────────────────────────────────────
   External-store hook helpers — used by client components without
   triggering the `react-hooks/set-state-in-effect` rule.
   ──────────────────────────────────────────────────────────────────────── */

export function subscribeToConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}

export function getConsentSnapshot(): ConsentState {
  return readConsent();
}

/** Server snapshot — used during SSR; consent is always "unset" before hydration. */
export function getConsentServerSnapshot(): ConsentState {
  return "unset";
}
