# Nexol Media

> ⚠️ **This README is partially outdated.** The site no longer uses **Sanity** or
> **Vercel**: content is now stored in **Firestore** and edited through an in-house
> dashboard at **`/admin`**, and the site deploys on **Firebase App Hosting**. The
> sections below that describe Sanity Studio (`/studio`), Sanity env vars/tokens, and
> Vercel deployment are historical. For the current setup and deployment, see
> **`GO-LIVE.md`** and **`plan.md`** (the sources of truth).

A media studio site for Tech, AI and Design creators. Next.js 16 App Router, an
in-house Firestore-backed CMS at `/admin`, Lenis smooth scroll, Framer Motion
animations, structured data, OG image generation, GA4 + Microsoft Clarity (gated by
cookie consent), Resend-backed contact + newsletter forms.

## Tech stack

- **Next.js 16.2.6** (App Router, Turbopack, server components by default)
- **React 19.2**
- **Sanity v3** Studio embedded at `/studio`
- **Tailwind 4** for utility classes + shadcn primitives, semantic CSS in `globals.css`
- **Lenis** smooth scroll, **Framer Motion** animations
- **Resend** for transactional email + newsletter audience
- **@next/third-parties** for Google Analytics 4
- **Microsoft Clarity** for heatmaps / session replay
- TypeScript strict, ESLint clean

## Local dev

```bash
npm install
cp .env.example .env.local      # fill in values (see below)
npm run dev
```

Open http://localhost:3000 for the live site and http://localhost:3000/studio for the admin.

## Environment variables

See [.env.example](.env.example) for the full list with inline comments. Quick summary:

| Var | Required for | Where to get it |
|-----|--------------|-----------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | CMS reads + Studio | sanity.io/manage |
| `NEXT_PUBLIC_SANITY_DATASET` | CMS reads | usually `production` |
| `SANITY_API_READ_TOKEN` | Visual editing preview | sanity.io/manage → API → Viewer token |
| `SANITY_API_WRITE_TOKEN` | Migration + contact form → Sanity | sanity.io/manage → API → Editor token |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | analytics.google.com → property → Web data stream → Measurement ID |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Search Console ownership | search.google.com/search-console → HTML tag method |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity heatmaps | clarity.microsoft.com → Project ID |
| `RESEND_API_KEY` | Contact form email + newsletter | resend.com → API Keys |
| `RESEND_AUDIENCE_ID` | Newsletter signups | resend.com → Audiences |
| `RESEND_FROM_ADDRESS` | Email "From" header | A verified Resend sender |
| `NEXT_PUBLIC_CALENDLY_URL` | `/book` page embed | cal.com / calendly.com |

The site **degrades gracefully** for every missing var:
- Missing Sanity → site renders the legacy seed data baked into `src/lib/*.ts`.
- Missing GA4 / Clarity → analytics simply don't fire.
- Missing Resend → contact form returns a polite error; newsletter quietly succeeds (so the UI flow stays clean during local dev).
- Missing Calendly → `/book` shows a placeholder URL.

## First-time Sanity setup

1. Create a project at https://sanity.io with a `production` dataset.
2. Invite your email as **Administrator** under Project → Members.
3. Create two API tokens under Project → API:
   - **Editor** token → `SANITY_API_WRITE_TOKEN`
   - **Viewer** token → `SANITY_API_READ_TOKEN`
4. Fill `.env.local` with the project ID + tokens.
5. Run the migration to seed Sanity from the legacy TypeScript arrays + the bundled Adrien Ninet image:

   ```bash
   npx tsx scripts/migrate-to-sanity.ts
   ```

