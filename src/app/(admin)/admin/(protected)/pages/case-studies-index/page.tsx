import { CaseStudiesIndexEditor } from "@/components/admin/editors/case-studies-index-editor";
import { getCaseStudiesIndex } from "@/lib/sanity/index-pages";

export default async function AdminCaseStudiesIndexPage() {
  const idx = await getCaseStudiesIndex();
  return <CaseStudiesIndexEditor initial={idx} />;
}
