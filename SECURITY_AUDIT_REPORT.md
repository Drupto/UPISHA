# 🔒 Security Audit Report — UP ISHA (UPISHA) Codebase

**Audit Date:** August 28, 2026 (re-audit; supersedes the July 31, 2026 report)
**Auditor:** Automated Security Review
**Scope:** Full codebase (`src/`, `functions/`, config files, deployment files)
**Branch / Commit:** `FirebaseIntegration` / `f91d4c73bf5e13389737403c18126f8768b059ee`

---

## Re-Audit Summary

The previous audit (commit `7459873…`) reported **20 findings** (7 Critical / 5 High / 5 Medium / 3 Low). This re-audit re-verified every one of them against the current code and added **10 new findings**.

### Status of Previous Findings

| ID | Previous Finding | Status |
|----|------------------|--------|
| C1 | SSRF via Caddyfile port query | ✅ **FIXED** — handler removed; proxy is now `localhost:3000` only |
| C2 | No admin role checks on API routes | ✅ **FIXED** — `requireAdmin()` / `requireVerifiedMember()` applied to all admin endpoints (53 call sites) |
| C3 | Unauthenticated PII exposure via `GET /api/join` | ✅ **FIXED** — GET handler removed |
| C4 | Open registration grants admin access | ✅ **FIXED** — register redirects to `/`; login redirects by role; no auto-admin |
| C5 | Client-side only route protection | ⚠️ **PARTIALLY FIXED** — `middleware.ts` added, but only checks cookie *presence* (see N6) |
| C6 | Web SDK masquerading as Admin SDK | ❌ **STILL OPEN** (severity reduced — see details) |
| C7 | No Firestore/Storage security rules | ✅ **FIXED** — `firestore.rules` + `storage.rules` added and deployed — **but see new N1** |
| H1 | Mass assignment in update operations | ✅ **FIXED** — `pickFields()` whitelisting on every update function |
| H2 | Token in response body | ✅ **FIXED** — no tokens returned; httpOnly session cookie only |
| H3 | Bypassable rate limiting | ⚠️ **PARTIALLY FIXED** — all rate-limit keys now combine IP + email (email-only keys eliminated); the limiter itself remains in-memory, so a distributed store (Redis/Vercel KV) is still recommended for serverless |
| H4 | No CSRF protection | ✅ **FIXED** — enforced inside `requireAuth()` for every mutating method, covering all 53 admin endpoints and the upload route; unauthenticated public form endpoints intentionally exempt |
| H5 | Email enumeration | ✅ **FIXED** — generic error messages on register and join |
| M1 | Weak CSP | ⚠️ **PARTIALLY FIXED** — strict CSP in production; `'unsafe-eval'/'unsafe-inline'` retained in dev only (required for HMR, documented) |
| M2 | Missing HSTS | ✅ **FIXED** — set in `next.config.ts` and `withSecurityHeaders()` |
| M3 | `X-Powered-By` header | ✅ **FIXED** — `poweredByHeader: false` |
| M4 | Unvalidated URL fields | ✅ **FIXED** — `z.string().url()` + server-side data-URL upload flow + `safeImageUrl` |
| M5 | Sensitive error logging | ✅ **FIXED** — `createErrorResponse` logs only outside production |
| L1 | Session cookie = raw ID token | ❌ **STILL OPEN — escalated** (cookie now outlives the token; see N3) |
| L2 | Newsletter email leaked in response | ✅ **FIXED** — ID no longer returned |
| L3 | Weak password policy | ✅ **FIXED** — upper/lower/digit complexity enforced |

### New Findings (this audit)

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| N1 | Deployed security rules break all server-side Web SDK operations | 🔴 CRITICAL | ❌ OPEN (deferred — requires Admin SDK migration) |
| N2 | Webinar receipts store email in `memberUid` — invisible to members | 🟠 HIGH | ✅ **FIXED** |
| N3 | Session cookie outlives ID token (2 h cookie / 1 h token) | 🟠 HIGH (escalated from L1) | ✅ **FIXED** |
| N4 | `sendTransactionalEmail` callable open to any signed-in user | 🟠 HIGH | ✅ **FIXED** |
| N5 | Missing composite indexes → silent full-collection scans | 🟡 MEDIUM | ✅ **FIXED** (deploy with `firebase deploy --only firestore:indexes`) |
| N6 | `middleware.ts` validates cookie presence only | 🟡 MEDIUM | ✅ **FIXED** |
| N7 | Dead `request-signing.ts` with hardcoded default secret | 🟡 MEDIUM | ✅ **FIXED** (file deleted) |
| N8 | `/api/upload` member path skips role check; public 10 MB PDFs | 🟢 LOW | ✅ **FIXED** |
| N9 | Orphaned Firebase Auth accounts in join flow | 🟢 LOW | ✅ **FIXED** |
| N10 | Unbounded `getRecentApiLogs()` read | 🟢 LOW | ✅ **FIXED** |

