# Nexol Media — Vercel & Deployment Handoff

For any developer (e.g. Dhrupad) continuing the deployment. Covers Vercel access,
deploying, env vars, the gotchas we hit, the domain cutover, and the booking setup.

> **No secrets are in this file.** All secrets live in `.env.local` (local, gitignored)
> and in Vercel → Project → Settings → Environment Variables. Get `.env.local` from the
> team through a secure channel — never commit it or paste it in chat/PRs.

---

## 1. Access to request first
- **Vercel team `nexol-media-s-projects`** — ask the owner to invite your email
  (Vercel → team → Settings → Members → Invite). Then you can see the project + deploys.
- **Your own Vercel CLI token** — create at https://vercel.com/account/tokens.
  Never share or commit it. If scripting, keep it in `~/.vercel_token` (`chmod 600`).
- **GitHub repo:** `github.com/theniteshbandekar/Nexol-Media`
- **Sanity** (CMS): project `hb0yftnj`, dataset `production` — ask to be added at sanity.io/manage.
- **GCP "Nexol Booking"** (only if touching Google Calendar booking): console.cloud.google.com.
- **Hostinger** DNS for `nexolmedia.com` (only for go-live cutover).

### IDs (not secret)
| Thing | Value |
|---|---|
| Vercel project | `nexolmedia` |
| Vercel project ID | `prj_nkGG0SdU8qmkGOrBcXrgfb8ZjDo5` |
| Vercel team ID | `team_ykdHyFdM8CuNT0vkYZ5cSe9K` |
| Sanity project / dataset | `hb0yftnj` / `production` |

---

## 2. Local setup
```bash
git clone https://github.com/theniteshbandekar/Nexol-Media.git
cd Nexol-Media
npm install
# obtain .env.local from the team (gitignored — never commit)
npm run dev          # http://localhost:3000  (Studio at /studio)
```
Node 20+ required (currently built on Node 24). Full service-by-service setup is in
[`niteshlaptop.md`](niteshlaptop.md).

---

## 3. Deploying to Vercel (CLI — this is how we ship)
From the repo root:
```bash
vercel login                  # or: export VERCEL_TOKEN=<your token>
vercel link                   # link this folder to the "nexolmedia" project (first time)
npx vercel deploy             # preview deploy → *.vercel.app URL
npx vercel deploy --prod      # PRODUCTION deploy
```
- Deploys are **manual** — no GitHub auto-deploy is configured. Run `vercel deploy --prod` to ship.
- Useful: `vercel ls`, `vercel logs <url>`, `vercel inspect <url>`.

### ⚠️ Framework MUST be "Next.js"
The project was once set to framework **Other**, which made **every route return
`404: NOT_FOUND`** even though `next build` succeeded. It's fixed now (framework = nextjs).
If you ever recreate/relink the project, set **Settings → Build & Deployment →
Framework Preset = Next.js**, or via API:
`PATCH https://api.vercel.com/v9/projects/<pid>?teamId=<team>` with `{"framework":"nextjs"}`.

---

## 4. Environment variables
- **Source of truth:** `.env.local` (local, gitignored). ~18 vars (Sanity, Google booking,
  GA4, GSC, Resend). What each one is → see [`niteshlaptop.md`](niteshlaptop.md).
- **On Vercel:** set for **Production + Preview** (Project → Settings → Environment Variables).
- **`NEXT_PUBLIC_*` are baked in at build time** → after changing one, you must **redeploy**.

### Pushing env vars (gotcha)
`vercel env add` is painful non-interactively (it shows an interactive confirm for
`NEXT_PUBLIC_*` vars and can hang). Use one of:
- **Dashboard:** paste the whole `.env.local` block into the Env Vars "Key" field — Vercel auto-splits it.
- **REST API (scriptable, idempotent):**
  `POST https://api.vercel.com/v10/projects/<pid>/env?upsert=true&teamId=<team>`
  body `{"key":"...","value":"...","type":"encrypted","target":["production","preview"]}`
