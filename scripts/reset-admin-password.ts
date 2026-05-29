/**
 * Reset the admin user's password to a fresh, type-safe value and verify it
 * authenticates via the Firebase Auth REST endpoint (the same path the browser
 * client SDK uses). Rotates the chat-exposed temp password.
 *
 * Run: npx tsx --env-file=.env.local scripts/reset-admin-password.ts [email]
 * Defaults to theniteshbandekar@gmail.com.
 *
 * Inits firebase-admin inline (must not import src/lib/firebase/* — server-only).
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY. Run with --env-file=.env.local.");
  process.exit(1);
}
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!apiKey) {
  console.error("Missing NEXT_PUBLIC_FIREBASE_API_KEY. Run with --env-file=.env.local.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(serviceAccountKey)) });
}

const email = (process.argv[2] ?? "theniteshbandekar@gmail.com").trim().toLowerCase();
const auth = getAuth();

// Type-safe alphabet: no 0/O, 1/l/I — easy to read and type, no symbols that
// markdown or shells mangle.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
function freshPassword(len = 16): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

async function run() {
  const user = await auth.getUserByEmail(email);
  const password = freshPassword();

  await auth.updateUser(user.uid, { password });
  console.log(`Reset password for ${email} (${user.uid}).`);

  // Verify via the SAME REST endpoint the browser SDK calls.
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const body = (await res.json()) as { localId?: string; error?: { message?: string } };

  if (res.ok && body.localId) {
    console.log(`✅ REST sign-in verified (uid ${body.localId}).`);
    console.log(`\n🔑 New admin password (type it, don't paste):\n   ${password}\n`);
  } else {
    console.error(`❌ REST verify FAILED: ${body.error?.message ?? res.status}`);
    console.error(`   (Password was still changed to: ${password})`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("\n❌ reset-admin-password failed:", err);
  process.exit(1);
});
