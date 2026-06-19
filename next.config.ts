import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy. Shipped in REPORT-ONLY mode first: it logs violations
// to the console without blocking anything, so a missed third-party host can't
// break admin auth or analytics at go-live. After watching for violations on the
// live App Hosting URL, flip the header key below from
// "Content-Security-Policy-Report-Only" to "Content-Security-Policy" to enforce.
// Allows: GA/GTM, Microsoft Clarity, Firebase Auth (identitytoolkit/securetoken)
// and Firebase Storage. 'unsafe-inline' is required by Next.js inline runtime
// scripts/styles (tighten later with a nonce via middleware if desired).
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.firebasestorage.app https://www.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://*.firebasestorage.app",
  "frame-src 'self' https://www.googletagmanager.com",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy", value: CSP },
  // HSTS only in production (it has no effect over plain-HTTP localhost and
  // would otherwise pin a dev cert).
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it Next picks the HOME dir
  // (a stray ~/package-lock.json sits there) as the root.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.firebasestorage.app" },
    ],
  },
  async redirects() {
    return [
      { source: "/work", destination: "/case-studies", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Long-cache content-hashed assets in PRODUCTION only. In dev, Turbopack
      // reuses stable chunk names, so `immutable` pins stale CSS/JS in the
      // browser and stops new builds from showing up.
      ...(isProd
        ? [
            {
              source: "/_next/static/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
      {
        source: "/book",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
    ];
  },
};

export default nextConfig;
