import { LegalEditor } from "@/components/admin/editors/legal-editor";
import { getLegalPage } from "@/lib/sanity/legal-pages";

export default async function AdminTermsPage() {
  const page = await getLegalPage("terms");
  return <LegalEditor initial={page} />;
}
