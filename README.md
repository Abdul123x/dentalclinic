# Dental Demo Platform

One Next.js codebase · one deployment · one MongoDB database → unlimited dental clinic demos.

```
https://mydomain.com/demo/sarah-dental          ← same template
https://mydomain.com/demo/bright-smile-dental   ← different data
https://mydomain.com/admin                      ← you create/edit/publish demos here
```

Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · MongoDB + Mongoose · Zod · jose (session cookies) · Cloudinary (optional uploads).
The template keeps the original "Enamel Pop" design (Anton / Inter / JetBrains Mono, rounded cards, chatbot, WhatsApp booking).

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local          # then fill it in (see below)
npm run hash-password -- "your-strong-password"   # paste output into .env.local
npm run seed                         # optional: adds 3 example demos
npm run dev                          # http://localhost:3000/admin
```

| Variable | Required | What it is |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `ADMIN_EMAIL` | ✅ | Your admin login email |
| `ADMIN_PASSWORD_HASH` | ✅ | Output of `npm run hash-password` (never store the plain password) |
| `AUTH_SECRET` | ✅ | Random 32+ char string — signs the session cookie |
| `NEXT_PUBLIC_SITE_URL` | ✅ | e.g. `https://mydomain.com` — used by "Copy URL" |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | optional | Enables the **Upload** buttons. Without them you paste image URLs. |
| `GOOGLE_PLACES_API_KEY` | optional | Live Google reviews for demos that have a Google Place ID |

All secrets are server-only. Only `NEXT_PUBLIC_SITE_URL` reaches the browser.

---

## 1. Database schema

Collection `demos` (model: `src/models/Demo.ts`, validation: `src/lib/validation.ts`). One document = one client demo.

| Group | Fields |
|---|---|
| Identity | `_id`, `businessName`, **`slug` (unique index)**, `isPublished` (indexed), `createdAt`, `updatedAt` |
| Business | `doctorName`, `doctorTitle`, `doctorBio`, `doctorImage`, `tagline`, `phone`, `whatsapp`, `email`, `address`, `city`, `openingHours` |
| Hero | `heroTitle`, `heroDescription`, `heroImage`, `ctaText` |
| About | `aboutTitle`, `aboutDescription`, `aboutImage` |
| Content | `services: [{ title, description, details, icon }]`, `whyChooseUs: [{ title, description }]`, `testimonials: [{ name, text, rating }]`, `galleryImages: [url]` |
| Contact / Google | `googleMapsUrl`, `googlePlaceId`, `googleRating`, `googleReviewCount` |
| Social | `facebookUrl`, `instagramUrl`, `tiktokUrl` |
| Design | `primaryColor`, `secondaryColor`, `logo` |
| SEO | `metaTitle`, `metaDescription` (optional — auto-generated when empty) |

- `icon` is stored as a name (`"Sparkles"`, `"Anchor"`…) and mapped to an icon in `src/lib/icons.ts`.
- Empty image fields fall back to `/public/defaults/*` placeholder photos.
- `whatsapp` is normalised on save: `0300 1234567` → `923001234567`.

## 2. Route structure

```
src/app/
├─ demo/[slug]/page.tsx              PUBLIC  home page of a demo (published only)
├─ demo/[slug]/services/page.tsx     PUBLIC  detailed services page
├─ admin/login/page.tsx              login
├─ admin/(dashboard)/page.tsx        dashboard: totals, published, drafts, recent
├─ admin/(dashboard)/demos/          list + search + filter (?q=…&status=draft)
├─ admin/(dashboard)/demos/new/      create form
├─ admin/(dashboard)/demos/[id]/edit edit form
├─ admin/preview/[id]/               ADMIN preview (works for drafts)
└─ api/
   ├─ demos                 GET list · POST create               (admin)
   ├─ demos/[id]            GET · PUT update · DELETE            (admin)
   ├─ demos/[id]/duplicate  POST                                 (admin)
   ├─ demos/[id]/publish    POST publish · DELETE unpublish      (admin)
   ├─ public/demos/[slug]   GET published demo by slug           (public)
   └─ upload/sign           POST Cloudinary upload signature     (admin)
```

