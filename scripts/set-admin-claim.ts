/**
 * Make a user the first /admin (role=admin). Creates the user if it doesn't
 * exist yet, sets the {role:'admin'} custom claim, and writes users/{uid}.
 *
 * Run: npx tsx --env-file=.env.local scripts/set-admin-claim.ts [email]
 * Defaults to theniteshbandekar@gmail.com.
 *
 * Inits firebase-admin inline (must not import src/lib/firebase/* — server-only).
 */

import { randomBytes } from "node:crypto";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type UserRecord } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { COLLECTIONS } from "../src/lib/firebase/collections";

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY. Run with --env-file=.env.local.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(serviceAccountKey)) });
}

const email = (process.argv[2] ?? "theniteshbandekar@gmail.com").trim().toLowerCase();
const auth = getAuth();
const db = getFirestore();

async function run() {
  let user: UserRecord;
  let tempPassword: string | undefined;

  try {
    user = await auth.getUserByEmail(email);
    console.log(`Found existing user ${email} (${user.uid}).`);
  } catch {
    tempPassword = randomBytes(12).toString("base64url");
    user = await auth.createUser({ email, password: tempPassword, emailVerified: true });
    console.log(`Created user ${email} (${user.uid}).`);
  }

  await auth.setCustomUserClaims(user.uid, { role: "admin" });

  const userDoc: { email: string; role: "admin"; displayName?: string } = {
    email,
    role: "admin",
  };
  if (user.displayName) userDoc.displayName = user.displayName;
  await db.collection(COLLECTIONS.users).doc(user.uid).set(userDoc);

  console.log(`\n✅ ${email} is now admin (uid ${user.uid}).`);
  if (tempPassword) {
    console.log(`\n🔑 Temp password (shown once — sign in, then change it):\n   ${tempPassword}`);
  }
  console.log(
    "\nNote: the admin role takes effect on next sign-in — custom claims need a fresh token.",
  );
}

run().catch((err) => {
  console.error("\n❌ set-admin-claim failed:", err);
  process.exit(1);
});
