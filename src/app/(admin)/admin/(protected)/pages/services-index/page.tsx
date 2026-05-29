import { ServicesIndexEditor } from "@/components/admin/editors/services-index-editor";
import { getServicesIndex } from "@/lib/sanity/index-pages";

export default async function AdminServicesIndexPage() {
  const idx = await getServicesIndex();
  return <ServicesIndexEditor initial={idx} />;
}
