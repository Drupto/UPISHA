/**
 * Firebase App Check — client-side initialization (browser only).
 *
 * Attestation provider: reCAPTCHA Enterprise (score-based key — keeps every
 * enforcement door open, including Identity Platform Auth enforcement later).
 * See APP_CHECK.md §2–§4 for the provider decision and full rollout plan.
 *
 * Lazy singleton, SSR-safe, and a graceful no-op when unconfigured:
 *   - server → null (App Check is a browser attestation)
 *   - NEXT_PUBLIC_APP_CHECK_SITE_KEY missing → null (feature off, zero risk)
 *
 * Token refresh (≈2/hour with auto-refresh) costs one Enterprise assessment
 * each — the free tier is 10k/month. APP_CHECK.md §2 documents the cost model.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  getToken,
  type AppCheck,
} from 'firebase/app-check'

let appCheckInstance: AppCheck | null = null

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

/**
 * Initialize (once) and return the App Check instance.
 * Returns null when unset (feature flag off) or on the server.
 */
export function getAppCheckInstance(): AppCheck | null {
  if (typeof window === 'undefined') return null
  if (appCheckInstance) return appCheckInstance
  const siteKey = process.env.NEXT_PUBLIC_APP_CHECK_SITE_KEY
  if (!siteKey) return null
  if (process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN === 'true') {
    // The SDK logs the debug token to the console → register it in
    // Firebase Console → App Check → Manage debug tokens. LOCAL ONLY —
    // never set this in production (enforced: README documents this).
    ;(self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean })
      .FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }
  appCheckInstance = initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    // ~2 refreshes/hour → 2 assessments/hour per active client
    isTokenAutoRefreshEnabled: true,
  })
  return appCheckInstance
}

/**
 * Fresh token for the x-firebase-appcheck request header.
 * Returns null when App Check is off — callers must tolerate this
 * (monitor/off modes allow; enforce mode 403s by design).
 */
export async function getAppCheckToken(): Promise<string | null> {
  const appCheck = getAppCheckInstance()
  if (!appCheck) return null
  try {
    const { token } = await getToken(appCheck, false)
    return token
  } catch {
    return null
  }
}

/** Reset the singleton (unit tests only). */
export function __resetAppCheckForTests(): void {
  appCheckInstance = null
}
