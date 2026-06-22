import Link from "next/link";

import { adminListAuthors, adminListBlogPosts } from "@/lib/firebase/admin-content";
import { BlogImportBtn } from "@/components/admin/blog-import-btn";

export default async function AdminBlogListPage() {
  const [posts, authors] = await Promise.all([
    adminListBlogPosts(),
    adminListAuthors(),
  ]);

  return (
    <div className="adm-editor">
      <div className="adm-list-head" style={{ flexWrap: "wrap", gap: 8 }}>
        <h1>Blog posts</h1>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <BlogImportBtn authors={authors} />
          <Link className="adm-btn" href="/admin/blog/new">
            + New post
          </Link>
        </div>
      </div>
      <div className="adm-list">
        {posts.map((p) => (
          <Link key={p.slug} className="adm-list-row" href={`/admin/blog/${p.slug}`}>
            <span className="adm-list-title">{p.title}</span>
            <span className="adm-list-meta">
              {p.published === false ? "Draft" : "Published"}
              {p.featured ? " · Featured" : ""} · {p.category} · /blog/{p.slug}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
