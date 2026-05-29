import { notFound } from "next/navigation";

import { adminGetAuthor } from "@/lib/firebase/admin-content";
import { AuthorEditor } from "@/components/admin/editors/author-editor";

export default async function AdminAuthorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = await adminGetAuthor(id);
  if (!author) notFound();
  return <AuthorEditor initial={author} mode="edit" />;
}
