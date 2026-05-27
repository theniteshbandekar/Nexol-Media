import type { Metadata } from "next";

import { LegalPageBody } from "@/components/legal-page";
import { getLegalPage } from "@/lib/sanity/legal-pages";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for visitors and clients of Nexol Media.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default async function TermsPage() {
  const page = await getLegalPage("terms");
  return <LegalPageBody page={page} />;
}