6. Open `/studio`, log in with your email, verify the content appears.
7. **Revoke the Editor token** in sanity.io/manage and keep only the Viewer (the running site only needs reads + the contact form's write).

   > If you want the contact form to keep persisting `contactSubmission` docs in Sanity, leave a write token in place — it's only used server-side and isn't exposed to the client.

## Content management

| What you edit | Where in Studio |
|---------------|-----------------|
| Home page copy (hero, VSL, stats, testimonials, hook) | **Home page** |
| Nav, footer columns, route visibility toggles | **Site settings** |
| Blog posts | **Blog posts** + **Authors** |
| Case studies | **Case studies** |
| Service detail pages | **Services** |
| `/privacy` and `/terms` body | **Legal pages** |
| Contact form submissions | **Contact submissions** |

### Hiding a section temporarily

**Site settings → Route visibility** has toggles for blog, case studies, services, about, contact. Untick any one → the route renders the "Back soon" page, the nav link disappears, and the URLs drop out of the sitemap.

### Visual editing on the home page

In Studio, click the **Presentation** tool in the sidebar. The home page renders inside the Studio iframe with click-to-edit hotspots over every section. Click a headline → the field opens in the side panel. Edits stream live without reload (Next.js draft mode + Sanity overlays).

## Build, lint, deploy

```bash
npm run build       # production build — confirm all routes prerender
npm run lint        # ESLint
npm run start       # serve the production build locally
```

### Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add every env var from `.env.local` under Vercel → Project → Settings → Environment Variables.
4. Vercel auto-detects Next.js and deploys.
5. Add your custom domain under Domains → set DNS records.
6. Open `<your-domain>/sitemap.xml` and submit it in Search Console.

### Deploy to Hostinger Node hosting

1. Build locally: `npm run build`.
2. Set env vars in the Hostinger dashboard.
3. Configure the app to run `npm run start` on port 3000 (PM2 or Hostinger's Node manager).
4. Put Cloudflare in front for caching + SSL.

## SEO surface

- `/sitemap.xml` — pulls from Sanity, filters thin / hidden / coming-soon content.
- `/robots.txt` — disallows `/api/`, `/book`, `/studio`.
- `/manifest.webmanifest` — PWA manifest.
- `/opengraph-image` — site default OG card.
- Per-route OG images at `/opengraph-image` under each `(site)/.../[slug]/`.
- JSON-LD: Organization + WebSite on every page; Person + Article + BreadcrumbList on the Adrien Ninet case study; Service + FAQ + Breadcrumb on `/services/clipping`; BlogPosting + Breadcrumb on every published blog post.
- Thin blog posts and coming-soon case studies set `robots: { index: false, follow: true }` and are excluded from the sitemap.

## Privacy

- Cookie banner gates GA4 + Clarity. Only fires after "Accept all".
- `/privacy` and `/terms` pages editable from Studio.
- Contact submissions are stored in Sanity (private dataset, requires login).

## Project structure

```
src/
  app/
    (site)/        # main site — uses SiteHeader/Footer + Lenis
    studio/        # embedded Sanity Studio (its own root layout)
    api/           # draft-mode enable/disable for visual editing
    sitemap.ts     # dynamic sitemap from Sanity
    robots.ts
    manifest.ts
  components/
    sections/      # home page sections (hero, vsl, stats, testimonials, hook)
    site-header.tsx
    site-footer.tsx
    cookie-consent.tsx
    analytics.tsx
    json-ld.tsx
    ...
  lib/
    sanity/        # client, queries, transform, image, site-settings, home-page, legal-pages
    actions/       # contact + newsletter server actions
    blog.ts        # async helpers + legacy fallback
    case-studies.ts
    services.ts
    schema.ts      # JSON-LD builders
    email.ts       # Resend wrapper
    consent.ts     # cookie consent state
  sanity/
    schemas/       # all Sanity document + object schemas
scripts/
  migrate-to-sanity.ts   # one-time seed (run via npx tsx)
sanity.config.ts          # Studio root config
```

## Out of scope (deferred)

- Multi-user / role-based admin permissions
- E-commerce checkout
- Native mobile app (PWA install is enabled)
- AI features
- Custom analytics dashboard inside the admin (use GA4 + Clarity + Search Console)
