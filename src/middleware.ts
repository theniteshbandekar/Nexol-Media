import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/firebase/session";

// Coarse network-boundary gate for /admin: redirect to the login page when no
// session cookie is present. This is presence-only (no verification — middleware
// runs on the Edge runtime and can't use the Admin SDK). The real session + role
// check happens in (admin)/admin/(protected)/layout.tsx and the admin-only page
// guards via getCurrentUser()/requireAdminPage(), and every admin server action
// re-checks the role. This is defense-in-depth, not the sole gate.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let the login page and the session API through unauthenticated.
  if (pathname === "/admin/login" || pathname.startsWith("/admin/api/")) {
    return NextResponse.next();
  }

  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
