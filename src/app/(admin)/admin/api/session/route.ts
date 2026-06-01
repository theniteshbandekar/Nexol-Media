import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAdminAuth } from "@/lib/firebase/admin";
import {
  SESSION_COOKIE,
  SESSION_EXPIRES_IN_MS,
  SESSION_MAX_AGE_S,
} from "@/lib/firebase/session";

export const runtime = "nodejs";

// CSRF guard: reject a request only when its Origin header is present AND its host
// doesn't match the request host. Absent Origin is allowed (non-browser clients /
// proxy quirks) so this can't break legitimate same-origin calls.
function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

// POST { idToken } → verify the ID token and mint an httpOnly session cookie.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { idToken?: string } | null;
  const idToken = body?.idToken;
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();
    await auth.verifyIdToken(idToken, true);
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });
    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_S,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// DELETE → clear the cookie and revoke refresh tokens (best effort).
export async function DELETE(request: Request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  store.delete(SESSION_COOKIE);
  if (existing) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(existing);
      await getAdminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      // cookie already invalid — nothing to revoke
    }
  }
  return NextResponse.json({ ok: true });
}
