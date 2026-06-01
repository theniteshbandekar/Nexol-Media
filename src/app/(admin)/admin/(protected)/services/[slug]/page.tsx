import { notFound } from "next/navigation";

import {
  adminGetService,
  adminListCaseStudies,
} from "@/lib/firebase/admin-content";
import { ServiceEditor } from "@/components/admin/editors/service-editor";
import { requireAdminPage } from "@/lib/firebase/auth";

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdminPage();
  const { slug } = await params;
  const [service, caseStudies] = await Promise.all([
    adminGetService(slug),
    adminListCaseStudies(),
  ]);
  if (!service) notFound();
  const opts = caseStudies.map((c) => ({ value: c.slug, label: c.name }));
  return <ServiceEditor initial={service} mode="edit" caseStudyOptions={opts} />;
}
