import { BlogEditor } from "@/components/admin/editors/blog-editor";
import {
  adminListAuthors,
  type AdminAuthor,
  type AdminBlogPost,
} from "@/lib/firebase/admin-content";

function blankBlogPost(authors: AdminAuthor[]): AdminBlogPost {
  const first = authors[0];
  return {
    slug: "",
    title: "",
    dek: "",
    category: "Growth",
    publishedAt: new Date().toISOString().slice(0, 10),
    modifiedAt: undefined,
    readTimeMinutes: 5,
    author: first
      ? { name: first.name, role: first.role, initials: first.initials }
      : { name: "", role: "", initials: "" },
    authorId: first?.id ?? "",
    tags: [],
    hero: { kind: "placeholder", label: "" },
    body: [{ kind: "p", text: "" }],
    featured: false,
    published: false,
  };
}

export default async function AdminBlogNewPage() {
  const authors = await adminListAuthors();
  return (
    <BlogEditor initial={blankBlogPost(authors)} authors={authors} mode="create" />
  );
}
