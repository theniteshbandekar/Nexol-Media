import type { Metadata, Viewport } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "../globals.css";

import { LenisProvider } from "@/components/lenis-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { Analytics } from "@/components/analytics";
import { CookieConsent } from "@/components/cookie-consent";
import { organizationSchema, websiteSchema, SITE_TWITTER, SITE_URL } from "@/lib/schema";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import { filterByRouteVisibility } from "@/lib/nav";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nexol Media — Polished Videos. Real Growth.",
    template: "%s · Nexol Media",
  },
  description:
    "A media studio for Tech, AI and Design creators. Editing, personal brand, podcast distribution, launch videos, and daily vertical clipping.",
  applicationName: "Nexol Media",
  authors: [{ name: "Nexol Media", url: "https://nexolmedia.com" }],
  creator: "Nexol Media",
  publisher: "Nexol Media",
  keywords: [
    "Nexol Media",
    "creator agency",
    "YouTube editing",
    "video clipping",
    "podcast distribution",
    "personal brand",
    "launch video",
    "Tech creators",
    "AI creators",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Nexol Media",
    title: "Nexol Media — Polished Videos. Real Growth.",
    description:
      "Editing, scripts and distribution for Tech, AI and Design creators.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_TWITTER,
    creator: SITE_TWITTER,
    title: "Nexol Media",
    description:
      "Editing, scripts and distribution for Tech, AI and Design creators.",
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "REPLACE_WITH_GSC_TOKEN",
  },
  icons: { icon: "/favicon.ico" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  const rv = settings.routeVisibility;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${geistMono.variable}`}
    >
      <body>
        <JsonLd schema={[organizationSchema(), websiteSchema()]} />
        <LenisProvider>
          <SiteHeader
            primaryNav={filterByRouteVisibility(settings.primaryNav, rv)}
            ctaLabel={settings.headerCtaLabel}
            ctaHref={settings.headerCtaHref}
          />
          <main
            className="relative z-[1]"
            style={{ paddingTop: "var(--header-h)" }}
          >
            {children}
          </main>
          <SiteFooter
            tagline={settings.footerTagline}
            services={filterByRouteVisibility(settings.footerServices, rv)}
            company={filterByRouteVisibility(settings.footerCompany, rv)}
            connect={filterByRouteVisibility(settings.footerConnect, rv)}
            location={settings.footerLocation}
            rights={settings.footerRights}
          />
        </LenisProvider>
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
