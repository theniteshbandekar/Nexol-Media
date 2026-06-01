import { ServicesIndexEditor } from "@/components/admin/editors/services-index-editor";
import { getServicesIndex } from "@/lib/sanity/index-pages";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminServicesIndexPage() {
  await requireAdminPage();
  const idx = await getServicesIndex();
  return <ServicesIndexEditor initial={idx} />;
}