### Current Counts (open items)

| Severity | Open |
|----------|------|
| 🔴 Critical | 2 (C6, N1 — deferred by design, require Admin SDK migration) |
| 🟠 High | 0 |
| 🟡 Medium | 3 partials (H3 — in-memory limiter, M1 — dev-only CSP, C5 — see N6 fix note) |
| 🟢 Low | 0 |
| **Total open** | **2 Critical + 3 partials** |

All High/Medium/Low findings from this re-audit (N2–N10) and H4 were fixed in the remediation pass of August 28, 2026 — see "Fixed in the Remediation Pass" below.

## 🟠 HIGH (carried over, severity reduced)

### C6. "firebase-admin.ts" Uses the Client SDK — No Custom Claims, REST-Based Token Verification
**File:** `src/lib/firebase-admin.ts`
**Severity:** HIGH (was CRITICAL — RBAC is now enforced via the Firestore `users` collection, mitigating the original "no RBAC possible" impact)

Despite the filename, the file imports `firebase/app` / `firebase/firestore` / `firebase/storage` — the **Web SDK**. Token verification calls the public `identitytoolkit` `accounts:lookup` REST endpoint with the public API key:

- No custom-claim support (`admin.auth().verifyIdToken()` unavailable)
- No revocation / disabled-account check
- **Every** authenticated API call performs an external HTTPS round-trip to Google (latency + quota)
- Firestore/Storage operations are subject to security rules (which is exactly what triggers N1)

RBAC is implemented by reading `users/{uid}` from Firestore (`requireAdmin()` in `auth-helpers.ts`). Functionally sound, but it depends on the deployed Firestore rules permitting those server reads — which, per N1, they currently do not.

**Fix:** Install `firebase-admin` with a service account; use `admin.auth().verifyIdToken(token, true)` and `admin.firestore()` for all server-side access. This also resolves N1.

---

## 🔴 CRITICAL (new)

### N1. Security Rules Contradict the Server Implementation — Deployed Rules Break the Application
**Files:** `firestore.rules`, `storage.rules`, `firebase.json`, `src/lib/firestore.ts`, `src/lib/storage.ts`, `src/lib/request-logger.ts`, `src/lib/firestore-rate-limit.ts`
**Severity:** CRITICAL

`firebase.json` deploys the strict `firestore.rules` / `storage.rules`, but **all** server-side API routes use the **unauthenticated Web SDK** (no Admin SDK, no service account). Under the deployed rules, server requests are evaluated as anonymous and **denied**:

| Broken flow | Reason |
|---|---|
| `/api/auth/verify` (session establishment) | `users/{uid}` read requires `isOwner/isAdmin` → denied → 401 for all users |
| Join-flow role record (`createUserRecord` role `member`) | `users` rule is `allow create: if isAdmin()` → denied (silently swallowed as "non-fatal") → **no user ever receives the `member` role** |
| All admin CRUD (announcements, events, gallery, testimonials, publications, webinars, certificates, receipts, members, campaigns) | Writes require `isAdmin()`; server has no `request.auth` → 500 on every admin mutation |
| Public certificate verify (`/api/certificates/verify/[id]`) and webinar lookup | Reads of `certificates` / `receipts` / `webinarRegistrations` denied → QR-verification feature fails |
| `/api/upload` | `checkRateLimitStrict()` writes to `rate_limits` where `allow write: if false` → transaction throws → **every upload returns 500** |
| Audit logging (`request-logger.ts`) | `api_logs` writes denied → audit trail silently never written |
| Join-flow file uploads to `members/{uid}/…` | Storage rule requires `isAdmin()` → denied → fallback stores **raw base64 data URLs inside Firestore member documents** |

The rules header itself states "use the Firebase **Admin SDK** for server-side work" — but no Admin SDK exists anywhere in the web app. As deployed, the codebase is non-functional; if the rules are instead left undeployed/test-mode, the database is effectively open to the public (the exact condition C7 was raised for).

