import { AuthorEditor } from "@/components/admin/editors/author-editor";

export default function AdminAuthorNewPage() {
  return (
    <AuthorEditor
      initial={{ id: "", name: "", role: "", initials: "" }}
      mode="create"
    />
  );
}
