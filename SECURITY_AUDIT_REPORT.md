# 🔒 Security Audit Report — UP ISHA (UPISHA) Codebase

**Audit Date:** July 31, 2026  
**Auditor:** Automated Security Review  
**Scope:** Full codebase (`src/`, config files, deployment files)  
**Commit:** `745987329532b6a43f967a5c015e07626cff68d3`  
**Re-Audit Date:** September 22, 2026  
**Re-Audit Commit:** `101e342` (branch `Production-Final`)  
**Re-Audit Scope:** Per-handler scan of all 50 API routes + per-call scan of all admin pages (CSRF rollout completeness — follow-up on H4; see the "Re-Audit: Partial CSRF Rollout" section at the end of this report)

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 7 |
| 🟠 High | 5 |
| 🟡 Medium | 5 |
| 🟢 Low | 3 |
| **Total** | **20** |

The most severe issues stem from a **complete absence of role-based access control (RBAC)**. The application uses Firebase client SDK for both client and server-side operations, with no actual Firebase Admin SDK. Any authenticated user (and in some cases, unauthenticated users) can access admin functionality and sensitive PII.

---

## 🔴 CRITICAL Vulnerabilities

### C1. Server-Side Request Forgery (SSRF) via Caddyfile
**File:** `Caddyfile` (lines 2–13)  
**Severity:** CRITICAL  

The Caddy reverse proxy configuration allows an attacker to proxy requests to **any port on localhost** via a query parameter:

```caddy
@transform_port_query {
    query XTransformPort=*
}
handle @transform_port_query {
    reverse_proxy localhost:{query.XTransformPort} { ... }
}
```

**Impact:** An attacker can send `?XTransformPort=3306` to access MySQL, `?XTransformPort=6379` for Redis, `?XTransformPort=8080` for internal admin panels, etc. This enables internal port scanning, access to internal services, databases, and metadata endpoints.

**Fix:** Remove the `@transform_port_query` handler entirely, or restrict it to a hardcoded allowlist of ports.

---

### C2. Broken Access Control — No Admin Role Checks Anywhere
**Files:** `src/lib/auth-helpers.ts` (lines 5–19), all API routes  
**Severity:** CRITICAL  

The `requireAuth()` helper only verifies that a Firebase token is valid — it **never checks whether the user has an admin role**:

```ts
export async function requireAuth(request: NextRequest) {
  const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '') ||
                       request.cookies.get('session')?.value
  if (!sessionToken) {
    return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const decodedToken = await verifyToken(sessionToken)
    return decodedToken  // ← No role check!
  } catch {
    return NextResponse.json({ authenticated: false, error: 'Invalid token' }, { status: 401 })
  }
}
```

**Impact:** Every admin-only API endpoint (GET/POST/PUT/DELETE for members, webinars, events, announcements, contact messages, newsletter subscribers, webinar registrations) is accessible to **any authenticated user**, not just admins. Any registered user can:
- Read all members' PII (phone, email, address, etc.)
- Create, update, delete webinars, events, announcements
- Read all contact messages and newsletter subscribers
- Delete any record

**Fix:** Implement proper RBAC. Use Firebase Admin SDK to set custom claims (`admin: true`) on authorized users, then check those claims in `requireAuth()`. Create a `requireAdmin()` helper.

---

### C3. Unauthenticated PII Exposure via `GET /api/join`
**File:** `src/app/api/join/route.ts` (lines 109–116)  
**Severity:** CRITICAL  

The `GET /api/join` endpoint has **NO authentication check at all**:

```ts
export async function GET() {
  try {
    const members = await getMembers()  // ← No auth check!
    return withSecurityHeaders(NextResponse.json({ members }))
  } catch (error) { ... }
}
```

**Impact:** Anyone (no login required) can fetch all member data including full names, emails, phone numbers, addresses, qualifications, RCI numbers, transaction numbers, and photos. This is a severe PII breach.

