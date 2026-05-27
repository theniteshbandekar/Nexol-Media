import type { Metadata } from "next";

import { LegalPageBody } from "@/components/legal-page";
import { getLegalPage } from "@/lib/sanity/legal-pages";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Nexol Media collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default async function PrivacyPage() {
  const page = await getLegalPage("privacy");
  return <LegalPageBody page={page} />;
}
