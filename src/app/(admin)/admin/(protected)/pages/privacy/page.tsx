import { LegalEditor } from "@/components/admin/editors/legal-editor";
import { getLegalPage } from "@/lib/sanity/legal-pages";

export default async function AdminPrivacyPage() {
  const page = await getLegalPage("privacy");
  return <LegalEditor initial={page} />;
}
