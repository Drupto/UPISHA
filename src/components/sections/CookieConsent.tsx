/**
 * Cookie consent now lives in the shared consent module and is mounted once in
 * the root layout (so it appears on every page, not just the home page).
 * This re-export keeps the existing sections barrel import working.
 */
export { CookieConsent } from '@/components/consent/CookieConsent'


