/**
 * Client-side CSRF helper using the Double Submit Cookie pattern.
 * Generates a token once per page load, stores it in a non-httpOnly cookie,
 * and attaches it as the x-csrf-token header on mutating requests.
 */

const CSRF_COOKIE_NAME = 'csrf-token'
let csrfToken: string | null = null

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string): void {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

/**
 * Get (or create) the CSRF token for the current page session.
 */
export function getCsrfToken(): string {
  if (csrfToken) return csrfToken

  // Reuse an existing cookie token if present
  const existing = getCookie(CSRF_COOKIE_NAME)
  if (existing) {
    csrfToken = existing
    return existing
  }

  // Otherwise generate and persist a new one
  const token = generateToken()
  setCookie(CSRF_COOKIE_NAME, token)
  csrfToken = token
  return token
}

/**
 * Build headers for a mutating request (POST/PUT/DELETE/PATCH).
 * Merges any user-provided headers with the CSRF header.
 */
export function csrfHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'x-csrf-token': getCsrfToken(),
    ...extraHeaders,
  }
}