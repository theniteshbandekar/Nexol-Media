import Link from "next/link";

import { adminListCaseStudies } from "@/lib/firebase/admin-content";

export default async function AdminCaseStudiesListPage() {
  const studies = await adminListCaseStudies();
  return (
    <div className="adm-editor">
      <div className="adm-list-head">
        <h1>Case studies</h1>
        <Link className="adm-btn" href="/admin/case-studies/new">
          + New case study
        </Link>
      </div>
      <div className="adm-list">
        {studies.map((c) => (
          <Link key={c.slug} className="adm-list-row" href={`/admin/case-studies/${c.slug}`}>
            <span className="adm-list-title">{c.name}</span>
            <span className="adm-list-meta">
              {c.published === false ? "Draft" : "Published"}
              {c.comingSoon ? " · Coming soon" : ""} · /case-studies/{c.slug}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
