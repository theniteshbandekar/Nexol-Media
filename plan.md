# Handoff: Replace Sanity with an in-house Next.js admin on Firebase

**For:** the Mac-side Claude Code instance with the **Firebase MCP authenticated as `theniteshbandekar@gmail.com`**.
**Repo:** Nexol Media — Next.js **16.2.6**, React 19.2.4, TypeScript, Tailwind v4, App Router.

> **How to use this file:** open the repo on Nitesh's MacBook in Claude Code (with the Firebase MCP connected as `theniteshbandekar@gmail.com`) and work through it in order. Start at §0 (Next 16 gotchas) and §2 (Firebase setup), then follow the phases in §10. Items flagged **[HUMAN]** need a person in the Firebase console.

## Context

The site is built and deployed (Vercel) but **not live** — DNS still points at the old Framer site, so there is no live-traffic risk during this migration. The owner wants to drop Sanity for an **in-house, fully Next.js-built admin dashboard** so they and blog writers can edit the live site (text, images, services, blogs, case studies) without touching code. Decided stack: **Firestore** (DB, editable in the Firebase console), **Firebase Auth** (owner + writers), **Firebase Storage** (images), **Firebase App Hosting** (SSR hosting), and a hand-built **`/admin`** in the existing app. Payload/Sanity were both rejected (Payload can't use Firestore). **All Firebase infra must be created under `theniteshbandekar@gmail.com`** — never the developer's personal account.

---

## 0. Next 16 is NOT the Next.js in your training data — read first

`AGENTS.md` is law. Before writing any route handler, config, `draftMode`, `revalidate`, or auth code, read the bundled docs under `node_modules/next/dist/docs/`. Two confirmed breaking changes you WILL hit:
1. **`middleware.ts` is gone — it's `proxy.ts`** (`.../03-file-conventions/proxy.md` — verified present). Export `proxy(request)` + `export const config = { matcher }`. Runs at the edge; do NOT import the Admin SDK there.
2. **`draftMode()`, `cookies()`, `headers()`, `params` are async** — `await` them (`.../04-functions/draft-mode.md`, `cookies.md`, `revalidatePath.md`).

---

## 1. Core design idea — the clean seam (do not break it)

Every page is an RSC that calls an `async getX()` fetcher in `src/lib/*` returning a **hand-written view type** (`BlogPost`, `CaseStudy`, `Service`, `HomePage`, `SiteSettings`, `LegalPage`). Components in `src/components/sections/*`, the detail pages, `sitemap.ts`, and all JSON-LD/SEO code consume **only those view types** — Sanity lives entirely behind `src/lib/sanity/`.

**The migration = swap the bodies of the `getX()` fetchers to read Firestore instead of Sanity, keeping every exported type and signature byte-identical.** If you hold that contract, components/pages/sitemap/SEO don't change at all. **Do not change the view types.**

Second key fact: the `__LEGACY_*`/`FALLBACK` constants already in `src/lib/blog.ts`, `case-studies.ts`, `services.ts`, `sanity/home-page.ts`, `sanity/site-settings.ts` (+ legal/home/settings literals in `scripts/migrate-to-sanity.ts`) are a **complete, clean seed** (~27 docs). Seed Firestore from them; never read Sanity.

```
            Firebase App Hosting (Next 16 SSR backend, linked to GitHub repo)
   ┌──────────────────┬──────────────────────┬─────────────────────┐
 Public site (RSC)   /admin (RSC+client)    Server Actions (booking, contact)
 getX() fetchers     login/dashboard/editors
   │ firebase-admin    │ client SDK (auth only)  │ firebase-admin
   ▼ (server reads)    ▼ + server actions write  ▼
   └──────────────── Firestore ─────────────────┘   Firebase Storage (images)
                                                     Firebase Auth (custom-claim role)
```
- **All public reads + all admin writes go through the Admin SDK** (server-side; bypasses security rules). The **client SDK is used only for Auth** inside `/admin`. So security rules lock out all direct client access.
- **Config/secrets:** public web config → `NEXT_PUBLIC_FIREBASE_*` (not secret). Admin SDK → one secret `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON). Keep the existing 18 env vars (Google Calendar, Resend, GA4, GSC); drop the 4 Sanity ones.

---

## 2. Firebase setup via MCP — the executing agent's first steps

Run in order. MCP does most of it; a few steps are console/CLI-only (flagged **[HUMAN]**).
1. **Verify identity:** `firebase_get_environment` → active account MUST be `theniteshbandekar@gmail.com`. If not, stop and have the owner switch (`firebase login:add` → sign in as Nitesh → `firebase login:use`). Do not proceed otherwise.
2. **Project:** `firebase_list_projects`; select the owner's project or `firebase_create_project` (id e.g. `nexol-media`). Capture **projectId**.
3. **Web app + config:** `firebase_create_app` (web) → `firebase_get_sdk_config` → the `NEXT_PUBLIC_FIREBASE_*` values.
4. **Init features:** `firebase_init` for **Firestore** (+rules+`firestore.indexes.json`), **Storage** (+rules), **App Hosting** — writes `firebase.json`, `firestore.rules`, `storage.rules`, `apphosting.yaml`. Use `developerknowledge_*` for version-specific flags.
5. **[HUMAN] Firestore DB + region:** create the `(default)` database if not auto-provisioned; pick region (e.g. `asia-south1` Mumbai). **Region is immutable.**
6. **[HUMAN] Auth:** enable Email/Password provider (console → Authentication → Sign-in method).
7. **[HUMAN] Service account key:** Project settings → Service accounts → Generate private key → paste JSON into `.env.local` as `FIREBASE_SERVICE_ACCOUNT_KEY` (for local seeding). (Or `gcloud auth application-default login`.)
8. **[HUMAN] First admin user:** add `theniteshbandekar@gmail.com` in Authentication, then run `scripts/set-admin-claim.ts` (`setCustomUserClaims(uid,{role:'admin'})`) + write `users/{uid}`.
9. **Env vars:** populate `.env.local` and prepare App Hosting runtime env + secrets (§9).
10. **Deploy rules** (§8) via `firebase_deploy` / CLI; verify with `firebase_get_security_rules`.

---

## 3. Firestore data model

Store each top-level content type as **one document with nested objects as embedded arrays-of-maps** (matches the view-type shapes). Only `blogAuthors` is separate (posts reference it). **Doc id = slug** for content with slugs.

- **`blogPosts/{slug}`**: title, slug, dek, category(enum), tags[], `authorId` **+ denormalized `author:{name,role,initials}`** (avoids N+1 on the index — no joins in Firestore), publishedAt, modifiedAt?, readTimeMinutes, `heroImage?:{src,alt}`, heroLabel?, **`body: BlogBlock[]` stored exactly as the render model** (§4.6), featured, published, timestamps.
- **`blogAuthors/{authorId}`** (id `author-{slug}`): name, role, initials, `avatar?:{src,alt}`.
- **`caseStudies/{slug}`**: name, role, slug, description?, `cardImage?:{src,alt}`, comingSoon, `title?:AccentHeading`, `stats?:[{num,label}]`, `rows?:[{num,heading:AccentHeading,body:{text,bold?},photo:{kind:'image',src,alt}|{kind:'placeholder',label},layout}]`, ctaHook?, publishedAt?, published.
- **`services/{slug}`** (5 canonical slugs): slug, num, title, tagline, pills[], description, deliverablesMeta, `deliverables:[{title,description,bullets[]}]`(×3), workHeading, workMeta, `workSamples:[{label, caseStudySlug?}]` (**store the slug string directly** — no ref resolution), metricsMeta, `metrics:[{num,label,context?}]`(×3), processMeta, `process:[{num,week,title,description}]`, ctaHeading, `faqs?:[{q,a}]`, published.
- **Singletons** (fixed ids): `singletons/homePage` (hero/vsl/stats/testimonials/hook), `singletons/siteSettings` (nav, footer groups, **routeVisibility** booleans), `singletons/servicesIndex` **(NEW** — the hardcoded copy in `services/page.tsx` lines 139-214: process steps, trust stats, CTA), `singletons/caseStudiesIndex` **(NEW** — header in `case-studies/page.tsx` line 123).
- **`legalPages/{privacy|terms}`**: kind, title, intro?, `body: LegalBlock[]` (keep the existing block shape), lastUpdated?.
- **Form capture:** `contactSubmissions/{autoId}`, `bookingRequests/{autoId}`. **`users/{uid}`**: {email, role:'admin'|'writer', displayName?}.

**Image field naming:** store images as `{src, alt}` (matching the view types' `StoryPhoto.src` / `cardImage.src`) so the fetcher mapping is a true identity. **Indexes:** these collections are tiny (10 posts, 4 case studies, 5 services) — fetch all + **filter `published` and sort in JS** inside the fetcher (the code already sorts via `sortByDateDesc`). This sidesteps composite indexes entirely; revisit only if a collection grows.

---

## 4. The dashboard — full feature spec

Hand-built at `/admin` in a new `(admin)` route group (own minimal layout — no marketing header/footer/Lenis). Styled with Tailwind v4 + existing CSS vars; correctness over polish. Editors are non-technical → **every field shows its label + a one-line hint lifted verbatim from the Sanity schema `title`/`description` strings** (reuse that microcopy).

**Routes** (`src/app/(admin)/admin/`): `layout.tsx` (server `requireAuth` + sidebar), `login/`, `page.tsx` (dashboard home: counts + drafts + quick-create), `home/` (homepage editor), `settings/` (nav/footer/routeVisibility), `pages/services-index`, `pages/case-studies-index`, `pages/privacy`, `pages/terms`, `blog/` + `blog/new` + `blog/[slug]`, `authors/` + `authors/[id]`, `case-studies/` + `new` + `[slug]`, `services/` + `[slug]`, `media/` (Storage browser+upload), `submissions/` + `bookings/` + `users/` (admin-only).

**Shared primitives** (`src/components/admin/`, build once): `<TextField>/<TextArea>/<NumberField>/<Toggle>/<SelectField>` (labeled + hint); **`<AccentHeadingField>`** (before/accent/after with live lime-accent preview); **`<RepeaterField>`** (array-of-maps card list with **add / remove / reorder up-down**, render-prop + `emptyItem` factory — used for deliverables, metrics, process, work samples, faqs, story rows, stats, testimonials, nav, footer links, bullets, tags); **`<ImagePickerField>`** (current image + alt + upload/choose); **`<RichTextEditor>`** (TipTap, §4.6); **`<SaveBar>`** (Save / Save&Publish / View-on-site / dirty + toast).

Each editor page = thin **client component** holding form state, hydrated by its RSC parent (Admin-SDK fetch), saving via a **server action** (`src/lib/actions/admin/*`) that re-verifies role, writes via Admin SDK, then `revalidatePath(...)` for the touched routes.

- **4.1 Login:** client `signInWithEmailAndPassword` → POST ID token to `/admin/api/session` → Admin SDK `createSessionCookie` (httpOnly) → redirect. Inline errors.
- **4.2 Dashboard home:** counts (posts/drafts/case studies/services/new submissions/bookings) + drafts list + quick-create; role-aware tiles.
- **4.3 Homepage:** 5 sections — Hero (`<AccentHeadingField>` h1, tagline, scrollCue), VSL (title/duration/videoUrl/poster image), Stats (repeater ×3 `{target,suffix?,comma?,label}`), Testimonials (repeater 2-8 with **type=text|video** conditional fields + span 1-4), Hook (`<AccentHeadingField>` h2 + secondary-links repeater max 4). Save → `revalidatePath('/')`.
- **4.4 Site settings (the hide/unhide feature):** nav repeater; header CTA; footer tagline + 3 link-group repeaters; footerLocation/Rights; **routeVisibility = 5 toggles** (blog/caseStudies/services/about/contact) with the exact hint from `site-settings.ts`. Save → `revalidatePath('/', 'layout')` + `revalidatePath('/sitemap.xml')`. **Fix the footer bug here:** pass `routeVisibility` into `<SiteFooter>` and filter links to hidden routes (currently it always renders all 6 Company links).
- **4.5 Services & Case Studies CRUD (deepest UI):** services editor grouped (Content / Deliverables[×3, each with nested bullets repeater] / Work+Metrics[workSamples with case-study-slug `<SelectField>`; metrics ×3] / Process[2-6] / FAQs / Publishing). Case-studies editor: name/slug/role/description, cardImage, title `<AccentHeadingField>`, stats (max 4), **story-rows repeater** (each: num, heading AccentHeading, body{text,bold?}, photo{kind image→ImagePicker+alt | placeholder→label}, layout radio), publish toggles. Save → revalidate the index + `[slug]` page.
- **4.6 Blog rich-text (highest risk — exact round-trip):** the renderer `BlogBody` (`blog/[slug]/page.tsx` lines 76-131) consumes a closed union `BlogBlock[]`: `{p,text,dropCap?}|{h2,num,text}|{ol,items[]}|{ul,items[]}|{quote,text,by?}|{figure,placeholderLabel,caption?}`. **Store `body` in Firestore directly AS `BlogBlock[]`** → read path is identity; the old `transformBlogBody` logic moves into the editor's serializer (then `transform.ts` is deleted). Use **TipTap** (client-only). Serialize: paragraph→`p` (first-para **drop-cap** toggle), H2→`h2` with **auto-numbered `num`** = zero-padded running count (reproduce `transform.ts` lines 131-144, strip any typed `(NN)`), lists→`ol`/`ul` (item text→array), blockquote→`quote` (+optional `by`), custom Figure→`figure` (label+caption). Deserialize `BlogBlock[]`→TipTap on load. **Write round-trip tests** `serialize(deserialize(x))==x` on all 10 seed posts (esp. `hook-gordon-ly-million-subs`).
- **4.7 Image picker / `/admin/media`:** upload via server action → Admin SDK Storage `uploadImage()` → returns `{src,alt}` stored on the doc; path `images/{collection}/{slug}/{file}`. Media page lists `bucket.getFiles()`. **Alt text required** (SEO). Writers may upload.
- **4.8 Draft/publish/preview:** every doc has `published`; fetchers filter `published !== false` (matches Sanity `&& published==true`). Preview: `/admin/api/preview?path=...` → `await draftMode().enable()` → redirect; disable route clears it. Fetchers do `const {isEnabled}=await draftMode()` and include drafts when on. **Replaces** the Sanity `/api/draft-mode/*`.

---

## 5. Auth & roles

Firebase Auth email/password. **Role = custom claim (authoritative) + `users/{uid}` doc (for listing).** Set via Admin SDK `setCustomUserClaims(uid,{role})`. Two-layer protection: (1) **`src/proxy.ts`** (NOT middleware) matcher `'/admin/:path*'` minus `/admin/login` + session route — coarse cookie-presence check only (edge, no Admin SDK); (2) **real gate in `(admin)/admin/layout.tsx`**: `await getCurrentUser()` verifies the session cookie + role, redirect if null. Every admin server action calls `requireAdmin()`/`requireWriter()`. **Writers:** blogPosts + blogAuthors + media only. **Admin-only:** everything else. **Claim-propagation gotcha:** new claims need a fresh token — force `getIdToken(true)` or re-login; note "role takes effect on next sign-in" in the users page.

---

## 6. Frontend data-layer rewrite

New `src/lib/firebase/`: **`admin.ts`** (`import "server-only"`; cold-start-safe singleton `getApps().length?getApp():initializeApp({credential:cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY)), storageBucket})`; export `adminDb`, `adminStorage`), **`client.ts`** (client SDK, `auth` only), **`auth.ts`** (`getCurrentUser`/`requireAdmin`/`requireWriter` via session cookie + `verifySessionCookie`), **`storage.ts`** (`uploadImage`→downloadURL), **`collections.ts`** (collection names + singleton ids).

**Query map** (all via `adminDb`, keep signatures): `getAllBlogPosts` = `collection('blogPosts').get()` → filter+`sortByDateDesc` in JS (`cachedAll` stays); `getPost(slug)`/`getCaseStudy`/`getService` = `doc('.../'+slug).get()`; `getFeaturedPost` = `.find(featured)` from cache; `getAllCaseStudies` = all → filter+sort (`comingSoon asc, publishedAt desc`); `getAllServices` = all → sort `num`; `getHomePage`/`getSiteSettings`/`getLegalPage` = singleton `doc().get()` **merged over the existing `FALLBACK`** (keep the backfill-merge logic). `generateStaticParams` keeps using `getAllX()`.

**Keep** these files at their current paths (so importers don't move): `src/lib/blog.ts`, `case-studies.ts`, `services.ts`, `sanity/home-page.ts`, `sanity/site-settings.ts`, `sanity/legal-pages.ts`, `nav.ts` (folder rename to `content/` is an optional later cosmetic pass). **Legal renderer:** replace `@portabletext/react` in `src/components/legal-page.tsx` with a small `switch` over the existing `LegalBlock` cases (h2/h3/normal/bullet/strong/em/link). **Revalidate-on-save** in every admin action.

**Write-path repoint:** `src/lib/actions/booking.ts` (~lines 214-233) → `adminDb.collection('bookingRequests').add(...)` (keep the try/catch non-fatal behavior; email still sends). **Contact:** there is currently **NO contact write action** (verified — `contactSubmission` exists only as a Sanity schema; the contact page only books calls). Add `src/lib/actions/contact.ts` → `contactSubmissions` **only if** the owner wants the brief form persisted — confirm.

**Delete:** `sanity.config.ts`, `src/sanity/**`, `src/app/studio/**`, `src/components/visual-editing.tsx`, `src/app/api/draft-mode/**`, `src/lib/sanity/{client,queries,transform,image}.ts`, `scripts/migrate-to-sanity.ts`. In `(site)/layout.tsx` remove `VisualEditingMount` (keep `draftMode()`), pass `routeVisibility` to footer. **package.json:** remove `@sanity/*`, `next-sanity`, `sanity`, `@portabletext/react`, `styled-components` (+ `shadcn` if unused — verify); add `firebase`, `firebase-admin`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`.

---

## 7. Seed — `scripts/seed-firestore.ts`

Model on `scripts/migrate-to-sanity.ts` (idempotent, image upload, ref handling) but with `firebase-admin`. Import `__LEGACY_BLOG_POSTS` (blog.ts), `__LEGACY_CASE_STUDIES` (case-studies.ts), `__LEGACY_SERVICES` (services.ts) — **all verified present** — plus `FALLBACK` home/settings, and legal/index literals from the migrate script + page files. Dedupe authors (id `author-{slug}`) + build the denormalized `author` snapshot. **Write blog `body` straight from the legacy `BlogBlock[]`** (no conversion). Upload `public/case-studies/adrien-ninet.png` (the only real image) → store `{src:downloadURL,alt}`; placeholders stay. Use `doc(id).set(data)` (idempotent). **Use the runtime `FALLBACK` values** for settings — `headerCtaHref:'/contact#book'` (NOT the migrate script's `/book`) and `routeVisibility {blog:false,caseStudies:false,services/about/contact:true}` so the seeded site matches today's behavior; flag the `/book` vs `/contact#book` discrepancy to the owner. Also seed `scripts/set-admin-claim.ts`. Run: `npx tsx --env-file=.env.local scripts/seed-firestore.ts` (~30 docs).

---

## 8. Security rules

All public reads + admin writes use the Admin SDK (bypasses rules); client SDK is auth-only. So **deny all client access**: Firestore `match /{document=**} { allow read, write: if false; }`; Storage `match /{allPaths=**} { allow read, write: if false; }`. `next/image` fetches images via **tokenized download URLs** which work regardless of Storage rules (verify via `developerknowledge`). Deploy with `firebase_deploy` / `firebase deploy --only firestore:rules,storage`.

---

## 9. Deploy & cutover (App Hosting, SSR)

Link an App Hosting **backend to the GitHub repo** (branch `main`; GitHub OAuth is a console step). **`apphosting.yaml`:** `runConfig` (memory; `minInstances:1` if SSR cold-start latency matters, else 0 for cost); runtime env = `NEXT_PUBLIC_FIREBASE_*` + `NEXT_PUBLIC_GA_ID`/`GSC`/`CLARITY` + booking/Resend non-secret vars (`availability:[BUILD,RUNTIME]` for `NEXT_PUBLIC_*`); **secrets** (Secret Manager, RUNTIME): `FIREBASE_SERVICE_ACCOUNT_KEY`, `GOOGLE_OAUTH_*`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` — grant the App Hosting service account access. **`next.config.ts`:** swap `images.remotePatterns` from `cdn.sanity.io` to the Firebase Storage host (verify the exact host of a seeded image URL — `firebasestorage.googleapis.com` and/or `*.firebasestorage.app`); keep the `/work→/case-studies` redirect, headers, and `/book` noindex.

**Cutover (low risk — not live yet):** deploy → verify all routes 200 on the App Hosting URL (mirror `handoff.md` §7 list: `/`, `/blog`, a post, `/case-studies`, a case study, `/services`, each service, `/contact`, `/privacy`, `/terms`, `/admin/login`, `sitemap.xml`, `robots.txt`, `manifest.webmanifest`) → verify `/admin` login + a save round-trip + revalidation → verify booking creates a calendar event + `bookingRequests` doc → when approved, point DNS (Framer→App Hosting custom domain), update GSC + Google OAuth redirect URIs + Resend domain (`handoff.md` post-cutover list) → **remove Vercel** and rotate the shared Vercel token noted in `handoff.md`.

---

## 10. Phases & effort (solo dev)

| Phase | Days | Risk |
|---|---|---|
| P0 Firebase infra + MCP setup (§2) | 0.5–1 | Med (console steps, region, GitHub link) |
| P1 Firebase code layer (`src/lib/firebase/*`, session auth) | 1–1.5 | Med |
| P2 Seed script + `set-admin-claim` + run | 1–1.5 | Med |
| P3 Fetcher rewrite (the seam) + legal renderer + delete Sanity reads | 2–3 | Med-High |
| P4 Admin shell + auth (`proxy.ts`, layout guard, login, session) | 2–3 | Med-High |
| P5 Editor primitives (`RepeaterField`, `AccentHeadingField`, `ImagePicker`, `SaveBar`, actions) | 2–3 | Med |
| P6 Singleton + simple editors (home, settings+footer fix, indexes, legal, authors, media, lists) | 3–4 | Med |
| P7 Deep-nested CRUD (services + case-study story rows) | 3–4 | **High** |
| P8 Rich-text + `BlogBlock[]` round-trip + tests | 3–5 | **Highest** |
| P9 Write-path repoint + remove Sanity deps/studio/visual-editing | 1 | Low-Med |
| P10 App Hosting deploy + cutover + remove Vercel | 1.5–3 | **High** |

**Total ≈ 21–32 working days (~4.5–6.5 weeks); banded 4–7 weeks.** Front-load a 1-day **P8 TipTap round-trip spike** and a 0.5-day **P10 hello-world SSR deploy spike** before committing the schedule.

---

## 11. Risks & gotchas

1. **Next 16 ≠ training data** — `proxy.ts` (not middleware); async `draftMode/cookies/headers/params`. Read the bundled docs first. #1 time-sink.
2. **firebase-admin in RSC** — init once behind `getApps().length`; `import "server-only"`; cold starts on `minInstances:0`.
3. **App Hosting + SSR Next 16 is new** — confirm runtime supports it; no `output:'export'`; **verify the Storage download-URL host** and add to `remotePatterns` or `next/image` 400s.
4. **Custom-claim propagation** — fresh token needed after role change; session cookie re-mint.
5. **Firestore modeling** — no joins (denormalized author snapshot + slug-based cross-links); whole-array saves on repeaters; 1 MiB/doc (fine); composite indexes avoided by JS filter/sort on tiny collections.
6. **Keep SEO/JSON-LD/sitemap identical** — they consume the view types, so they're unchanged if §1's contract holds. Preserve `isThinPost`'s exact placeholder string through the seed.
7. **Footer routeVisibility bug** — fix in P6; revalidate `/`(layout) + section + sitemap on toggle.
8. **CTA href** `/book` (old seed) vs `/contact#book` (runtime FALLBACK) — seed the runtime value; confirm with owner.
9. **Booking write stays non-fatal**; **contact write is net-new** (confirm need).
10. **Draft mode** needs third-party cookies; test on the deployed HTTPS URL.

## Verification

- `npm run dev`: public site renders identically from Firestore with Sanity fully removed; `/admin/login` works; create/edit a post, service, case study; upload an image; toggle a routeVisibility switch and confirm the page/nav/sitemap change.
- Round-trip tests pass on all 10 seed posts (`serialize(deserialize)`); blog body renders pixel-identical (numbered H2, drop cap, pullquote, figure).
- SEO unchanged: JSON-LD (article/breadcrumb/itemList/org), `sitemap.xml`, `robots.txt`, OG/meta, thin-post noindex.
- Booking creates a Google Calendar event (owner's calendar) + a `bookingRequests` doc; Resend email still sends.
- Deployed App Hosting URL: all routes 200; `/admin` save → `revalidatePath` reflects on the public route.

## Critical files
- `src/lib/blog.ts` — `BlogBlock`/`BlogPost` types + fetchers + `__LEGACY_BLOG_POSTS` (seam + round-trip target + seed source).
- `src/lib/sanity/transform.ts` — numbered-H2 + drop-cap + figure/pullquote logic the TipTap serializer must reproduce (then delete).
- `src/app/(site)/blog/[slug]/page.tsx` — `BlogBody` (lines 76-131); the exact `BlogBlock[]` contract.
- `src/lib/sanity/site-settings.ts` — `SiteSettings`/`routeVisibility` + `FALLBACK` (hide/unhide + footer fix).
- `src/lib/services.ts` / `case-studies.ts` — deepest nested types + `__LEGACY_*` (P7 editors + seed).
- `scripts/migrate-to-sanity.ts` — structural template for `scripts/seed-firestore.ts`.
- `next.config.ts`, `apphosting.yaml`(new), `firestore.rules`/`storage.rules`(new), `src/proxy.ts`(new).
