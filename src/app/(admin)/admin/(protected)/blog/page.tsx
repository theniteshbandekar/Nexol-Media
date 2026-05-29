import Link from "next/link";

import { adminListBlogPosts } from "@/lib/firebase/admin-content";

export default async function AdminBlogListPage() {
  const posts = await adminListBlogPosts();
  return (
    <div className="adm-editor">
      <div className="adm-list-head">
        <h1>Blog posts</h1>
        <Link className="adm-btn" href="/admin/blog/new">
          + New post
        </Link>
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
