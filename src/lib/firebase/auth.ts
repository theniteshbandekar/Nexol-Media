import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

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
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
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
