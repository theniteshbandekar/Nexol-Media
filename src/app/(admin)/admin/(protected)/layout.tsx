import { redirect } from "next/navigation";

import { getCurrentUser, type UserRole } from "@/lib/firebase/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export type NavItem = {
  href: string;
  label: string;
  roles: UserRole[];
  ready: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "General",
    items: [
      { href: "/admin", label: "Dashboard", roles: ["admin", "writer"], ready: true },
      { href: "/admin/settings", label: "Site Settings (Hide/Unhide)", roles: ["admin"], ready: true },
      { href: "/admin/bookings", label: "Bookings", roles: ["admin"], ready: true },
      { href: "/admin/users", label: "Users", roles: ["admin"], ready: true },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/services", label: "Services", roles: ["admin"], ready: true },
      { href: "/admin/case-studies", label: "Case Studies", roles: ["admin"], ready: true },
      { href: "/admin/blog", label: "Blog", roles: ["admin", "writer"], ready: true },
      { href: "/admin/authors", label: "Authors", roles: ["admin", "writer"], ready: true },
      { href: "/admin/media", label: "Media", roles: ["admin", "writer"], ready: true },
    ],
  },
  {
    title: "Static Pages",
    items: [
      { href: "/admin/home", label: "Home page", roles: ["admin"], ready: true },
      { href: "/admin/pages/services-index", label: "Services page", roles: ["admin"], ready: true },
      { href: "/admin/pages/case-studies-index", label: "Case studies page", roles: ["admin"], ready: true },
      { href: "/admin/pages/privacy", label: "Privacy page", roles: ["admin"], ready: true },
      { href: "/admin/pages/terms", label: "Terms page", roles: ["admin"], ready: true },
    ],
  },
];

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user || !user.role) redirect("/admin/login");

  const role = user.role;
  const groups = NAV_GROUPS.map((group) => ({
    title: group.title,
    items: group.items
      .filter((n) => n.roles.includes(role))
      .map(({ href, label, ready }) => ({ href, label, ready })),
  })).filter((group) => group.items.length > 0);

  return (
    <AdminShell groups={groups} email={user.email ?? ""} role={role}>
      {children}
    </AdminShell>
  );
}
