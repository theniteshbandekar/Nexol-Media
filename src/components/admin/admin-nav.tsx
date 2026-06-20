"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavItem = {
  href: string;
  label: string;
  ready: boolean;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminNav({ groups, onNavigate }: { groups: AdminNavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="admin-nav-container">
      {groups.map((group, i) => (
        <div key={i} className="admin-nav-group">
          <div className="admin-nav-group-title">{group.title}</div>
          <div className="admin-nav-items">
            {group.items.map((n) =>
              n.ready ? (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={onNavigate}
                  className={
                    isActive(pathname, n.href)
                      ? "admin-navlink active"
                      : "admin-navlink"
                  }
                  aria-current={isActive(pathname, n.href) ? "page" : undefined}
                >
                  {n.label}
                </Link>
              ) : (
                <span
                  key={n.href}
                  className="admin-navlink disabled"
                  aria-disabled="true"
                >
                  {n.label}
                  <em>soon</em>
                </span>
              ),
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}
