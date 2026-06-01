import { notFound } from "next/navigation";

import { adminGetCaseStudy } from "@/lib/firebase/admin-content";
import { CaseStudyEditor } from "@/components/admin/editors/case-study-editor";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminCaseStudyEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdminPage();
  const { slug } = await params;
  const study = await adminGetCaseStudy(slug);
  if (!study) notFound();
  return <CaseStudyEditor initial={study} mode="edit" />;
}