**Fix:** Add `requireAuth` (and `requireAdmin`) to this endpoint, or remove the GET handler entirely.

---

### C4. Open Registration Grants Admin Panel Access
**Files:** `src/app/api/auth/register/route.ts`, `src/app/login/page.tsx` (line 79), `src/app/admin/layout.tsx`  
**Severity:** CRITICAL  

Registration is completely open to the public. After registering, users are redirected to `/admin`:

```tsx
// login/page.tsx line 79
<Link href="/register" className="text-upisha-teal hover:underline">Create an account</Link>

// register/page.tsx — redirects to /admin after registration
router.push('/admin')
```

Combined with C2 (no role checks) and C5 (client-side only protection), **anyone can register and immediately access the full admin panel**.

**Fix:** Remove the registration link from the login page. Implement an admin invitation/approval workflow. Only pre-approved admins should be able to log in.

---

### C5. Client-Side Only Admin Route Protection (No Server Middleware)
**Files:** `src/app/admin/layout.tsx`, `src/components/auth/ProtectedRoute.tsx`  
**Severity:** CRITICAL  

There is **no `middleware.ts` file** in the project. Admin pages are protected only by a client-side React component:

```tsx
// ProtectedRoute.tsx
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  useEffect(() => {
    if (!loading && !user) router.push('/login')  // Client-side redirect only
  }, [user, loading, router])
  if (loading) return <Loader />
  if (!user) return null
  return <>{children}</>
}
```

**Impact:**
1. Admin page HTML/content is sent to the browser before the redirect executes
2. Disabling JavaScript bypasses the protection entirely
3. The check only verifies `!user` (logged in or not), **not** whether the user is an admin
4. Server-side rendering may expose admin page content in the initial HTML payload

**Fix:** Create a `middleware.ts` file that checks the session cookie on all `/admin/*` and `/api/*` routes, verifying admin claims server-side before rendering.

---

### C6. Fake Firebase Admin SDK — Token Verification Doesn't Check Roles
**File:** `src/lib/firebase-admin.ts` (lines 1–2, 30–62)  
**Severity:** CRITICAL  

Despite the filename `firebase-admin.ts`, this file uses the **client SDK** (`firebase/app`, `firebase/firestore`), not the Firebase Admin SDK (`firebase-admin`):

```ts
import { initializeApp, getApps, getApp } from 'firebase/app'  // ← Client SDK!
import { getFirestore, Firestore, FieldValue } from 'firebase/firestore'  // ← Client SDK!
```

Token verification uses the public `identitytoolkit` REST endpoint, which only checks token validity — **it does not verify custom claims or admin roles**:

```ts
export async function verifyToken(token: string) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }) }
  )
  // Returns only uid, email, name — NO custom claims
  return { uid: user.localId, email: user.email, name: user.displayName }
}
```

**Impact:**
1. No server-side admin authentication is possible with this setup
2. Firestore operations use client SDK security rules (not admin SDK which bypasses rules)
3. Custom claims (like `admin: true`) are never checked
4. The public API key is used for server-side operations, which is not its intended purpose

**Fix:** Install `firebase-admin` package, initialize it with a service account, and use `admin.auth().verifyIdToken()` which returns custom claims. Use `admin.firestore()` for server-side database access.

---

### C7. Missing Firestore Security Rules — Direct Client-Side Database Access
**File:** `src/lib/firebase.ts` (lines 1–16), no `firestore.rules` file in repo  
**Severity:** CRITICAL  

The project exports a client-side Firestore instance (`db`) that is accessible from the browser:

```ts
// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)  // ← Client-side Firestore, exposed to browser
```

There is **no `firestore.rules` file** in the repository. The Firebase config (API key, project ID, etc.) is in `NEXT_PUBLIC_*` environment variables, which are embedded in the client bundle and visible to anyone.