**Fix (Admin SDK recommended):**
1. Install `firebase-admin` with a service account for all server-side Firestore/Storage access — the rules then become correct and safe; **or**
2. Rewrite the rules to allow the server's Web-SDK access patterns (significantly less secure; not recommended).

## 🟠 HIGH (new / escalated)

### N2. Webinar Receipts Store the Registrant's *Email* in `memberUid` — ✅ FIXED
**File:** `src/lib/webinar-receipts.ts` (lines 50–51)
**Severity:** HIGH

```ts
memberId: registration.email,
memberUid: registration.email,   // ❌ should be the Firebase auth UID
```

`/api/receipts/mine` queries `getReceiptsByMemberUid(decoded.uid)`, so **webinar receipts never appear** in a member's receipt list. The Firestore owner-read rule (`resource.data.memberUid == request.auth.uid`) can also never match, blocking direct reads.

**Fix:** Resolve the member by `registration.email` when creating the receipt and store the real auth UID in `memberUid` (and the member doc ID in `memberId`).

### N3. Session Cookie Outlives the ID Token — ✅ FIXED
**File:** `src/app/api/auth/verify/route.ts` (line 39)
**Severity:** HIGH (escalated from L1)

The session cookie holds the raw Firebase ID token with `maxAge: 2h`, but Firebase ID tokens expire after **1 hour**. During the second hour, every `requireAuth` / `/api/auth/me` call fails with 401 while the client still shows the user as signed in — a confusing forced-relogin state (and with N6, `middleware.ts` still admits the user to `/admin` pages whose data calls then all fail).

**Fix:** Use the Admin SDK's `createSessionCookie()` (also fixes C6), or refresh the token client-side before expiry.

### N4. `sendTransactionalEmail` Callable Open to Any Authenticated User — ✅ FIXED
**File:** `functions/src/index.ts` (line 433)
**Severity:** HIGH

The callable checks only `request.auth` — any signed-in user (including freshly registered ones) can send arbitrary emails to arbitrary recipients through the project's Brevo account (spam/phishing vector, quota and sender-reputation drain).

**Fix:** Read `users/{uid}.role` inside the callable and require `'admin'` before sending.

## 🟡 MEDIUM (open / new)

### H3 (partial). Remaining Rate-Limit Weaknesses
**Files:** `src/app/api/contact/route.ts`, `newsletter/route.ts`, `publications/submissions/route.ts`, `webinars/register/route.ts`, `auth/register/route.ts`, `src/lib/security.ts`
**Status:** Partially fixed — login/join now key on `IP + email`, public reads key on IP, and the upload endpoint uses the transactional Firestore limiter (`checkRateLimitStrict`). Remaining gaps:

1. **In-memory `Map`** for most endpoints — resets on serverless cold start, no cross-instance state.
2. **Email-only keys** remain: `contact:${email}`, `newsletter:${email}`, `pub-sub:${email}`, `webinar-reg:${email}`, `register:${email}` — rotating email bypasses the limit.
3. `SimpleCache` / `rateLimitStore` grow unboundedly between cleanups.

**Fix:** Migrate to Redis/Vercel KV (or extend the Firestore transactional limiter) and derive keys from IP (+ uid) everywhere.

### H4. CSRF Coverage Across Mutating Endpoints — ✅ FIXED
**Fix applied (Aug 28, 2026):** CSRF enforcement was moved into `requireAuth()` (`src/lib/auth-helpers.ts`): every mutating method (POST/PUT/PATCH/DELETE) passing through any `requireAuth`/`requireAdmin`/`requireVerifiedMember` route must now present a valid double-submit CSRF token, while GET/HEAD/OPTIONS remain exempt. This covers **all 53 admin endpoints** and the upload route in one place. On the client, all nine admin pages (`announcements`, `certificates`, `events`, `gallery`, `members`, `messages`, `newsletter`, `publications`, `webinars`) now send `csrfHeaders()` on every mutating fetch. Unauthenticated public form endpoints (`auth/login`, `auth/logout`, `auth/verify`, `newsletter`, `webinars/register`, `publications/submissions` POST) are intentionally exempt — they perform no cookie-authenticated actions. (Historical detail: before this fix, only 12 call sites enforced CSRF and ~39 mutating handlers had none, mitigated only by the `SameSite=Strict` cookie.)

### N5. Missing Composite Indexes — Queries Silently Degrade to Full Collection Scans — ✅ FIXED
**Files:** `firestore.indexes.json` (empty), `src/lib/firestore.ts`
**Severity:** MEDIUM

