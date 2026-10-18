/**
 * Server-side Firebase Admin SDK singleton.
 *
 * This is the REAL Admin SDK (service-account credential) — distinct from
 * `firebase-client.ts`, which lazily initializes the client/Web SDK. All
 * privileged server work must go through this module:
 *
 *   - verifyIdToken() with revocation checking (replaces the REST
 *     identitytoolkit accounts:lookup, which cannot check revocation or
 *     read custom claims)
 *   - Firestore reads/writes that must not be evaluated against the
 *     Firestore security rules (API routes have no `request.auth`, so
 *     isAdmin()/isOwner() in the rules would deny them)
 *   - Storage uploads/deletes for the same reason
 *   - Rate-limit transactions on `rate_limits` (no client-facing rule)
 *
 * ─── Credential configuration ────────────────────────────────────────────
 * Uses three individual env vars extracted from the service-account JSON
 * key downloaded from the GCP console (no base64, no key file on disk):
 *
 *   FIREBASE_ADMIN_PROJECT_ID     <- JSON `project_id`
 *   FIREBASE_ADMIN_CLIENT_EMAIL   <- JSON `client_email`
 *   FIREBASE_ADMIN_PRIVATE_KEY    <- JSON `private_key` (single line,
 *                                    escaped \n sequences preserved)
 *
 * The private key is normalized below so both the escaped (recommended)
 * and real-newline paste variants work. NEVER set these with a
 * NEXT_PUBLIC_ prefix — they would be bundled into the browser.
 */
import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage, type Storage } from 'firebase-admin/storage'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getAppCheck } from 'firebase-admin/app-check'

// Fail fast if this module ever ends up in the browser bundle.
// The Admin SDK requires Node APIs and must never ship client-side.
if (typeof window !== 'undefined') {
  throw new Error(
    'src/lib/firebase-server.ts (Firebase Admin SDK) must only be imported from server-side code (API routes, middleware, Server Components).'
  )
}

/** Service-account ID token claims after verification. */
export interface VerifiedToken {
  uid: string
  email: string | null
  name: string | null
  emailVerified: boolean
  claims: Record<string, unknown>
}

const ADMIN_APP_NAME = 'upisha-admin'

function buildAdminCredential(): App['options'] {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

  if (!projectId || !clientEmail || !rawPrivateKey) {
    throw new Error(
      'Firebase Admin SDK is not configured: set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY (values extracted from the service-account JSON key).'
    )
  }

  // Normalize the private key so both paste variants work:
  //  1) strip stray surrounding quotes (a common copy artifact)
  //  2) unescape JSON-style "\n" into real newlines (no-op if the value
  //     already contains real newlines)
  const privateKey = rawPrivateKey
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n')

  // The Admin SDK does NOT infer a default Storage bucket from the project
  // ID (unlike the client SDK) — without an explicit bucket,
  // getStorage().bucket() throws "Bucket name not specified or invalid".
  // Prefer the dedicated server var, falling back to the public client
  // config value (it is public by design and safe to read server-side).
  const storageBucket =
    process.env.FIREBASE_ADMIN_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  return {
    credential: cert({ projectId, clientEmail, privateKey }),
    // Explicit projectId keeps token verification deterministic even if
    // the env var used for the client SDK differs.
    projectId,
    ...(storageBucket ? { storageBucket } : {}),
  }
}

/** Lazily initialize (and memoize) the Admin app. */
export function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME)
  if (existing) return existing
  // During build-time page-data collection env vars may be absent; defer
  // initialization until the first runtime call that actually needs it.
  return initializeApp(buildAdminCredential(), ADMIN_APP_NAME)
}

let firestoreInstance: Firestore | null = null
let storageInstance: Storage | null = null
let authInstance: Auth | null = null

/** Admin Firestore (bypasses security rules — server-only). */
export function getAdminDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getAdminApp())
  }
  return firestoreInstance
}

/** Admin Storage (bypasses storage.rules — server-only). */
export function getAdminStorage(): Storage {
  if (!storageInstance) {
    storageInstance = getStorage(getAdminApp())
  }
  return storageInstance
}

/** Admin Auth (token verification with revocation, user management). */
export function getAdminAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getAdminApp())
  }
  return authInstance
}

/**
 * Verify a Firebase ID token server-side using the Admin SDK.
 *
 * With `checkRevoked = true` (recommended), the token is rejected if the
 * user's tokens were invalidated (e.g. password change, account disable,
 * explicit revokeRefreshTokens call). This was impossible with the previous
 * REST accounts:lookup approach.
 */
export async function verifyIdToken(
  token: string,
  checkRevoked = true
): Promise<VerifiedToken> {
  const decoded = await getAdminAuth().verifyIdToken(token, checkRevoked)
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    name: decoded.name ?? null,
    emailVerified: decoded.email_verified === true,
    claims: (decoded as unknown as Record<string, unknown>) ?? {},
  }
}

// ─── Firebase App Check verification (APP_CHECK.md §5) ───────────────────────

/** Enforcement mode for API-layer App Check verification. */
export type AppCheckMode = 'off' | 'monitor' | 'enforce'

/** Read fresh on every call (tests + env changes take effect without reboot). */
export function getAppCheckMode(): AppCheckMode {
  const mode = (process.env.APP_CHECK_MODE ?? 'off').toLowerCase()
  return mode === 'monitor' || mode === 'enforce' ? mode : 'off'
}

export type AppCheckResult =
  | { valid: true; appId: string }
  | { valid: false; reason: 'missing-header' | 'invalid-token' | 'disabled' }

/**
 * Verify the App Check token on an incoming API request.
 *
 * Reads `APP_CHECK_MODE` (default `off`):
 *   - `off`     → returns `{ valid: false, reason: 'disabled' }` without
 *                  touching the network (kill-switch default, zero risk).
 *   - `monitor` → verifies but callers must ALLOW anyway; failures are logged
 *                  to `api_logs` so the false-positive rate can be measured.
 *   - `enforce` → callers must return 403 on failure.
 *
 * Replay protection (`{ consume: true }`) is deliberately deferred — it is
 * beta, Node-only, adds latency, and requires the Firebase App Check Token
 * Verifier IAM role. See APP_CHECK.md §5.
 */
export async function verifyAppCheckToken(
  request: Request
): Promise<AppCheckResult> {
  if (getAppCheckMode() === 'off') {
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
