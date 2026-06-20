"use client";

import { useState } from "react";
import { AdminNav, type AdminNavGroup } from "./admin-nav";
import { LogoutButton } from "./logout-button";
import { PushBell, PushSetup, PushProvider } from "./push-setup";

export function AdminShell({
  children,
  groups,
  email,
  role,
}: {
  children: React.ReactNode;
  groups: AdminNavGroup[];
  email: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <PushProvider>
      <header className="admin-topbar">
        <button
          className="admin-hamburger"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="hb-bar" />
          <span className="hb-bar" />
          <span className="hb-bar" />
        </button>
        <span className="admin-brand-mobile">Nexol Admin</span>
        <PushBell />
      </header>

      {open && (
        <div
          className="admin-drawer-backdrop"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div className="admin-shell">
        <aside className={`admin-sidebar${open ? " is-open" : ""}`}>
          <div className="admin-brand">Nexol Admin</div>
          <AdminNav groups={groups} onNavigate={close} />
          <div className="admin-user">
            <span className="email">{email}</span>
            <span className="admin-role">{role}</span>
            <PushSetup />
            <LogoutButton />
          </div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </PushProvider>
  );
}
