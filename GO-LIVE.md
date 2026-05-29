# Go-Live — finish Nexol Media on Firebase (owner laptop)

**Run this on Nitesh's Mac**, in Claude Code, with the **Firebase MCP authenticated as `theniteshbandekar@gmail.com`**. Everything in code is done and pushed; only the owner-side cloud steps below remain. For deeper detail see `plan.md` (§2 setup, §8 rules, §9 deploy).

## Where things stand
- The in-house **Next.js + Firebase admin** is complete: `/admin` has Home, Settings, Services, Case Studies, **Blog**, **Authors**, **Media**, **Bookings**, **Users**, **Legal (privacy/terms)**, and **Services/Case-studies page** copy editors.
- The public site reads **Firestore** (Sanity fully removed). Booking submissions write to Firestore. Images use Firebase Storage.
- The site is **NOT public yet**: it was on Vercel (SSO-gated) and `nexolmedia.com` still serves the old Framer site. Nothing public changes until step **G** (DNS).

## Pre-flight (a few minutes)
1. `firebase_get_environment` → confirm active account is **theniteshbandekar@gmail.com**. If not: `firebase login:use theniteshbandekar@gmail.com`.
2. `git pull` (main; expect commit `0483ca9` or later).
3. `npm install`.
4. Confirm `.env.local` has: `NEXT_PUBLIC_FIREBASE_*` (6), `FIREBASE_SERVICE_ACCOUNT_KEY`, `GOOGLE_OAUTH_*` (3), `GOOGLE_CALENDAR_ID`, `BOOKING_OPERATOR_EMAIL`, `RESEND_*`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GSC_VERIFICATION` — all for **Nitesh's** Firebase project.
5. `npm run build` → must succeed locally before deploying.

## Steps

### A. (Optional) seed the two new "page copy" singletons
The Services page and Case-studies page copy are now editable but fall back to the current hardcoded text until saved once. Either open `/admin → Services page` and `Case studies page` and click **Save**, or leave them — the live pages look identical either way.

### B. Firebase Auth + admin user (likely already done in P2)
- Console → Authentication → ensure **Email/Password** is enabled.
- Ensure `theniteshbandekar@gmail.com` exists as a user with the **admin** claim: run `npx tsx --env-file=.env.local scripts/set-admin-claim.ts` (sets `role:admin` + writes `users/{uid}`). Add blog writers later via the console + `/admin/users` (set role to `writer`).

### C. App Hosting backend
- Create an **App Hosting backend** linked to GitHub repo **`theniteshbandekar/Nexol-Media`**, branch **`main`** (this is an interactive GitHub OAuth step in the Firebase console). After linking, every push to `main` auto-deploys.
- Flesh out **`apphosting.yaml`** (currently a scaffold): `runConfig` (memory ≥ 1Gi; `minInstances: 1` if you want no SSR cold starts), plus `env` — the `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GSC_VERIFICATION`, `BOOKING_OPERATOR_EMAIL`, `GOOGLE_CALENDAR_ID`, `RESEND_FROM_ADDRESS/REPLY_TO/TO_ADDRESS` vars (mark `NEXT_PUBLIC_*` `availability: [BUILD, RUNTIME]`).

### D. Secret Manager
Create secrets and reference them from `apphosting.yaml` (RUNTIME): `FIREBASE_SERVICE_ACCOUNT_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`. Grant the App Hosting service account **Secret Manager Secret Accessor** on each.

### E. Deploy + verify (on the App Hosting URL, before DNS)
- Deploy (push to `main`, or `firebase deploy`); check `firebase_deploy_status`.
- Verify 200s: `/`, `/blog`, a post, `/case-studies`, a case study, `/services`, each service, `/contact`, `/privacy`, `/terms`, `/admin/login`, `sitemap.xml`, `robots.txt`, `manifest.webmanifest`.
- Log into `/admin`: edit a post/service/case study, upload an image, toggle a route-visibility switch, confirm it reflects on the public route.
- Book a test slot → confirm a Google Calendar event on Nitesh's calendar + a `bookingRequests` doc + the Resend email.

### F. Deploy security rules
`firebase deploy --only firestore:rules,storage` (rules already in repo: deny-all client access; all reads/writes go through the Admin SDK). Verify with `firebase_get_security_rules`.

### G. DNS cutover (only when approved — this is what makes it public)
- Point `nexolmedia.com` from Framer → the App Hosting custom domain; add the custom domain in App Hosting; verify SSL.

### H. Post-cutover wiring
- Google Search Console: verify the domain, submit `sitemap.xml`.
- Google OAuth: add the production domain to the authorized redirect URIs (booking).
- Resend: verify the sending domain DNS (enables confirmation emails).
- Decommission the Vercel project and **rotate the shared Vercel token** noted in `handoff.md`.

## Done = 
Public `nexolmedia.com` served by Firebase App Hosting, `/admin` editable by Nitesh (+ writers for blog), bookings landing on Nitesh's calendar + Firestore, emails sending. Sanity and Vercel retired.
