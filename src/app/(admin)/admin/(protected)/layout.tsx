import { redirect } from "next/navigation";

import { getCurrentUser, type UserRole } from "@/lib/firebase/auth";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";

type NavItem = {
  href: string;
  label: string;
  roles: UserRole[];
  ready: boolean;
};

// `ready: false` sections render as inert tiles until P5–P8 build them.
const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", roles: ["admin", "writer"], ready: true },
  { href: "/admin/home", label: "Home page", roles: ["admin"], ready: true },
  { href: "/admin/settings", label: "Settings", roles: ["admin"], ready: true },
  { href: "/admin/services", label: "Services", roles: ["admin"], ready: true },
  { href: "/admin/case-studies", label: "Case Studies", roles: ["admin"], ready: true },
  { href: "/admin/blog", label: "Blog", roles: ["admin", "writer"], ready: true },
  { href: "/admin/authors", label: "Authors", roles: ["admin", "writer"], ready: true },
  { href: "/admin/media", label: "Media", roles: ["admin", "writer"], ready: true },
  { href: "/admin/bookings", label: "Bookings", roles: ["admin"], ready: true },
  { href: "/admin/pages/services-index", label: "Services page", roles: ["admin"], ready: true },
  { href: "/admin/pages/case-studies-index", label: "Case studies page", roles: ["admin"], ready: true },
  { href: "/admin/pages/privacy", label: "Privacy page", roles: ["admin"], ready: true },
  { href: "/admin/pages/terms", label: "Terms page", roles: ["admin"], ready: true },
  { href: "/admin/users", label: "Users", roles: ["admin"], ready: true },
];

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user || !user.role) redirect("/admin/login");

  const role = user.role;
  const items = NAV.filter((n) => n.roles.includes(role));

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Nexol Admin</div>
        <AdminNav items={items} />
        <div className="admin-user">
          <span className="email">{user.email}</span>
          <span className="admin-role">{user.role}</span>
          <LogoutButton />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
