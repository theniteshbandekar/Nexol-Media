# Nexol Media — Setup & Launch Guide (Nitesh's Mac)

This is the Nexol Media website (Next.js 16 + Sanity CMS). The code is **done**;
what remains is connecting live services — all of which need your accounts.
This guide takes the site from "running on placeholder data on a laptop" to
"fully live on nexolmedia.com."

> **For the Claude Code agent on this Mac:** Read `AGENTS.md` and `README.md`
> first for project conventions. Then help Nitesh work through Part B task by
> task. Never commit `.env.local` or print secrets into any committed file.

---

## Part A — Get the project running locally (~15 min)

### A1. Install tools (skip any you already have)
```bash
# Xcode command-line tools (gives you git)
xcode-select --install

# Node 20+ via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# restart terminal, then:
nvm install 20 && nvm use 20
node -v          # should print v20.x or higher
```

### A2. Clone the repo
```bash
cd ~/Projects        # or wherever you keep code
git clone https://github.com/theniteshbandekar/Nexol-Media.git
cd Nexol-Media
```

### A3. Install dependencies
```bash
npm install
```

### A4. Create your local secrets file
```bash
cp .env.example .env.local
```
Leave the values blank for now — you'll fill them in Part B. The site runs on
built-in placeholder data until then.

### A5. Start it
```bash
npm run dev
```
Open http://localhost:3000 — you should see the full site. Open
http://localhost:3000/studio — the CMS admin (will ask to connect a project in B2).

---

## Part B — Wire up live services (do in order)

Each value below goes into `.env.local`. After editing `.env.local`, restart
`npm run dev` for changes to take effect.

### B1. Google Calendar booking — events land on YOUR calendar
The `/contact` booking flow creates Google Calendar events with Meet links.

1. Go to https://console.cloud.google.com → project **"Nexol Booking"**.
2. APIs & Services → **Credentials** → open the OAuth 2.0 Client. Copy the
   **Client ID** and **Client secret** into `.env.local`:
   - `GOOGLE_OAUTH_CLIENT_ID=...`
   - `GOOGLE_OAUTH_CLIENT_SECRET=...`
3. In that same OAuth client, confirm **Authorized redirect URIs** includes:
   `http://localhost:3000/api/oauth/google/callback`
4. APIs & Services → OAuth consent screen → **Audience** → Test users → ensure
   `theniteshbandekar@gmail.com` is listed.
5. Stop the dev server (the next script needs port 3000), then run:
   ```bash
   npx tsx scripts/get-google-refresh-token.ts
   ```
6. Open the printed URL in a browser signed into **theniteshbandekar@gmail.com**,
   click Advanced → Allow. Copy the printed token into `.env.local`:
   - `GOOGLE_OAUTH_REFRESH_TOKEN=...`
7. Confirm these too (already defaulted in `.env.example`):
   - `GOOGLE_CALENDAR_ID=primary`
   - `BOOKING_TIMEZONE=Asia/Kolkata`
   - `BOOKING_OPERATOR_EMAIL=theniteshbandekar@gmail.com`
8. `npm run dev`, go to `/contact`, book a test slot → it should appear on your
   Google Calendar with a Meet link, and you + the booker get invite emails.

### B2. Sanity CMS — so you can edit the site yourself (no developer needed)
Right now all content is hardcoded. This makes it editable at `/studio`.

1. Go to https://sanity.io/manage → log in → **Create new project**
   (name it "Nexol Media", dataset `production`).
2. Copy the **Project ID** into `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID=...`
   - `NEXT_PUBLIC_SANITY_DATASET=production`
3. In the project → **API** → Tokens → create two tokens:
   - An **Editor** token → `SANITY_API_WRITE_TOKEN=...`
   - A **Viewer** token → `SANITY_API_READ_TOKEN=...`
4. In the project → **API** → CORS origins → add `http://localhost:3000`
   (and later your production domain).
5. Seed the CMS with all the current content (one-time):
   ```bash
   npx tsx scripts/migrate-to-sanity.ts
   ```
6. `npm run dev` → open http://localhost:3000/studio → you can now edit every
   page, blog post, case study, and service from the browser.

### B3. Google Analytics 4
1. https://analytics.google.com → Admin → Create Property for nexolmedia.com.
2. Create a **Web** data stream → copy the **Measurement ID** (`G-XXXXXXXXXX`):
   - `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
   (Analytics only loads after a visitor accepts the cookie banner.)

### B4. Microsoft Clarity (heatmaps + session replay)
1. https://clarity.microsoft.com → log in → New project for nexolmedia.com.
2. Settings → copy the **Project ID**:
   - `NEXT_PUBLIC_CLARITY_ID=...`

### B5. Resend (confirmation emails + newsletter) — needs DNS
1. https://resend.com → sign up → **Domains** → Add `nexolmedia.com`.
2. Resend shows DNS records (SPF, DKIM, etc.). Add them in **Hostinger** DNS for
   nexolmedia.com. Wait for Resend to show "Verified" (minutes to a few hours).
3. **API Keys** → create one → `RESEND_API_KEY=...`
4. **Audiences** → create one for the newsletter → copy its ID →
   `RESEND_AUDIENCE_ID=...`
5. Confirm the from/to addresses (already defaulted in `.env.example`):
   - `RESEND_FROM_ADDRESS=Nexol Media <noreply@nexolmedia.com>`
   - `RESEND_TO_ADDRESS=info@nexolmedia.com`
   - `RESEND_REPLY_TO=info@nexolmedia.com`

### B6. Google Search Console (so Google indexes the site)
1. https://search.google.com/search-console → add property `nexolmedia.com`.
2. Choose the **HTML tag** method → copy the `content` value →
   `NEXT_PUBLIC_GSC_VERIFICATION=...`
   (Or verify via DNS TXT record in Hostinger — either works.)

---

## Part C — Deploy to production (Vercel)

1. https://vercel.com → log in with GitHub → **Add New Project** → import
   `theniteshbandekar/Nexol-Media`.
2. Before deploying, add **every** variable from your `.env.local` into Vercel →
   Project → Settings → **Environment Variables** (Production). `.env.local` is
   NOT uploaded — Vercel needs its own copy.
3. Deploy. You'll get a `*.vercel.app` URL — test it.
4. Project → Settings → **Domains** → add `nexolmedia.com` and `www.nexolmedia.com`.
   Vercel shows DNS records → add them in **Hostinger**.
5. Back in Sanity (B2.4) and Google OAuth (B1.3), add the production domain to
   CORS / authorized origins.

---

## Security rules (important)
- **Never commit `.env.local`** — it's gitignored; keep it that way.
- **Never paste secrets into this file or any committed file or chat.**
- If a secret is ever exposed, rotate it (new API key / reset OAuth secret /
  revoke token at https://myaccount.google.com/permissions).

## Where things live (for the Claude agent)
- Pages: `src/app/(site)/*/page.tsx`
- Booking logic: `src/lib/google-calendar.ts`, `src/lib/actions/booking.ts`,
  `src/components/contact-booking-card.tsx`
- CMS client + fallbacks: `src/lib/sanity/*`
- Setup scripts: `scripts/get-google-refresh-token.ts`, `scripts/migrate-to-sanity.ts`
- Env reference: `.env.example`
