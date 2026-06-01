import { CaseStudyEditor } from "@/components/admin/editors/case-study-editor";
import type { AdminCaseStudy } from "@/lib/firebase/admin-content";
import { requireAdminPage } from "@/lib/firebase/auth";

function blankCaseStudy(): AdminCaseStudy {
  return {
    slug: "",
    name: "",
    role: "",
    description: undefined,
    cardImage: undefined,
    title: undefined,
    stats: [],
    rows: [],
    ctaHook: undefined,
    publishedAt: undefined,
    comingSoon: false,
    published: false,
  };
}

export default async function AdminCaseStudyNewPage() {
  await requireAdminPage();
  return <CaseStudyEditor initial={blankCaseStudy()} mode="create" />;
}