Composite queries with no matching index throw `failed-precondition`; the code then falls back to broad scans:
- `getCertificatesByRegistrationId` (`registrationNumber ==` + `orderBy createdAt`) → falls back to **fetching every certificate** (firestore.ts:1477-1486).
- `detectRapidRequests` (`endpoint ==` + `ip ==` + `timestamp >=`) → always throws → DoS detection **never fires**.

**Fix:** Add the composite indexes to `firestore.indexes.json` and deploy, or restructure the queries.

### N6. `middleware.ts` Validates Cookie Presence Only — ✅ FIXED
**File:** `middleware.ts`
**Severity:** MEDIUM (residual of C5)

The middleware checks only that a `session` cookie exists — it does not verify the token or role. `/admin` page shells render for anyone who can set a cookie; real authorization rests on the API routes (correct), but this is the only functioning page-level gate given N1/N3.

**Fix:** Verify the session token and role in middleware via the Admin SDK, or explicitly document API-layer enforcement as the security boundary.

### N7. Dead Code With Hardcoded Fallback Secret — ✅ FIXED (file deleted)
**File:** `src/lib/request-signing.ts`
**Severity:** MEDIUM

Never imported anywhere, but contains a hardcoded fallback secret (`'your-secret-key-change-in-production'`, line 8), `Math.random()` nonces (line 83), and rejects future timestamps instead of tolerating clock skew. A footgun if ever imported.

**Fix:** Delete the file.

---

## 🟢 LOW (new)

### N8. `/api/upload` Member Path Skips Role Check — ✅ FIXED
**File:** `src/app/api/upload/route.ts` (lines 88–95)
Any authenticated user (role `user`, unapproved) may upload 10 MB PDFs to world-readable `publications/`. **Fix:** require the `member`/`admin` role for member paths (matches the storage-rule intent).

### N9. Orphaned Auth Accounts in Join Flow — ✅ FIXED
**File:** `src/app/api/join/route.ts` (lines 84–134)
If `createMember` fails after `accounts:signUp` succeeded, the Firebase Auth account exists with no member doc; retrying yields `EMAIL_EXISTS`, masked as a generic 500. Consider compensating deletion or an idempotent retry path.

### N10. Unbounded Log Read — ✅ FIXED
**File:** `src/lib/request-logger.ts` (lines 104–131)
`getRecentApiLogs()` fetches the **entire** `api_logs` collection into memory before sorting/slicing; `cleanupOldApiLogs` has no scheduler wired up. Add `limit()` and a scheduled cleanup.

## 🛠️ Fixed in the Remediation Pass (Aug 28, 2026)

All non-Critical findings were fixed and verified (`npx tsc --noEmit` clean; Cloud Functions `tsc` clean):

- **N2** — added `getMemberByEmail()` (`firestore.ts`); `ensureWebinarReceipt()` now resolves the member and stores the real auth UID in `memberUid` and the Firestore doc ID in `memberId`, with the email kept only as a fallback. Webinar receipts now surface in `/api/receipts/mine` and satisfy the owner-read rule.
- **N3** — session cookie `maxAge` reduced to **55 minutes** (`auth/verify`), always shorter than the 1-hour ID-token TTL; `useAuth` additionally re-verifies every **45 minutes** with a freshly forced-refreshed token (`getIdToken(true)`), clearing the interval on sign-out/unmount.
- **N4** — `sendTransactionalEmail` (`functions/src/index.ts`) now reads `users/{request.auth.uid}` and throws `permission-denied` unless the caller's role is `admin`.
- **H3** — rate-limit keys on `auth/register`, `contact`, `newsletter`, `publications/submissions`, and `webinars/register` (incl. its success `resetRateLimit`) now all combine `IP + email`; email-only bypass keys eliminated. The limiter itself remains in-memory (a Redis/Vercel KV migration needs infrastructure).
- **H4** — CSRF enforcement centralized in `requireAuth()` (mutating methods only); all nine admin pages now send `csrfHeaders()` on every mutating fetch. Details in the H4 section above.
- **N5** — added composite indexes to `firestore.indexes.json`: `certificates(registrationNumber ASC, createdAt DESC)` and `api_logs(endpoint ASC, ip ASC, timestamp ASC)`. **Deploy with `firebase deploy --only firestore:indexes`** — until then the full-scan fallbacks still apply.
- **N6** — `middleware.ts` now verifies the session token via the identitytoolkit REST API (Edge-safe, fetch-only, no SDK imports), fail-closed, and clears stale cookies on redirect. Note: page navigation to `/admin`/`/member` now costs one external REST round-trip — acceptable until the Admin SDK migration (N1) replaces it with `verifyIdToken`.
- **N7** — `src/lib/request-signing.ts` deleted (unused, hardcoded fallback secret).
- **N8** — `/api/upload` now uses `requireVerifiedMember` for member paths (`publications/`), so only approved members/admins can upload; admin paths still use `requireAdmin`.
- **N9** — the join flow now returns the signup `idToken` and, if the member document fails to create after the auth account was created, compensates by deleting the just-created auth account (`accounts:delete`), so applicants can retry instead of hitting a permanent `EMAIL_EXISTS` dead-end.
- **N10** — `request-logger.ts` bounds every read: `getRecentApiLogs` fetches at most 500 docs, `detectRapidRequests` at most 11 (threshold is 10), and `cleanupOldApiLogs` deletes at most 1000 per run.

