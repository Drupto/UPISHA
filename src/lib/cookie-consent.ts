/**
 * Cookie / storage consent — pure helpers (no React, SSR-safe).
 *
 * The consent choice is stored in localStorage (not a cookie), so it is never
 * sent to our servers and cannot be read by third-party scripts. The record is
 * versioned: bumping COOKIE_CONSENT_VERSION invalidates every stored choice and
 * makes the banner appear again (e.g. after adding a new optional category).
 *
 * Categories
 *  - necessary: always true — session cookie, CSRF token, this consent record,
 *    and on-device UI preferences. These cannot be switched off.
 *  - analytics: opt-in only — Google Analytics 4. Off unless the visitor
 *    explicitly accepts it in the banner/preferences dialog.
 */

export const COOKIE_CONSENT_STORAGE_KEY = 'upisha-cookie-consent-v2'
/** Legacy banner key (values: accepted | declined | auto-dismissed). Ignored. */
export const LEGACY_COOKIE_CONSENT_KEY = 'upisha-cookie-consent'
export const COOKIE_CONSENT_VERSION = 1

/** Fired on `window` whenever the stored choice changes (same tab). */
export const COOKIE_CONSENT_CHANGED_EVENT = 'upisha:cookie-consent-changed'
/** Dispatch this on `window` to ask the global banner to open preferences. */
export const OPEN_COOKIE_SETTINGS_EVENT = 'upisha:open-cookie-settings'

export type OptionalConsentCategory = 'analytics'

export interface CookieConsentCategories {
  necessary: true
  analytics: boolean
}

export interface CookieConsentRecord {
  version: number
  /** ISO timestamp of the visitor's most recent choice. */
  decidedAt: string
  categories: CookieConsentCategories
}

/** Minimal Storage surface so the helpers are trivially testable. */
export interface ConsentStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Returns localStorage in the browser, or null during SSR / private-mode errors. */
export function getConsentStorage(): ConsentStorage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Build a fresh, immutable consent record. Analytics is opt-in. */
export function createConsent(
  input: { analytics?: boolean } = {}
): CookieConsentRecord {
  return {
    version: COOKIE_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    categories: {
      necessary: true,
      analytics: input.analytics === true,
    },
  }
}

/**
 * Parse a raw stored value. Returns null for anything that is not a complete,
 * current-version record — callers must treat null as "no decision yet".
 */
export function parseConsent(raw: string | null): CookieConsentRecord | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isRecord(parsed)) return null
  if (parsed.version !== COOKIE_CONSENT_VERSION) return null
  if (typeof parsed.decidedAt !== 'string') return null
  if (Number.isNaN(Date.parse(parsed.decidedAt))) return null

  const categories = parsed.categories
  if (!isRecord(categories)) return null
  if (categories.necessary !== true) return null
  if (typeof categories.analytics !== 'boolean') return null

  return {
    version: COOKIE_CONSENT_VERSION,
    decidedAt: parsed.decidedAt,
    categories: {
      necessary: true,
      analytics: categories.analytics,
    },
  }
}

export function readConsent(
  storage: ConsentStorage | null = getConsentStorage()
): CookieConsentRecord | null {
  if (!storage) return null
  try {
    return parseConsent(storage.getItem(COOKIE_CONSENT_STORAGE_KEY))
  } catch {
    return null
  }
}

/** Persist a record. Returns false when storage is unavailable/quota-blocked. */
export function writeConsent(
  record: CookieConsentRecord,
  storage: ConsentStorage | null = getConsentStorage()
): boolean {
  if (!storage) return false
  try {
    storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record))
    return true
  } catch {
    return false
  }
}

export function clearConsent(
  storage: ConsentStorage | null = getConsentStorage()
): void {
  if (!storage) return
  try {
    storage.removeItem(COOKIE_CONSENT_STORAGE_KEY)
  } catch {
    // Ignore — storage may be blocked.
  }
}

/** Remove the pre-consent-banner key so it cannot linger on devices. */
export function clearLegacyConsent(
  storage: ConsentStorage | null = getConsentStorage()
): void {
  if (!storage) return
  try {
    storage.removeItem(LEGACY_COOKIE_CONSENT_KEY)
  } catch {
    // Ignore — storage may be blocked.
  }
}

/** True only when the visitor explicitly opted in to the category. */
export function hasConsent(
  record: CookieConsentRecord | null,
  category: OptionalConsentCategory
): boolean {
  if (!record) return false
  return record.categories[category] === true
}

/** Notify same-tab listeners (analytics bootstrapping, custom integrations). */
export function emitConsentChanged(
  record: CookieConsentRecord | null
): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<CookieConsentRecord | null>(COOKIE_CONSENT_CHANGED_EVENT, {
      detail: record,
    })
  )
}

/** Ask the globally mounted banner to open its preferences dialog. */
export function requestOpenCookieSettings(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
}
