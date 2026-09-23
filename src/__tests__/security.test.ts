/**
 * @jest-environment node
 *
 * Pure-logic tests for src/lib/security.ts. Node environment is required
 * because the module imports next/server (needs the global Request class).
 */
import { rateLimit, resetRateLimit, sanitizeHtml, getClientIp, validateCsrfToken, withCsrfProtection, withSecurityHeaders } from '@/lib/security'

describe('rateLimit (in-memory)', () => {
  it('allows up to maxRequests then blocks, and resets on demand', () => {
    const id = `test:${Date.now()}:${Math.random()}`
    expect(rateLimit(id, 3, 60_000)).toBe(true)
    expect(rateLimit(id, 3, 60_000)).toBe(true)
    expect(rateLimit(id, 3, 60_000)).toBe(true)
    expect(rateLimit(id, 3, 60_000)).toBe(false) // 4th within window → blocked
    resetRateLimit(id)
    expect(rateLimit(id, 3, 60_000)).toBe(true) // reset → allowed again
  })

  it('allows again after the window expires', () => {
    const id = `test-window:${Date.now()}:${Math.random()}`
    expect(rateLimit(id, 1, -1)).toBe(true) // negative window = already expired
    expect(rateLimit(id, 1, -1)).toBe(true) // expired window resets the counter
  })
})

describe('sanitizeHtml (XSS escaping)', () => {
  it('escapes script tags and angle brackets', () => {
    const out = sanitizeHtml('<script>alert(1)</script>')
    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script&gt;')
  })

  it('escapes ampersands and quotes', () => {
    const out = sanitizeHtml(`a & b "c" 'd'`)
    expect(out).toContain('&amp;')
    expect(out).toContain('&quot;')
    expect(out).toContain('&#039;')
  })

  it('returns falsy input unchanged', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})

describe('getClientIp (proxy header parsing)', () => {
  const req = (headers: Record<string, string>) => new Request('https://x.test/api', { headers })

  it('uses the first entry of x-forwarded-for', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    expect(getClientIp(req({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9')
  })

  it('returns "unknown" when no proxy headers exist', () => {
    expect(getClientIp(req({}))).toBe('unknown')
  })
})

describe('validateCsrfToken (double-submit cookie)', () => {
  const req = (headers: Record<string, string>) => new Request('https://x.test/api', { headers })

  it('accepts when header matches the csrf-token cookie', () => {
    expect(
      validateCsrfToken(req({ 'x-csrf-token': 'abc123', cookie: 'other=1; csrf-token=abc123' }))
    ).toBe(true)
  })

  it('rejects a mismatched header/cookie pair', () => {
    expect(
      validateCsrfToken(req({ 'x-csrf-token': 'abc123', cookie: 'csrf-token=zzz' }))
    ).toBe(false)
  })

  it('rejects when either part is missing', () => {
    expect(validateCsrfToken(req({ 'x-csrf-token': 'abc123' }))).toBe(false)
    expect(validateCsrfToken(req({ cookie: 'csrf-token=abc123' }))).toBe(false)
  })
})

describe('withCsrfProtection (403 gate used by every mutating handler)', () => {
  const req = (headers: Record<string, string>) => new Request('https://x.test/api', { headers })

  it('returns null (allow) when the header matches the cookie', () => {
    const result = withCsrfProtection(
      req({ 'x-csrf-token': 'tok', cookie: 'csrf-token=tok' })
    )
    expect(result).toBeNull()
  })

  it('returns a 403 NextResponse when the token is missing', () => {
    const result = withCsrfProtection(req({}))
    expect(result).not.toBeNull()
    expect(result!.status).toBe(403)
  })

  it('returns a 403 NextResponse on a mismatched pair', () => {
    const result = withCsrfProtection(
      req({ 'x-csrf-token': 'tok', cookie: 'csrf-token=other' })
    )
    expect(result).not.toBeNull()
    expect(result!.status).toBe(403)
  })

  it('the 403 response carries security headers (matches handler pattern withSecurityHeaders(csrfError))', () => {
    const blocked = withCsrfProtection(req({}))!
    const wrapped = withSecurityHeaders(blocked)
    expect(wrapped.headers.get('x-content-type-options')).toBe('nosniff')
    expect(wrapped.headers.get('strict-transport-security')).toContain('max-age=31536000')
  })
})
