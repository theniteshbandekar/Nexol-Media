# Nexol Media — Project Handoff (full change log & current state)

_Last updated: 2026-05-28_

The **master handoff**: everything done to take the site from a bare GitHub repo to a
deployed-but-not-yet-live Vercel app, the current state, and what's left. For depth, see:
- **[niteshlaptop.md](niteshlaptop.md)** — original service-by-service setup guide (Parts A/B/C).
- **[vercel-handoff.md](vercel-handoff.md)** — Vercel access + how to deploy / continue.

> **No secrets are in this file.** They live in `.env.local` (local, gitignored) and in
> Vercel → Settings → Environment Variables.

---

## TL;DR — current state
| Area | Status |
|---|---|
| New site (Next.js 16 + Sanity) | ✅ Deployed to Vercel **production**, all routes verified 200 |
| Public access to the new site | 🔒 Only via Vercel preview URL (SSO-gated `*.vercel.app`) |
| `nexolmedia.com` | ⚠️ **Still the OLD Framer site** — DNS NOT cut over (on hold) |
| CMS (Sanity) | ✅ Seeded + live, editable at `/studio` |
| Booking → Google Calendar | ✅ Lands on **theniteshbandekar@gmail.com** |
| Analytics | ✅ GA4 + GSC IDs set · ⬜ Microsoft Clarity (B4) pending |
| Email (Resend / B5) | ⬜ Pending (needs DNS) — confirmation emails don't send yet |

**Nothing about the live site, DNS, or Framer was changed.** Go-live is awaiting sign-off.

---

## What changed (chronological)

### 1. Local machine / tooling
- Installed **Xcode Command Line Tools** (provides **git 2.50.1**) — none were present.
- Confirmed **Node v24.14.1 / npm 11.11.0** (meets Next.js 16's Node 20+ requirement).

### 2. Repo
- Cloned **`github.com/theniteshbandekar/Nexol-Media`** → `/Users/niteshbandekar/Desktop/New Project/Nexol-Media`.
- `npm install` → **1517 packages**. (20 moderate transitive vulns; `npm audit fix` deliberately NOT run to avoid breaking changes.)

### 3. Environment (`.env.local` — gitignored)
- Created `.env.local` (the committed `.env.example` was missing/gitignored) with the 18 env vars the code reads.
- Filled values for Google booking, Sanity, GA4, GSC, and Resend from/to/reply.
- Later edits: `BOOKING_OPERATOR_EMAIL` → `theniteshbandekar@gmail.com`; `GOOGLE_OAUTH_REFRESH_TOKEN` re-issued (see §6).
- Still blank: `NEXT_PUBLIC_CLARITY_ID`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`.

### 4. Sanity CMS (guide step B2)
- Connected project **`hb0yftnj`**, dataset **`production`**.
- Ran `npx tsx --env-file=.env.local scripts/migrate-to-sanity.ts` → seeded **27 documents**:
  5 authors, 10 blog posts, 4 case studies, 5 services, home page, site settings, 2 legal pages.
- Verified the read token can query the content. Studio works at `/studio` (will need CORS for the prod domain later).

### 5. Local verification
- Ran `npm run dev` (http://localhost:3000); confirmed pages render with Sanity content.
- Verified **B1 (Google Calendar)**: refresh token valid, freebusy reachable.

### 6. Booking → Google Calendar fix
- **Found:** bookings were landing on **dhrupadrajpurohit@gmail.com** (the OAuth token's account), not Nitesh.
- **Fixed:** re-ran `scripts/get-google-refresh-token.ts`, authorized as **theniteshbandekar@gmail.com**,
  replaced `GOOGLE_OAUTH_REFRESH_TOKEN`, and set `BOOKING_OPERATOR_EMAIL=theniteshbandekar@gmail.com`.
- **Verified** with a silent (auto-deleted) test event: bookings now create on
  **theniteshbandekar@gmail.com**'s calendar with a Google Meet link, Nitesh as host.

### 7. Vercel deployment
- Linked project **`nexolmedia`** (team **`nexol-media-s-projects`**) via the CLI (token-based, no browser login).
- Pushed all **18 env vars** to **Production + Preview** using the Vercel **REST API**
  (the CLI's `vercel env add` mis-handles `NEXT_PUBLIC_*` non-interactively).
- Deployed to production with `vercel deploy --prod`.
- **Bug found + fixed:** the project's framework was **"None"**, so every route returned
  `404: NOT_FOUND`. Set framework to **Next.js** and redeployed.
- **Verified** (temporarily lifted SSO protection, then restored): all routes — `/`, `/blog`,
  blog posts, case studies, services, `/contact`, `/studio`, `/privacy`, `/terms`, `sitemap.xml`,
  `robots.txt`, `manifest.webmanifest` — return **200**; Sanity content renders; sitemap has 13 URLs.
- Synced the booking env change (§6) to Vercel + redeployed.

### 8. Docs
- Created **[vercel-handoff.md](vercel-handoff.md)** (Vercel access + deploy) and this **handoff.md**.

---

## Files added / changed in the repo
- **Added (safe to commit):** `vercel-handoff.md`, `handoff.md`.
- **Gitignored (not committed):** `.env.local`, `.vercel/`, `next-env.d.ts`, `node_modules/`.
- **No tracked application/source code was modified.**

## Config changes made outside the repo
- **Vercel:** project created/linked; 18 env vars set; framework set to Next.js; deployment
  protection briefly toggled for verification then **restored** (`all_except_custom_domains`).
- **Sanity:** dataset `production` seeded with content.
- **Google:** OAuth re-authorized as `theniteshbandekar@gmail.com` (new refresh token issued).
- **macOS:** Xcode Command Line Tools installed.

---

## Live vs not-live (read this)
- **`nexolmedia.com` still serves the existing Framer site** — DNS untouched (apex A records still point to Framer).
- The new Vercel site is reachable **only** at its SSO-protected `*.vercel.app` URL — open it while signed in to Vercel.
- **Go-live (DNS cutover) is on hold pending review.**

## What's left
- [ ] **Review** the new site on the Vercel preview URL.
- [ ] **B4 — Microsoft Clarity:** set `NEXT_PUBLIC_CLARITY_ID`, redeploy.
- [ ] **B5 — Resend:** verify domain DNS, set `RESEND_API_KEY` + `RESEND_AUDIENCE_ID`, redeploy (enables confirmation emails).
- [ ] **DNS cutover** (Framer → Vercel) when approved — steps in [vercel-handoff.md](vercel-handoff.md) §6.
- [ ] **Post-cutover wiring:** Sanity CORS (prod domain), Google OAuth redirect URI, GSC verify, submit sitemap — [vercel-handoff.md](vercel-handoff.md) §6.

## How to continue / deploy
See **[vercel-handoff.md](vercel-handoff.md)** for Vercel access, `vercel deploy --prod`,
env-var management, and the gotchas (framework must be `nextjs`; push env via API; the SSO 401
on `*.vercel.app` is expected). Original service setup is in **[niteshlaptop.md](niteshlaptop.md)**.

## Security
- These `.md` docs contain **no secrets**. Secrets live in `.env.local` (gitignored) and Vercel's
  Environment Variables — share `.env.local` through a secure channel (password manager), never commit it.
- ⚠️ The Vercel access token used during setup was shared in chat — **rotate it** at
  https://vercel.com/account/tokens, and have each developer create their own.