**Impact:** If the Firestore security rules in the Firebase console are set to test mode (common during development) or are misconfigured, anyone with the public Firebase config can directly read/write/delete all data in the database — members, contact messages, newsletter subscribers, webinar registrations — bypassing all API-level authentication entirely.

**Fix:** 
1. Create and deploy a `firestore.rules` file with strict rules (e.g., deny all reads/writes except for the specific collections that public forms need to write to)
2. Remove the client-side `db` export and use the Firebase Admin SDK server-side only
3. Ensure Firestore rules enforce role-based access using custom claims

---

## 🟠 HIGH Vulnerabilities

### H1. Mass Assignment in Firestore Update Operations
**File:** `src/lib/firestore.ts` (lines 134–141, 180–187, 211–218, 266–273)  
**Severity:** HIGH  

All `update*` functions spread user-supplied data directly into Firestore updates:

```ts
export async function updateMember(id: string, data: Partial<MemberDoc>) {
  const ref = doc(db(), 'members', id)
  await updateDoc(ref, {
    ...data,              // ← Mass assignment! Arbitrary fields
    updatedAt: new Date(),
  })
  return { id }
}
```

**Impact:** An attacker could inject arbitrary fields like `role`, `status: 'approved'`, `createdAt` override, or any other field. The `createMember` function (line 112) also uses `...data` spread.

**Fix:** Explicitly destructure only allowed fields. Never spread raw user input. Use a whitelist of updatable fields.

---

### H2. Insecure Token Storage — Token in localStorage and Response Body
**Files:** `src/app/api/auth/login/route.ts` (lines 17–22), `src/app/api/auth/register/route.ts` (lines 16–21), `src/lib/auth.ts`  
**Severity:** HIGH  

Auth tokens are returned in the JSON response body and stored by the Firebase client SDK in `localStorage`:

```ts
// login/route.ts — token in response body
const { user, token } = await loginUser(validated.email, validated.password)
const response = withSecurityHeaders(NextResponse.json({
  user: { uid: user.uid, email: user.email, displayName: user.displayName },
  token  // ← Token in response body, accessible via XSS
}))
```

The Firebase client SDK (`firebase/auth`) stores the ID token in `localStorage` by default, making it accessible to any XSS attack.

**Impact:** If an XSS vulnerability exists (even in a third-party library), the attacker can steal the auth token and impersonate the user.

**Fix:** Use httpOnly cookies exclusively for token storage. Don't return the token in the response body. Consider using Firebase's session cookie pattern with `createSessionCookie()` from the Admin SDK.

---

### H3. Bypassable Rate Limiting
**File:** `src/lib/security.ts` (lines 3–21), all API routes  
**Severity:** HIGH  

Rate limiting has multiple flaws:

1. **In-memory only** — Uses a `Map` that resets on every serverless function cold start and doesn't share state across instances:
```ts
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
```

2. **User-controlled rate limit keys** — Uses email (user input) as the key:
```ts
rateLimit(`contact:${validated.email}`, 3, 60 * 60 * 1000)  // Change email = bypass
rateLimit(`login:${clientId}`, 5, 15 * 60 * 1000)           // clientId = email
```

3. **Static keys** — Some endpoints use static keys shared across all users:
```ts
rateLimit(`webinar:create`, 10, 60 * 60 * 1000)  // Shared across ALL users
```

**Fix:** Use Redis or Vercel KV for distributed rate limiting. Use IP address + user ID as the rate limit key, not user-controlled email.

---

### H4. No CSRF Protection on State-Changing Endpoints
**Files:** All API routes with POST/PUT/DELETE, `src/lib/security.ts` (lines 48–57)  
**Severity:** HIGH  

The CSRF protection function exists but is **non-functional** — it only checks that two client-supplied headers are equal to each other, with no server-side session validation:

```ts
export function validateCsrfToken(request: Request): boolean {
  const token = request.headers.get('x-csrf-token')
  const sessionToken = request.headers.get('x-session-token')
  if (!token || !sessionToken) return false
  return token.length > 0 && sessionToken.length > 0 && token === sessionToken
  // ↑ Tautology: client sends both, just makes them equal
}
```

