import Link from "next/link";

import { adminListServices } from "@/lib/firebase/admin-content";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminServicesListPage() {
  await requireAdminPage();
  const services = await adminListServices();
  return (
    <div className="adm-editor">
      <div className="adm-list-head">
        <h1>Services</h1>
        <Link className="adm-btn" href="/admin/services/new">
          + New service
        </Link>
      </div>
      <div className="adm-list">
        {services.map((s) => (
          <Link key={s.slug} className="adm-list-row" href={`/admin/services/${s.slug}`}>
            <span className="adm-list-title">
              {s.num} · {s.title}
            </span>
            <span className="adm-list-meta">
              {s.published === false ? "Draft" : "Published"} · /services/{s.slug}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
