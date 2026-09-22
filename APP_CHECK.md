# Firebase App Check — Setup & Production Rollout (UP ISHA)

> **Status: NOT YET CONFIGURED** — App Check has zero presence in the codebase today
> (the only `@firebase/app-check` references are transitive `package-lock.json` entries).
> This document is the single source of truth for implementing and operating App Check
> on this project.
>
> Last reviewed: 2026-09 (verified against Firebase/Google Cloud docs updated 2026-09-17/22).

---

## 1. Why / Threat model

| Surface | Current protection | App Check value |
|---|---|---|
| **~45 Next.js API routes** (`/api/join`, `/api/contact`, `/api/newsletter`, `/api/webinars/register`, …) | `requireAuth` / `requireAdmin` / `requireVerifiedMember` + CSRF double-submit + Firestore-transaction rate limiting | **Primary target.** Bots can hit public (unauthenticated) routes without a browser. App Check is verified server-side in the API layer |
| **Firebase Auth (Identity Platform)** via `src/lib/auth.ts` (used by `useAuth`) | Email verification, admin approval workflow | **Secondary.** App Check can protect Auth operations, but enforcement there requires a reCAPTCHA **Enterprise** key |
| **Firestore/Storage client SDK** (`src/lib/firebase-client.ts`) | Deny-by-default hardened `firestore.rules` / `storage.rules` | **Trivial.** Nothing imports the client module — all data flows through the Admin SDK (bypasses rules) behind the API layer. Enforcing App Check here is zero-risk, zero-impact |

Key architectural fact: the browser-facing client SDK surface is nearly empty. The API
layer (Admin SDK + auth helpers + CSRF + rate limiting) is the real attack surface, so
**server-side App Check verification of API requests is where the protection lives**.
Firebase-service enforcement (Firestore/Storage/Auth) is defense-in-depth on top.

---

## 2. Provider decision (IMPORTANT — read before registering anything)

1. **Google is auto-migrating Classic reCAPTCHA (including v3) accounts to Google Cloud
   in October** if you don't migrate yourself. SiteVerify keeps working after migration,
   but key management moves to the Google Cloud console.
2. **Register with a score-based reCAPTCHA Enterprise key** (not a legacy v3 key):
   - Firebase's current guidance for new web registrations is a score-based Enterprise key.
   - Plain v3 keys **cannot** enforce App Check on **Authentication (Identity Platform)** —
     Enterprise keeps every enforcement door open.
   - The `ReCaptchaV3Provider` path still works today but would eventually need the same
     migration — do it once, do it right.
3. **Cost model (verified):** reCAPTCHA Enterprise has a **free tier of 10,000
   assessments/month**. App Check creates one assessment per App Check token refresh
   (default ≈ 2×/hour per active client → ≈ 48/day/active user). **Billing must be
   enabled on the GCP project** or new assessments fail once over quota. The token TTL
   is the cost lever if volume ever grows.
4. **Quota behavior notes (post-migration):** over-quota *SiteVerify* requests
   **fail open** (`success: true`, score 0.9 + error message — users not blocked);
   over-quota *CreateAssessment* requests **fail closed** (HTTP 429). Watch the quota.

---


## 3. Phase 0 — Console & billing prerequisites (manual, ~20 min)

- [ ] **Google Cloud console → reCAPTCHA Enterprise → Create a score-based key**
      - Domains: `upisha.org`, `www.upisha.org`, `localhost`
      - Do **not** create it as a "testing key" for production use
