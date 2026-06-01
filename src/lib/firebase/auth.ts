import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminAuth } from "./admin";
import { SESSION_COOKIE } from "./session";

export { SESSION_COOKIE };

export type UserRole = "admin" | "writer";

export type CurrentUser = {
  uid: string;
  email: string | null;
  role: UserRole | null;
};

/**
 * Read + verify the session cookie. Returns null when there is no valid
 * session (no cookie, expired, revoked). Role comes from the custom claim,
 * which is the authoritative source of authorization.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) return null;
  try {
    // Verify locally (no checkRevoked) to avoid a network round-trip to the
    // Firebase Auth backend on every admin request. Logout deletes the cookie,
    // so revocation-on-every-read isn't needed for normal sign-out.
    const decoded = await getAdminAuth().verifySessionCookie(session);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: (decoded.role as UserRole | undefined) ?? null,
    };
  } catch {
    return null;
  }
});

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: admin role required.");
  }
  return user;
}

export async function requireWriter(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "writer")) {
    throw new Error("Unauthorized: writer role required.");
  }
  return user;
}

/**
 * Page-level guard for ADMIN-ONLY server components. The protected layout only
 * confirms a session exists (any role); NAV filtering merely hides links. Without
 * this, a `writer` could navigate directly to an admin-only page and READ its data
 * (e.g. the user roster). Call at the top of every admin-only page: it redirects
 * unauthenticated users to login and non-admin (writer) users to the dashboard,
 * instead of throwing. Returns the admin user for convenience.
 */
export async function requireAdminPage(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !user.role) redirect("/admin/login");
  if (user.role !== "admin") redirect("/admin");
  return user;
}
