// Server-use only (RSC fetchers, server actions, route handlers, dev scripts).
// No `import "server-only"`: the content fetchers in src/lib/* both import this
// AND are value-imported by tsx scripts (seed/set-admin) for their __LEGACY_*/
// FALLBACK exports — server-only would throw under plain tsx. Misuse in a client
// component still fails the build (firebase-admin can't bundle for the browser).
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

/**
 * True once the Admin service-account key is configured. Lets callers fall back
 * to the legacy data during the Sanity→Firestore migration instead of crashing
 * when the key isn't present yet. Mirrors `hasSanityCredentials()`.
 */
export function hasFirebaseAdmin(): boolean {
  return Boolean(serviceAccountKey);
}

// Lazy, cold-start-safe singleton. Initialization is deferred to first use so
// merely importing this module never throws when the key is absent.
let cachedApp: App | null = null;

function adminApp(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length) {
    cachedApp = getApp();
    return cachedApp;
  }
  if (!serviceAccountKey) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set — cannot initialize firebase-admin.",
    );
  }
  cachedApp = initializeApp({
    credential: cert(JSON.parse(serviceAccountKey)),
    storageBucket,
  });
  return cachedApp;
}

export function getAdminDb(): Firestore {
  return getFirestore(adminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(adminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(adminApp());
}