- [ ] **Enable billing on the GCP project** (free 10k/month still applies; you are only
      enabling the account so assessments don't hard-fail over quota)
- [ ] **Firebase Console → App Check → Register the web app** with that key
- [ ] Copy the **site key** (public, safe for `NEXT_PUBLIC_`) into env plumbing below

---

## 4. Phase 1 — Client-side initialization

**New file `src/lib/app-check.ts`** — lazy singleton matching the existing
`src/lib/firebase-client.ts` pattern (SSR-safe, graceful when unconfigured):

```ts
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  getToken,
  type AppCheck,
} from 'firebase/app-check'

let appCheckInstance: AppCheck | null = null

function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

/** Returns null when unset (feature flag off) or on the server. */
export function getAppCheckInstance(): AppCheck | null {
  if (typeof window === 'undefined') return null
  if (appCheckInstance) return appCheckInstance
  const siteKey = process.env.NEXT_PUBLIC_APP_CHECK_SITE_KEY
  if (!siteKey) return null
  if (process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN === 'true') {
    // Console logs the debug token → register it in Firebase Console → App Check
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean })
      .FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }
  appCheckInstance = initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true, // ~2 refreshes/hour → 2 assessments/hour
  })
  return appCheckInstance
}

/** Fresh token for the x-firebase-appcheck header; null when App Check is off. */
export async function getAppCheckToken(): Promise<string | null> {
  const appCheck = getAppCheckInstance()
  if (!appCheck) return null
  try {
    const { token } = await getToken(appCheck, false)
    return token
  } catch {
    return null // monitor mode tolerates this; enforce mode will 403 (by design)
  }
}
```

**Wire-up points**

- Call `getAppCheckInstance()` once from `AuthProvider`'s `useEffect`
  (`src/lib/hooks/useAuth.tsx`) — the only browser Firebase surface.
- **Debug provider** for localhost/CI: `NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN=true` →
  the SDK logs a debug token in the console → register it in
  Firebase Console → App Check → Manage debug tokens.

**Env plumbing** (same pattern as every other var in this repo)

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_APP_CHECK_SITE_KEY=<key>` | `.env`, `.env.example`, **Netlify (Production + Deploy previews)** |
| `NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN=true` | local dev only — **remove from production** |
| placeholder value | `.github/workflows/ci.yml` (like the existing `ci-placeholder` Firebase vars) |

---

## 5. Phase 2 — Server-side verification (the real protection)

**Extend `src/lib/firebase-server.ts`** (follows its existing lazy-getter convention):

```ts
import { getAppCheck } from 'firebase-admin/app-check'

export type AppCheckResult =
  | { valid: true; appId: string }
  | { valid: false; reason: 'missing-header' | 'invalid-token' | 'disabled' }

export async function verifyAppCheckToken(
  request: Request
): Promise<AppCheckResult> {
  const mode = (process.env.APP_CHECK_MODE ?? 'off').toLowerCase()
  if (mode !== 'monitor' && mode !== 'enforce') {
    return { valid: false, reason: 'disabled' }
  }

  const token = request.headers.get('x-firebase-appcheck')
  if (!token) return { valid: false, reason: 'missing-header' }
  try {
    const claims = await getAppCheck(getAdminApp()).verifyToken(token)
    return claims?.appId
      ? { valid: true, appId: claims.appId }
      : { valid: false, reason: 'invalid-token' }
  } catch {
    return { valid: false, reason: 'invalid-token' } // expired / wrong project / tampered
  }
}
```

**Enforcement modes — `APP_CHECK_MODE = off | monitor | enforce` (default `off`)**

| Mode | Behavior |
|---|---|
| `off` | Feature disabled entirely (default; zero risk) |
| `monitor` | Verify, **log failures** to `api_logs` (existing audit pattern), **always allow** → measures the false-positive rate against real traffic |
| `enforce` | Return `403 { error: 'App Check verification failed' }` on failure |

The env flag is the **kill-switch**: flipping `enforce → monitor` takes effect on the
next env change — no code redeploy needed to stop user-facing 403s.

**Wire into exactly two choke points (covers all ~45 routes):**

1. `requireAuth()` in `src/lib/auth-helpers.ts` → every member/admin route inherits it.
   Order: verify App Check *before* ID-token verification (cheap header check first).
2. `withCsrfProtection()` in `src/lib/security.ts` → covers the public mutating routes
   with no auth token: `join`, `contact`, `newsletter`, `auth/register`,
   `teach-requests`, `webinars/register`.

**Client must send the header** — a small `fetchWithAppCheck()` wrapper
(`getAppCheckToken()` → sets `x-firebase-appcheck`) applied at the client-side
`fetch('/api/...')` call sites. Internal server-to-self API calls bypass via an
internal flag (they can't run reCAPTCHA); this is safe because they originate from
the same trusted server runtime, not the public internet.

**Replay protection — deferred (documented decision):** `{ consume: true }` in
`verifyToken()` is beta, Node-only, adds latency, and requires granting the service
account the **Firebase App Check Token Verifier** IAM role. Later, apply it only to
the most abuse-sensitive endpoint (`/api/join`) together with limited-use client
tokens (`getToken(appCheck, /* limitedUse */ true)`).

---

## 6. Phase 3 — Cloud Functions (`functions/`)

- All Brevo email functions are **Firestore event triggers**
  (`onDocumentCreated` / `onDocumentUpdated`) and `auditLogRetention` is a scheduled
  function → **App Check does not apply** (server-to-server). ✅ No change.
- `sendTransactionalEmail` (the single `onCall` callable) already requires
  authenticated callers. **Optional later hardening:** set `enforceAppCheck: true` on
  the `onCall` options and mint a server token from Next.js via Admin SDK
  `getAppCheck(app).createToken(appId)`. Not required for production readiness.

---

## 7. Phase 4 — Staged rollout ladder (the "production" moment)

1. **Deploy with `APP_CHECK_MODE=monitor`** → run 1–2 weeks. Watch Firebase Console →
   App Check **metrics** and the `api_logs` failures. Verified-request rate should
   approach real-traffic rate. (reCAPTCHA can false-flag VPN / privacy-tool users —
   this phase is the safety net.)
2. **Remove debug flags** from production env; register any debug tokens still needed
   for staging/CI in the console.
3. **Flip console enforcement** per service:
   - Firestore ✅ and Storage ✅ — zero client traffic today, so zero risk;
   - then set `APP_CHECK_MODE=enforce` for the API layer.
4. **Auth enforcement (optional decision point):** Identity Platform enforcement
   protects `SignInWithPassword`, `SendVerificationCode`, `GetOobCode`,
   `SetAccountInfo`, etc. — enabled per-service in the console. Only possible because
   we chose an Enterprise key (§2). Decide based on observed sign-up/sign-in bot abuse.
5. **Ops runbook:**
   - Quota alarm near the 10k free assessments/month;
   - Users getting 403s → flip `APP_CHECK_MODE=monitor` immediately;
   - Remember post-migration quota semantics (SiteVerify fails open,
     CreateAssessment fails closed — §2).

---

## 8. Known tradeoffs (sign-off items)

- **Enforced App Check adds a Google reCAPTCHA dependency** — if reCAPTCHA endpoints
  are blocked (rare: some corporate networks/regions), those users fail. The
  monitor→enforce ladder exists precisely to catch this before it hurts.
- **Token refresh volume = assessment cost** (≈2/hour/client). TTL tuning is the lever.
- **App Check tokens are not secrets** — client-observable; App Check raises the cost
  of abuse (attestation), it does not replace auth, CSRF, or rate limiting. It stacks
  on top of the existing `requireAuth` / CSRF / rate-limit stack.

---

## 9. Verification checklist

- [ ] Jest tests for the verify helper: missing header / invalid token / mode matrix
      (`jest` is already configured)
- [ ] `README.md` security section + `.env.example` updated (match existing doc style)
- [ ] Monitor-mode metrics ≈ real traffic **before** enabling enforcement
- [ ] Debug tokens/flags removed from production environment
- [ ] Rollback tested once in staging (`APP_CHECK_MODE=enforce → monitor`)

---

### Implementation file map (for the next PR)

| File | Change |
|---|---|
| `src/lib/app-check.ts` | **new** — client singleton + `getAppCheckToken()` (§4) |
| `src/lib/app-check-fetch.ts` (or inline helper) | **new** — `fetchWithAppCheck()` wrapper |
| `src/lib/firebase-server.ts` | add `verifyAppCheckToken()` (§5) |
| `src/lib/auth-helpers.ts` | verify in `requireAuth()` (§5) |
| `src/lib/security.ts` | verify in `withCsrfProtection()` (§5) |
| `src/lib/hooks/useAuth.tsx` | init App Check in `useEffect` (§4) |
| `.env.example` / `.github/workflows/ci.yml` | new env vars + placeholder (§4) |
| `src/__tests__/app-check*.test.ts` | **new** — tests (§9) |