The admin UI uses **server actions** (`src/lib/actions.ts`); the REST routes expose the same operations for scripts/integrations. Both call one data layer: `src/lib/demo-service.ts`.

**Template components** (`src/components/template/`): `Navbar`, `Hero`, `About`, `Services`, `WhyChooseUs`, `Doctors`, `Testimonials`, `Gallery`, `CTA`, `Contact` (+ `AppointmentForm`), `Footer`, `Chatbot`. None contain client data — everything arrives via props, e.g. `<Hero data={demo} />`, `<Services data={demo.services} />`. `DemoTemplate.tsx` assembles them; public pages and admin preview both render it.

**Security:** `middleware.ts` blocks `/admin/*`, `/api/demos/*`, `/api/upload/*` without a valid session. Each server action and API route **also** checks the session (`requireAdmin()` / `guard()`), and validates input with Zod on the server. Sessions are signed JWTs in an `httpOnly`, `sameSite=lax`, `secure` (in production) cookie. Login is rate-limited to 5 attempts per 15 minutes per IP and the password is checked against an scrypt hash.

## 3. How a new demo is created

1. `/admin` → **Create demo**. The form is pre-filled with 6 starter services and 4 "why us" highlights.
2. Type the business name → the slug is suggested automatically and checked live ("available ✓" / "taken — use sarah-dental-2").
3. Fill in sections 1–10, upload or paste images, choose colours (or click a preset).
4. **Save draft** (private) · **Preview** (saves, then opens the real template in a new tab) · **Publish** (live).
5. Copy the URL from the list or the editor header and send it on WhatsApp.

**Duplicate** creates a draft copy with every field and a unique slug (`sarah-dental-copy`, `-copy-2`, …). Rename it and the slug follows the new name until you edit the slug yourself.

## 4. How unique URLs are generated

- `slugify("Sarah Dental Clinic!")` → `sarah-dental-clinic` (`src/lib/slug.ts`).
- The admin can edit it; only `a-z`, `0-9` and single hyphens are allowed.
- Uniqueness is enforced three ways: the live check in the form, a server-side check before saving, and the **unique index** in MongoDB (which also catches two people saving at the same moment).
- Lookups are a single indexed query: `findOne({ slug, isPublished: true })`. Other demos are never loaded.

## 5. Deploying

**Vercel (recommended):**
1. Create a free **MongoDB Atlas** cluster → Database Access (create user) → Network Access (allow `0.0.0.0/0` for Vercel) → copy the connection string.
2. Push this folder to GitHub → import it in Vercel.
3. Add the environment variables from the table above in Vercel → Settings → Environment Variables.
4. Deploy, add your domain, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
5. Optional: run `npm run seed` locally against the Atlas URI to add example demos.

**Any Node host (VPS, Railway, Render):** `npm ci && npm run build && npm start` with the same env vars (Node 20+).

## 6. Creating 100 demos from the same repository

You never touch the code again. For each new prospect:
**Admin → Duplicate** an existing demo (or **Create demo**) → change the name, phone, WhatsApp, address, photos and colours → **Publish** → **Copy URL**.
Each demo is just one database document (a few KB), so 100 or 1,000 demos cost nothing extra: same build, same deployment, same server. Editing or deleting one demo only touches that one document.

## 7. Adding a new field later without breaking existing demos

Example: add `youtubeUrl`.

1. `src/models/Demo.ts` → `youtubeUrl: str,` (has a default of `""`).
2. `src/lib/validation.ts` → `youtubeUrl: linkUrl,` (optional with default).
3. `src/lib/defaults.ts` → add `youtubeUrl: ""` to `DEMO_DEFAULTS`.
4. Add an input to `DemoForm.tsx` and use `data.youtubeUrl` in a template component (render nothing when empty).

Old documents don't have the field, but `toDemo()` merges `DEMO_DEFAULTS` under every document when it is read, so they get `""` automatically. No migration needed. The same pattern works for new arrays (default `[]`). Never rename or remove a field in one step: add the new one, copy the data across, then remove the old one.

---

### Scripts

| Command | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build && npm start` | Production |
| `npm run seed` | Add example demos (skips slugs that exist) |
| `npm run hash-password -- "pw"` | Generate `ADMIN_PASSWORD_HASH` |
| `npm run typecheck` / `npm run lint` | Checks |
