# UP ISHA (UPISHA) — Association Website

Production website for **Uttar Pradesh Indian Speech & Hearing Association (UP ISHA)** — membership management, webinars, certificates, receipts, newsletter, and public content, built on:

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Firebase** — Auth (email verification + role-based access), Firestore, Storage, Cloud Functions (Brevo transactional email)
- **Netlify** hosting (`@netlify/plugin-nextjs`)
- Tailwind CSS 4 + shadcn/ui

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values (see below)
npm run dev            # http://localhost:3000
```

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` (6) | `.env` / Netlify | Public Firebase web config (safe to expose — protected by security rules) |
| `FIREBASE_ADMIN_PROJECT_ID` | `.env` / Netlify (**secret**) | Server Admin SDK — `project_id` from the service-account JSON |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `.env` / Netlify (**secret**) | Server Admin SDK — `client_email` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `.env` / Netlify (**secret**) | `private_key` — single line, `\n` escapes preserved, no quotes |
| `FIREBASE_ADMIN_STORAGE_BUCKET` (optional) | `.env` / Netlify | Defaults to `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `BREVO_API_KEY` etc. | Firebase Functions config | Email sending (functions/) |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GSC_VERIFICATION` | `.env` / Netlify | SEO/analytics |

> Server-side privileged work (token verification with revocation, Firestore/Storage writes, rate limiting) runs through the **Firebase Admin SDK** (`src/lib/firebase-server.ts`), which bypasses security rules. Access control is enforced in the API layer (`src/lib/auth-helpers.ts`) and by `firestore.rules` / `storage.rules` for the browser-facing surface.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` (gates Netlify deploys) |
| `npm run lint` | ESLint (full repo) |
| `npm test` | Jest unit tests |

## Deployment

- **Web (Netlify):** auto-deploys from GitHub. Deploy previews build per PR; production deploys on push to the tracked branch.
- **Firebase backend (manual, after code changes):**

```bash
# Security rules + composite indexes + storage rules
firebase deploy --only firestore:rules,firestore:indexes,storage

# Cloud Functions (transactional email)
cd functions && npm run build && cd .. && firebase deploy --only functions
```

### Service-account key (server Admin SDK)

1. GCP Console → IAM & Admin → Service Accounts → create `upisha-netlify` with `roles/datastore.user`, `roles/storage.objectAdmin`, `roles/firebaseauth.viewer`
2. Keys → Add Key → JSON → extract `project_id` / `client_email` / `private_key` into the three `FIREBASE_ADMIN_*` Netlify env vars (mark the key as a secret)
3. Delete the downloaded JSON; it is covered by `.gitignore` — never commit it
4. **Rotation:** generate a new key → update the 3 vars → redeploy → delete the old key in GCP

## CI

GitHub Actions (`.github/workflows/ci.yml`) gates every PR and push: lint → typecheck → unit tests → production build. Netlify additionally re-runs `typecheck` before each deploy build.

## Security notes

- Firestore/Storage rules are deny-by-default; public reads are granted per-collection
- Role model: `users/{uid}.role` = `user` | `member` | `admin` (admin approval workflow for members; email verification enforced)
- Rate limiting: distributed (Firestore transactions) on abuse-sensitive endpoints; CSRF double-submit on mutating routes; strict CSP in production
- See `SECURITY_AUDIT_REPORT.md` for the historical audit and the fixes applied since

