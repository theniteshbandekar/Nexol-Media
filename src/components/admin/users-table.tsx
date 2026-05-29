"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setUserRole } from "@/lib/actions/admin/users";
import type { UserRole } from "@/lib/firebase/auth";
import type { AdminUser } from "@/lib/firebase/admin-content";

import { SelectField } from "./fields";

export function UsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onRole(uid: string, role: UserRole) {
    setError(null);
    start(async () => {
      const r = await setUserRole(uid, role);
      if (r.ok) router.refresh();
      else setError(r.error);
    });
  }

  return (
    <div className="adm-editor">
      <div className="adm-list-head">
        <h1>Users</h1>
      </div>
      <p className="adm-hint">
        Role changes take effect on the user&apos;s next sign-in. New users are created
        in the Firebase console (Authentication), then given a role here.
      </p>
      {error && <span className="adm-savebar-error">{error}</span>}
      <div className="adm-list">
        {users.map((u) => (
          <div key={u.uid} className="adm-list-row" style={{ cursor: "default" }}>
            <span className="adm-list-title">{u.email ?? u.uid}</span>
            <span className="adm-list-meta" style={{ minWidth: 160 }}>
              <SelectField
                label=""
                value={u.role ?? "writer"}
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "writer", label: "Writer" },
                ]}
                onChange={(role) => onRole(u.uid, role)}
              />
              {u.role === null && " (no role yet)"}
            </span>
          </div>
        ))}
        {users.length === 0 && <p className="adm-hint">No users found.</p>}
      </div>
      {busy && <span className="adm-hint">Saving…</span>}
    </div>
  );
}