Furthermore, **this function is never called** in any API route. All POST/PUT/DELETE endpoints accept requests without CSRF verification.

**Impact:** An attacker can craft a malicious page that submits forms to the API endpoints (e.g., creating webinars, deleting records) while the user is authenticated via their session cookie.

**Fix:** Implement proper CSRF protection using synchronizer tokens or double-submit cookies. Use a library like `next-csrf` or implement server-side session-based CSRF tokens.

**Status update (2026-09-22 re-audit):** A proper double-submit CSRF system was implemented (`withCsrfProtection()` in `src/lib/security.ts` + client `csrfHeaders()` in `src/lib/csrf.ts`), but the rollout was **partial** — 28 admin mutating handlers across 17 route files, 6 public/auth mutations, and 22 client-side calls in 8 admin pages remain unprotected. See the **"Re-Audit: Partial CSRF Rollout"** section at the end of this report for the full inventory.

---

### H5. Email Enumeration via Registration
**File:** `src/app/api/auth/register/route.ts` (lines 27–29), `src/app/api/join/route.ts` (lines 29–33)  
**Severity:** HIGH  

Registration endpoints reveal whether an email is already registered:

```ts
// register/route.ts
if (error.code === 'auth/email-already-in-use') {
  return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
}
```

**Impact:** Attackers can enumerate valid email addresses by attempting registration, enabling targeted phishing or credential stuffing.

**Fix:** Return a generic message like "Check your email to complete registration" regardless of whether the account exists.

---

## 🟡 MEDIUM Vulnerabilities

### M1. Weak Content Security Policy
**Files:** `next.config.ts` (line 35), `src/lib/security.ts` (line 30)  
**Severity:** MEDIUM  