- Check/compare: `vercel env ls production` · `vercel env pull /tmp/x.env --environment=production`

---

## 5. Deployment protection (why `*.vercel.app` gives 401)
Project has **Vercel Authentication = Standard** (`all_except_custom_domains`):
- `*.vercel.app` deployment URLs → **401** unless you're logged into Vercel. Open them
  while signed in, or use the dashboard "Visit" button.
- The custom domain (once DNS is pointed) is **public**.
This is intentional — don't disable it to "fix" the 401.

---

## 6. Domains / go-live — NOT done yet (on hold)
**Current:** `nexolmedia.com` still serves the **old Framer site** (apex A records
`35.71.142.77`, `52.223.52.2`). The domains are added + verified on Vercel, but DNS is
**not** pointed at Vercel. Going live is **on hold pending sign-off** — do not change DNS
without approval (it replaces the live Framer site).

When approved, at **Hostinger → DNS Zone Editor**:
- Replace the apex `@` A records with **A `@` → 76.76.21.21**
- Add **CNAME `www` → cname.vercel-dns.com**

Vercel then 308-redirects `nexolmedia.com` → `www.nexolmedia.com` (canonical); SSL auto-issues.

### Immediately after cutover
- **Sanity CORS:** sanity.io/manage → project `hb0yftnj` → API → CORS → add
  `https://www.nexolmedia.com` (and apex), **Allow credentials**. Required for `/studio`.
- **Google OAuth:** add redirect URI `https://www.nexolmedia.com/api/oauth/google/callback`;
  publish the consent screen (or keep test users).
- **Search Console:** click Verify (the GSC meta tag is now live) → submit
  `https://www.nexolmedia.com/sitemap.xml`.

---

## 7. Booking → Google Calendar
- Bookings on `/contact` create events on **theniteshbandekar@gmail.com**'s calendar
  (`GOOGLE_CALENDAR_ID=primary`; the refresh token is authorized as Nitesh).
  Host/invitee = `BOOKING_OPERATOR_EMAIL=theniteshbandekar@gmail.com`.
- The calendar = whoever authorized the OAuth refresh token. **To re-issue it** (e.g. revoked,
  or to change the calendar):
  1. Stop `npm run dev` (frees port 3000).
  2. `npx tsx scripts/get-google-refresh-token.ts`
  3. Open the printed URL, **sign in as the target Google account**, approve.
  4. Put the printed token into `GOOGLE_OAUTH_REFRESH_TOKEN` (local **and** Vercel), then redeploy.
  - The account must be a **Test user** on the "Nexol Booking" OAuth consent screen.
- Confirmation **emails** to the booker need Resend (Section 8); Google's own invite sends regardless.

---

## 8. Sanity CMS
- Edit content at `/studio`. Project `hb0yftnj`, dataset `production`.
- Re-seed from code (idempotent): `npx tsx --env-file=.env.local scripts/migrate-to-sanity.ts`
  — note the **`--env-file`** flag; this script does not auto-load `.env.local`.

---

## 9. Still to do
- [ ] **B4 — Microsoft Clarity:** set `NEXT_PUBLIC_CLARITY_ID` (clarity.microsoft.com) → redeploy.
- [ ] **B5 — Resend:** verify domain DNS at Hostinger, set `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` → redeploy.
      (Until then, contact/booking confirmation emails don't send.)
- [ ] **DNS cutover** (Section 6) once signed off.
- [ ] **Post-cutover wiring** (Section 6).

## Quick reference
| Task | Command / value |
|---|---|
| Deploy to prod | `npx vercel deploy --prod` (repo root) |
| Push an env var | dashboard paste, or API upsert (Section 4) |
| Redeploy after env change | `npx vercel deploy --prod` |
| Re-auth booking calendar | `npx tsx scripts/get-google-refresh-token.ts` |
| Re-seed Sanity | `npx tsx --env-file=.env.local scripts/migrate-to-sanity.ts` |
| Booking calendar | theniteshbandekar@gmail.com |
| Domain status | nexolmedia.com still on Framer — cutover pending |
