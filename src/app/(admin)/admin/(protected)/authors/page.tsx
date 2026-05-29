import Link from "next/link";

import { adminListAuthors } from "@/lib/firebase/admin-content";

export default async function AdminAuthorsListPage() {
  const authors = await adminListAuthors();
  return (
    <div className="adm-editor">
      <div className="adm-list-head">
        <h1>Authors</h1>
        <Link className="adm-btn" href="/admin/authors/new">
          + New author
        </Link>
      </div>
      <div className="adm-list">
        {authors.map((a) => (
          <Link key={a.id} className="adm-list-row" href={`/admin/authors/${a.id}`}>
            <span className="adm-list-title">{a.name}</span>
            <span className="adm-list-meta">
              {a.role} · {a.initials}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
