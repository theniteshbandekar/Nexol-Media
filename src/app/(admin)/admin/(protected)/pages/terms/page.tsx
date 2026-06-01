import { LegalEditor } from "@/components/admin/editors/legal-editor";
import { getLegalPage } from "@/lib/sanity/legal-pages";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminTermsPage() {
  await requireAdminPage();
  const page = await getLegalPage("terms");
  return <LegalEditor initial={page} />;
}
