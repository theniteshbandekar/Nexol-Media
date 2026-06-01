import { CaseStudiesIndexEditor } from "@/components/admin/editors/case-studies-index-editor";
import { getCaseStudiesIndex } from "@/lib/sanity/index-pages";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminCaseStudiesIndexPage() {
  await requireAdminPage();
  const idx = await getCaseStudiesIndex();
  return <CaseStudiesIndexEditor initial={idx} />;
}
