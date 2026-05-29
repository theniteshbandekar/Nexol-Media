import type { ServiceDeliverable, ServiceMetric } from "@/lib/services";
import {
  adminListCaseStudies,
  type AdminService,
} from "@/lib/firebase/admin-content";
import { ServiceEditor } from "@/components/admin/editors/service-editor";

function blankService(): AdminService {
  const d = (): ServiceDeliverable => ({ title: "", description: "", bullets: [] });
  const m = (): ServiceMetric => ({ num: "", label: "" });
  return {
    slug: "",
    num: "",
    title: "",
    tagline: "",
    pills: [],
    description: "",
    deliverablesMeta: "",
    deliverables: [d(), d(), d()],
    workHeading: "",
    workMeta: "",
    workSamples: [],
    metricsMeta: "",
    metrics: [m(), m(), m()],
    processMeta: "",
    process: [],
    ctaHeading: "",
    faqs: [],
    published: false,
  };
}

export default async function AdminServiceNewPage() {
  const caseStudies = await adminListCaseStudies();
  const opts = caseStudies.map((c) => ({ value: c.slug, label: c.name }));
  return <ServiceEditor initial={blankService()} mode="create" caseStudyOptions={opts} />;
}