The CSP allows `'unsafe-eval'` and `'unsafe-inline'` for scripts:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...
```

**Impact:** These directives significantly weaken XSS protection, allowing inline script injection and `eval()` usage.

**Fix:** Remove `'unsafe-eval'` and `'unsafe-inline'` from `script-src`. Use nonces or hashes for inline scripts. Configure Next.js CSP nonce support.

---

### M2. Missing HSTS Header
**File:** `next.config.ts`  
**Severity:** MEDIUM  

No `Strict-Transport-Security` header is set in `next.config.ts` or the `Caddyfile`.

**Impact:** Without HSTS, a man-in-the-middle attack could downgrade HTTPS to HTTP on the first visit.

**Fix:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to both `next.config.ts` headers and the Caddyfile.

---

### M3. Missing `poweredByHeader: false` Configuration
**File:** `next.config.ts`  
**Severity:** MEDIUM  

The Next.js config doesn't set `poweredByHeader: false`, so the `X-Powered-By: Next.js` header is sent by default, revealing the server technology.

**Fix:** Add `poweredByHeader: false` to the Next.js config.

---

### M4. Unvalidated URL Fields (SSRF/XSS Risk)
**File:** `src/app/api/join/route.ts` (lines 84–85), `src/lib/validations.ts`  
**Severity:** MEDIUM  

The `photoUrl` and `rciCertificateUrl` fields are stored without URL validation:

```ts
photoUrl: validated.photoUrl || null,
rciCertificateUrl: validated.rciCertificateUrl || null,
```

The Zod schema marks them as `optional().nullable()` but doesn't validate them as URLs:

```ts
photoUrl: z.string().optional().nullable(),        // No URL validation
rciCertificateUrl: z.string().optional().nullable(), // No URL validation
```

**Impact:** If these URLs are ever fetched server-side (e.g., for file processing), they could enable SSRF. If rendered as `src` attributes without sanitization, they could enable XSS via `javascript:` URLs.

**Fix:** Use `z.string().url()` for URL fields. Validate against an allowlist of domains (e.g., only allow Firebase Storage URLs).

---

### M5. Sensitive Error Logging to Console
**Files:** Multiple API routes, `src/lib/auth-helpers.ts` (line 22)  
**Severity:** MEDIUM  

Error details are logged to `console.error` in production:

```ts
// auth-helpers.ts
export function createErrorResponse(error: unknown, defaultMessage: string, status: number = 500) {
  console.error(defaultMessage, error)  // ← Logs full error including stack traces
  return NextResponse.json({ error: defaultMessage }, { status })
}
```

**Impact:** In serverless platforms, console logs may be accessible to operators or leaked in error pages, potentially exposing internal paths, database structure, or secrets.

**Fix:** Use a structured logging library with log levels. Don't log full error objects in production. Sanitize error messages before logging.

---

## 🟢 LOW Vulnerabilities

### L1. Session Cookie Contains Raw Firebase ID Token
**File:** `src/app/api/auth/verify/route.ts` (lines 14–20)  
**Severity:** LOW  

The session cookie stores the raw Firebase ID token directly:

```ts
response.cookies.set('session', token, { ... })
```

**Impact:** The Firebase ID token has a fixed 1-hour expiry. The cookie is set for 2 hours. After the token expires, the cookie still contains an invalid token, but there's no server-side session refresh mechanism. This isn't a direct vulnerability but indicates missing session management.

**Fix:** Use Firebase Admin SDK's `createSessionCookie()` to create a proper session cookie with configurable expiry, separate from the ID token.

---

### L2. Newsletter Subscriber Email Leaked in Response
**File:** `src/app/api/newsletter/route.ts` (line 19)  
**Severity:** LOW  

The newsletter subscription endpoint returns the subscriber's email as the `id`:

```ts
return withSecurityHeaders(NextResponse.json({ success: true, id: subscriber.id }, { status: 201 }))
```

Since `upsertNewsletterSubscriber` uses the email as the document ID, this leaks the email back in the response.

**Fix:** Don't return the ID in the response, or use a generated ID instead of the email.

---

### L3. Weak Password Policy
**File:** `src/lib/validations.ts` (lines 5, 10, 24)  
**Severity:** LOW  

Password validation only requires a minimum of 8 characters with no complexity requirements:

```ts
password: z.string().min(8, 'Password must be at least 8 characters')
```

**Impact:** Users can use weak passwords like `password` or `12345678`.

**Fix:** Add complexity requirements (uppercase, lowercase, number, special character) or integrate with a password strength checker like `zxcvbn`.

---

## 📋 Summary of Affected Files

| File | Vulnerabilities |
|------|----------------|
| `Caddyfile` | C1 (SSRF) |
| `src/lib/auth-helpers.ts` | C2 (No role checks), M5 (Error logging) |
| `src/app/api/join/route.ts` | C3 (No auth on GET), H5 (Email enumeration), M4 (Unvalidated URLs) |
| `src/app/api/auth/register/route.ts` | C4 (Open registration), H2 (Token in body), H5 (Email enumeration) |
| `src/app/api/auth/login/route.ts` | H2 (Token in body) |
| `src/app/admin/layout.tsx` | C4, C5 (Client-side only protection) |
| `src/components/auth/ProtectedRoute.tsx` | C5 (Client-side only, no role check) |
| `src/lib/firebase-admin.ts` | C6 (Fake admin SDK, no claim verification) |
| `src/lib/firebase.ts` | C7 (Missing Firestore rules, client DB access) |
| `src/lib/firestore.ts` | H1 (Mass assignment) |
| `src/lib/security.ts` | H3 (Rate limiting), H4 (CSRF), M1 (CSP) |
| `next.config.ts` | M1 (CSP), M2 (HSTS), M3 (poweredByHeader) |
| All API routes | C2, H4 (No CSRF) |
| `src/app/api/newsletter/route.ts` | L2 (Email leak) |
| `src/lib/validations.ts` | L3 (Weak password), M4 (No URL validation) |

---

## 🛠️ Recommended Priority Fixes

1. **Immediate:** Remove the SSRF handler from the `Caddyfile`
2. **Immediate:** Add authentication to `GET /api/join` (or remove it)
3. **Immediate:** Install `firebase-admin` and implement proper token verification with custom claims
4. **Immediate:** Create `middleware.ts` for server-side admin route protection
5. **Immediate:** Remove open registration / add admin approval workflow
6. **High:** Implement `requireAdmin()` helper and apply to all admin API routes
7. **High:** Fix mass assignment by whitelisting fields in update operations
8. **High:** Implement proper CSRF protection
9. **High:** Move to Redis-based distributed rate limiting
10. **Medium:** Strengthen CSP, add HSTS, disable poweredByHeader

---

## 🔁 Re-Audit: Partial CSRF Rollout & Endpoint Hardening Gaps (September 22, 2026)

**Commit:** `101e342` (branch `Production-Final`)  
**Method:** Automated per-handler scan of all 50 `src/app/api/**/route.ts` files (each POST/PUT/PATCH/DELETE handler checked for `withCsrfProtection`, auth, audit logging, body-size limit) plus a per-call scan of all admin pages (each mutating `fetch` checked for `csrfHeaders`).  
**Finding H4 status:** PARTIALLY REMEDIATED. There is no global CSRF gate in middleware — any route not explicitly calling `withCsrfProtection()` accepts cross-site mutations from an authenticated admin session. The double-submit infra itself (`src/lib/security.ts` / `src/lib/csrf.ts`) works; only its coverage is incomplete.

### A. Admin-only mutations with NO server-side CSRF — HIGH (28 handlers / 17 files)

Any malicious page can silently perform these actions while an admin's session cookie is active.

| # | Route file | Unprotected handlers | Impact |
|---|------------|---------------------|--------|
| 1 | `src/app/api/announcements/[id]/route.ts` | `PUT`, `DELETE` | Fake/edit/delete announcements site-wide |
| 2 | `src/app/api/contact/[id]/route.ts` | `PATCH`, `DELETE` | Mark contact messages read / delete them |
| 3 | `src/app/api/events/[id]/route.ts` | `PUT`, `DELETE` | Edit/delete events |
| 4 | `src/app/api/gallery/route.ts` | `POST`, `PUT`, `DELETE` | Deface photo gallery |
| 5 | `src/app/api/members/route.ts` | `POST` | Create member records |
| 6 | `src/app/api/members/[id]/route.ts` | **`PUT` (includes member APPROVAL)**, `DELETE` | Approve applications, alter admin-assigned membership IDs, delete members — triggers cascading certificate/receipt auto-issuance |
| 7 | `src/app/api/newsletter/campaigns/route.ts` | `POST` | Send email campaigns |
| 8 | `src/app/api/newsletter/campaigns/[id]/route.ts` | `PUT`, `DELETE` | Edit/delete campaigns |
| 9 | `src/app/api/newsletter/[id]/route.ts` | `DELETE` | Delete subscribers |
| 10 | `src/app/api/publications/route.ts` | `POST`, `PUT`, `DELETE` | Manipulate publications |
| 11 | `src/app/api/publications/submissions/[id]/route.ts` | `PATCH`, `DELETE` | Approve/reject/delete submissions |
| 12 | `src/app/api/receipts/route.ts` | `POST` | Forge receipts |
| 13 | `src/app/api/receipts/[id]/route.ts` | `PATCH`, `DELETE` | Alter payment records |
| 14 | `src/app/api/webinars/route.ts` | `POST` | Create webinars |
| 15 | `src/app/api/webinars/[id]/route.ts` | `PUT`, `DELETE` | Edit/delete webinars |
| 16 | `src/app/api/webinars/register/[id]/route.ts` | `PATCH`, `DELETE` | Confirm/reject/delete registrations |
| 17 | `src/app/api/webinars/register/[id]/receipt/route.ts` | `POST` | Issue webinar receipts |

For contrast, CSRF is already enforced on: `join` POST, `contact` POST, `auth/register` POST, `upload` POST, `testimonials` POST/PUT/DELETE, `announcements` POST, `events` POST, and all 6 certificate endpoints (incl. `certificates/[id]` PUT/DELETE fixed in commit `101e342`).

### B. Public/member mutations with NO CSRF — MEDIUM (6 handlers / 5 files)

The codebase's own convention enforces CSRF on public forms (`join`, `contact`, `auth/register`) — these break that convention:

| # | Route | Handler | Concern |
|---|-------|---------|---------|
| 18 | `src/app/api/newsletter/route.ts` | `POST` (subscribe) | Mail-bombing abuse |
| 19 | `src/app/api/publications/submissions/route.ts` | `POST` | Spam submissions |
| 20 | `src/app/api/webinars/register/route.ts` | `POST` | Spam registrations |
| 21 | `src/app/api/auth/login/route.ts` | `POST` | **Login CSRF** — attacker can silently log a victim into an attacker-controlled account |
| 22 | `src/app/api/auth/logout/route.ts` | `POST` | Forced logout nuisance (low) |
| 23 | `src/app/api/auth/verify/route.ts` | `POST` | Inspect before fixing — may be acceptable if token-bearing (one-time-token semantics) |

Note: `newsletter/unsubscribe` mutates via `GET` (email-link constraint — different class of issue; document, don't auto-fix).

### C. Client-side gaps — admin pages that would 403 once the server fixes land — HIGH

Must be fixed in the same pass as A, or admin create/edit/delete/toggle actions will break:

| Page | Mutating fetches | Carrying `csrfHeaders` | Missing |
|------|-----------------|------------------------|---------|
| `src/app/admin/members/page.tsx` | 3 (approve PUT, edit, delete) | 0 — does not even import `csrfHeaders` | 3 |
| `src/app/admin/publications/page.tsx` | 4 | 0 — no import | 4 |
| `src/app/admin/messages/page.tsx` | 2 | 0 — no import | 2 |
| `src/app/admin/newsletter/page.tsx` | 3 | 0 — no import | 3 |
| `src/app/admin/webinars/page.tsx` | 6 | 1 (create only) | 5 |
| `src/app/admin/announcements/page.tsx` | 2 (delete, toggle) | 0 — imports `csrfHeaders` but doesn't use it on these calls | 2 |
| `src/app/admin/events/page.tsx` | 2 (delete, toggle) | 0 — same pattern | 2 |
| `src/app/admin/gallery/page.tsx` | 2 | 1 (create only) | 1 |

(Reference implementations: `admin/certificates/page.tsx` and `admin/certificates/templates/page.tsx` — all mutating calls use `csrfHeaders()`. Note that certificate revocation/deletion previously suffered from this exact gap and was fixed in commit `101e342`.)

### D. Secondary hardening gaps replicating on `[id]` routes (same family as the certificates fixes)

Verified by code inspection:

- **`members/[id]` PUT**: `if (body.status)` accepts **any** status string (no whitelist) → member-status corruption with cascading certificate/receipt auto-issuance effects; empty body = silent "updated successfully" no-op; no 404 on missing member; no audit log.
- **`receipts/[id]` PATCH**: status whitelist ✅ but no CSRF, no empty-update rejection, no 404-on-not-found, no audit.
- **`webinars/register/[id]` PATCH**: status whitelist ✅, no CSRF, no audit log.
- General rule for the remaining Group A `[id]` routes: check for field/status whitelists, empty-update rejection, 404-on-not-found, and `logApiRequest` audit — the certificates `[id]` route (commit `101e342`) is the reference pattern.

### Re-Audit Remediation Plan (for follow-up work)

1. **Phase 1 — Server CSRF parity:** add `withCsrfProtection` to all 28 Group A handlers, mirroring `certificates/[id]/route.ts` (admin auth → CSRF → handler).
2. **Phase 2 — Client fixes:** add `csrfHeaders()` to all 22 missing client calls in the 8 Group C pages (import where missing) so nothing 403s after Phase 1.
3. **Phase 3 — Public/auth endpoints (Group B):** add CSRF to `newsletter` POST, `publications/submissions` POST, `webinars/register` POST (public pages already ship the token — same pattern as `join`/`contact`). `auth/login`: add + update login page client. `auth/logout`: add. `auth/verify`: inspect first.
4. **Phase 4 — Secondary hardening (Group D):** field/status whitelists, empty-update rejection, 404-on-not-found, `logApiRequest` audit on admin mutations — conservatively, mirroring the certificates `[id]` pattern.
5. **Phase 5 — Verification:** `tsc --noEmit`, eslint on touched files, `npm test`, `next build`, plus a page-by-page sanity check of every admin create/edit/delete/toggle.

### Re-Audit Summary of Affected Files

| File | Issue |
|------|-------|
| `src/app/api/announcements/[id]/route.ts` | A (PUT, DELETE no CSRF) |
| `src/app/api/contact/[id]/route.ts` | A (PATCH, DELETE) |
| `src/app/api/events/[id]/route.ts` | A (PUT, DELETE) |
| `src/app/api/gallery/route.ts` | A (POST, PUT, DELETE) |
| `src/app/api/members/route.ts` | A (POST) |
| `src/app/api/members/[id]/route.ts` | A (PUT, DELETE) + D (no status whitelist, silent no-op, no 404/audit) |
| `src/app/api/newsletter/campaigns/route.ts` | A (POST) |
| `src/app/api/newsletter/campaigns/[id]/route.ts` | A (PUT, DELETE) |
| `src/app/api/newsletter/[id]/route.ts` | A (DELETE) |
| `src/app/api/publications/route.ts` | A (POST, PUT, DELETE) |
| `src/app/api/publications/submissions/route.ts` | B (POST no CSRF) |
| `src/app/api/publications/submissions/[id]/route.ts` | A (PATCH, DELETE) |
| `src/app/api/receipts/route.ts` | A (POST) |
| `src/app/api/receipts/[id]/route.ts` | A (PATCH, DELETE) + D (no 404/audit) |
| `src/app/api/webinars/route.ts` | A (POST) |
| `src/app/api/webinars/[id]/route.ts` | A (PUT, DELETE) |
| `src/app/api/webinars/register/route.ts` | B (POST no CSRF) |
| `src/app/api/webinars/register/[id]/route.ts` | A (PATCH, DELETE) + D (no audit) |
| `src/app/api/webinars/register/[id]/receipt/route.ts` | A (POST) |
| `src/app/api/newsletter/route.ts` | B (POST no CSRF) |
| `src/app/api/auth/login/route.ts` | B (login CSRF) |
| `src/app/api/auth/logout/route.ts` | B (low) |
| `src/app/api/auth/verify/route.ts` | B (inspect first) |
| `src/app/admin/members/page.tsx` | C (3 calls, no csrfHeaders import) |
| `src/app/admin/publications/page.tsx` | C (4 calls, no import) |
| `src/app/admin/messages/page.tsx` | C (2 calls, no import) |
| `src/app/admin/newsletter/page.tsx` | C (3 calls, no import) |
| `src/app/admin/webinars/page.tsx` | C (5 of 6 calls missing) |
| `src/app/admin/announcements/page.tsx` | C (2 calls missing despite import) |
| `src/app/admin/events/page.tsx` | C (2 calls missing despite import) |
| `src/app/admin/gallery/page.tsx` | C (1 call missing) |
| `src/middleware.ts` (absent) | Note: no global CSRF gate — every route must opt in explicitly |