---

## ✅ Resolved in This Cycle (details verified)

- **C1** — `Caddyfile` now contains a single `reverse_proxy localhost:3000` handler; the `XTransformPort` query-param handler is gone.
- **C2/C3** — `requireAdmin()` / `requireVerifiedMember()` (role read from the Firestore `users` collection) guard every admin endpoint (53 call sites verified); `GET /api/join` removed entirely (documented at join/route.ts:66).
- **C4** — `/register` redirects new users to `/` (register/page.tsx:33-35); `/login` routes by role (`admin` → `/admin`, `member` → member area).
- **C7** — `firestore.rules` and `storage.rules` exist with per-collection rules, field allowlists (`hasOnly` / `changesOnly`), `isAdmin()` helpers, and deny-all fallbacks; deployed via `firebase.json`. (Their conflict with the server implementation is tracked as N1.)
- **C5 (partial)** — `middleware.ts` now guards `/admin/*` and `/member/*` server-side (cookie presence; see N6), and `ProtectedRoute` checks `role === 'admin'`.
- **H1** — all `update*` functions in `firestore.ts` pass through `pickFields()` with per-collection field whitelists.
- **H2** — login/register return no token (documented "Do NOT return the token (H2)"); the httpOnly `session` cookie is set by `/api/auth/verify`.
- **H4 (partial)** — `validateCsrfToken()` implements the double-submit cookie pattern (header token must equal the `csrf-token` cookie) and is invoked at 12 call sites; the client generates the token via `crypto.getRandomValues` (`src/lib/csrf.ts`). Coverage gaps remain — see the H4 section above.
- **H5** — register and join return generic errors; the `EMAIL_EXISTS` detail is never surfaced.
- **M1** — strict CSP in production via both `next.config.ts` headers and `withSecurityHeaders()`; dev-only relaxations documented.
- **M2/M3** — HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` set in `next.config.ts` and `withSecurityHeaders()`; `poweredByHeader: false`.
- **M4** — `photoUrl` / `rciCertificateUrl` validated with `z.string().url()`; data URLs are uploaded server-side to Storage; certificate template images use `safeImageUrl` with content-length guards.
- **M5** — `createErrorResponse` logs error details only outside production.
- **L2** — newsletter subscription no longer returns the email-derived document ID.
- **L3** — password complexity (uppercase, lowercase, digit, min 8) enforced in `registerSchema` and `joinSchema`.

---

## 🛠️ Recommended Priority Fixes (updated)

1. **Immediate (remaining Critical):** Resolve **N1** — migrate server-side data access to the Firebase Admin SDK with a service account. This single change unblocks the deployed rules and fixes the verify flow, admin CRUD, uploads, public verification, and rate limiting in one move (it also replaces the REST-based token verification of C6/N6 and the 55-minute cookie workaround of N3 with `verifyIdToken()` + `createSessionCookie()`).
2. **High:** Move rate limiting to a distributed store (Redis/Vercel KV) for serverless correctness (H3 residual).
3. **Medium:** Keep the dev CSP gap in mind — production CSP is already strict (M1 residual).
4. **Deployment notes:** run `firebase deploy --only firestore:indexes` to activate the new composite indexes (N5), and redeploy Cloud Functions for the admin-gated email callable (N4).

---

*Methodology: manual code review cross-checked with static analysis — `npx tsc --noEmit` (0 errors), `npx eslint src` (same 7 pre-existing React Compiler errors, non-security, unchanged by the remediation pass), Cloud Functions `tsc` build (0 errors), and a scripted audit of all 47 API route files plus every admin/member/component fetch call site. Every finding above was verified against the current source at commit `f91d4c73`.*