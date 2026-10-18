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

// ─── Firebase App Check client fetch patch (APP_CHECK.md §4–§5) ─────────────
// A same-origin fetch interceptor that attaches the x-firebase-appcheck
// header (plus the CSRF double-submit header on mutations) to every
// /api/* request. One install point covers all current and future call
// sites — no per-call-site edits needed.
//
// Why an interceptor instead of editing 54 call sites:
//   - async header injection (getAppCheckToken) can't be expressed in the
//     existing sync csrfHeaders() helper without touching every caller;
//   - fail-open by design: when App Check is unconfigured (site key absent,
//     server-side, or token fetch fails), the request proceeds WITHOUT the
//     header. Off/monitor modes allow; only enforce mode 403s — which is
//     unreachable until the server env flag is deliberately flipped.
//
// Installed once from AuthProvider (src/lib/hooks/useAuth.tsx), which mounts
// inside the root layout. Idempotent: HMR remounts and double-invoked
// effects re-patch safely (the guard tracks installation on globalThis).

declare global {
  var __upishaAppCheckFetchPatched: boolean | undefined
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function isSameOriginApiRequest(input: RequestInfo | URL): boolean {
  try {
    const url = new URL(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url,
      typeof window !== 'undefined' ? window.location.href : undefined
    )
    if (typeof window !== 'undefined' && url.origin !== window.location.origin) {
      return false
    }
    return url.pathname === '/api' || url.pathname.startsWith('/api/')
  } catch {
    return false
  }
}

function resolveMethod(init: RequestInit | undefined, input: RequestInfo | URL): string {
  if (init?.method) return init.method.toUpperCase()
  if (typeof input !== 'string' && !(input instanceof URL) && 'method' in input) {
    return (input.method || 'GET').toUpperCase()
  }
  return 'GET'
}

/**
 * Install the App Check fetch interceptor. Safe to call multiple times;
 * only the first call patches window.fetch.
 */
export function patchFetchForAppCheck(
  getToken: () => Promise<string | null> = () =>
    import('./app-check').then((m) => m.getAppCheckToken()),
  getCsrf: typeof csrfHeaders = csrfHeaders
): void {
  if (typeof window === 'undefined') return
  if (globalThis.__upishaAppCheckFetchPatched) return
  globalThis.__upishaAppCheckFetchPatched = true

  const originalFetch = window.fetch.bind(window)
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!isSameOriginApiRequest(input)) {
      return originalFetch(input as RequestInfo, init)
    }

    let token: string | null = null
    try {
      token = await getToken()
    } catch {
      token = null // fail-open: proceed without the header
    }
    if (!token) {
      return originalFetch(input as RequestInfo, init)
    }

    const method = resolveMethod(init, input)
    const csrf = MUTATING_METHODS.has(method) ? getCsrf() : {}

    // Merge order: caller's explicit headers win over injected ones.
    const headers = new Headers(
      init?.headers ??
        (typeof input !== 'string' && !(input instanceof URL) ? input.headers : undefined)
    )
    if (!headers.has('x-firebase-appcheck')) {
      headers.set('x-firebase-appcheck', token)
    }
    for (const [key, value] of Object.entries(csrf)) {
      if (!headers.has(key)) headers.set(key, value)
    }
    return originalFetch(input as RequestInfo, { ...init, headers })
  }) as typeof window.fetch
}

/** Reset the patch guard (unit tests only). */
export function __resetFetchPatchForTests(): void {
  globalThis.__upishaAppCheckFetchPatched = false
}