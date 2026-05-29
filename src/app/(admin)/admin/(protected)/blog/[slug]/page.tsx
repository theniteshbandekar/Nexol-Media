import { notFound } from "next/navigation";

import { adminGetBlogPost, adminListAuthors } from "@/lib/firebase/admin-content";
import { BlogEditor } from "@/components/admin/editors/blog-editor";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, authors] = await Promise.all([
    adminGetBlogPost(slug),
    adminListAuthors(),
  ]);
  if (!post) notFound();
  return <BlogEditor initial={post} authors={authors} mode="edit" />;
}
