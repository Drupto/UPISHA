/**
 * Shared containment + rate-limit helpers for public POST endpoints.
 *
 * Two independent brakes:
 *  1. `PUBLIC_FORMS_DISABLED=true` makes every public form return 503 without
 *     needing a WAF/vendor change. Use during an active abuse incident.
 *  2. Firestore-backed, fail-CLOSED per-IP / global / email limits. These do
 *     not rely on per-instance memory (which is useless on serverless).
 *
 * SERVER ONLY.
 */

import { NextResponse } from 'next/server'
import { withSecurityHeaders } from '@/lib/security'
import { checkRateLimitStrict, getClientIp } from '@/lib/firestore-rate-limit'

const DISABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])

export function arePublicFormsDisabled(): boolean {
  return DISABLED_VALUES.has(
    (process.env.PUBLIC_FORMS_DISABLED ?? '').trim().toLowerCase()
  )
}

/** Returns a 503 response when the operator kill switch is on. */
export function publicFormsDisabledResponse(): NextResponse | null {
  if (!arePublicFormsDisabled()) return null
  return withSecurityHeaders(
    NextResponse.json(
      {
        error:
          'This form is temporarily unavailable while we complete a security review. Please try again later.',
      },
      { status: 503, headers: { 'Retry-After': '3600' } }
    )
  )
}

interface PublicLimitOptions {
  /** Per-IP requests allowed inside the window (default 10). */
  perIp?: number
  /** Site-wide requests allowed for this route inside the window (default 100). */
  global?: number
  /** Window size in ms (default 1 hour). */
  windowMs?: number
  /** Optional secondary key (e.g. the submitted email). */
  email?: string
  perEmail?: number
}

function rateLimitedResponse(message: string): NextResponse {
  return withSecurityHeaders(
    NextResponse.json(
      { error: message },
      { status: 429, headers: { 'Retry-After': '3600' } }
    )
  )
}

/**
 * Enforces per-IP, global and optional per-email limits.
 * Returns a 429/503 response when the request should stop, otherwise null.
 * Fail-closed: a limiter outage returns 503 instead of opening the floodgates.
 */
export async function enforcePublicEndpointLimit(
  request: Request,
  route: string,
  options: PublicLimitOptions = {}
): Promise<NextResponse | null> {
  const {
    perIp = 10,
    global = 100,
    windowMs = 60 * 60 * 1000,
    email,
    perEmail = 5,
  } = options

  const ip = getClientIp(request.headers)
  const safeRoute = route.replace(/[^a-z0-9-]/gi, '-').toLowerCase()

  try {
    const ipCheck = await checkRateLimitStrict(
      `public:${safeRoute}:ip:${ip}`,
      perIp,
      windowMs
    )
    if (!ipCheck.allowed) {
      return rateLimitedResponse(
        'Too many attempts from this network. Please try again later.'
      )
    }

    const globalCheck = await checkRateLimitStrict(
      `public:${safeRoute}:global`,
      global,
      windowMs
    )
    if (!globalCheck.allowed) {
      return rateLimitedResponse(
        'This form is receiving too many requests. Please try again later.'
      )
    }

    if (email) {
      const emailCheck = await checkRateLimitStrict(
        `public:${safeRoute}:email:${email.toLowerCase()}`,
        perEmail,
        windowMs
      )
      if (!emailCheck.allowed) {
        return rateLimitedResponse(
          'Too many attempts for this email address. Please try again later.'
        )
      }
    }

    return null
  } catch (error) {
    console.error(`Public endpoint limiter unavailable for ${route}:`, error)
    return withSecurityHeaders(
      NextResponse.json(
        {
          error:
            'Service temporarily unavailable. Please try again shortly.',
        },
        { status: 503, headers: { 'Retry-After': '30' } }
      )
    )
  }
}
