"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavItem = {
  href: string;
  label: string;
  ready: boolean;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav>
      {items.map((n) =>
        n.ready ? (
          <Link
            key={n.href}
            href={n.href}
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
    </nav>
  );
}
