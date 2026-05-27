import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Nexol · Control Room",
  description: "Internal content management for Nexol Media.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
};

/**
 * Bare root layout for the embedded Sanity Studio.
 * Studio renders its own full-screen chrome — no site header, footer,
 * or Lenis smooth scroll. Each route group sibling root layout (this one
 * and `(site)/layout.tsx`) defines its own html + body.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
