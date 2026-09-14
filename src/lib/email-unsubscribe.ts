// ⚠️ SERVER-ONLY module — do not import from client components.
//
// HMAC-signed tokens for one-click newsletter unsubscribe links.
// The SAME secret (NEWSLETTER_UNSUBSCRIBE_SECRET) signs the links inside the
// Cloud Function (functions/src/index.ts → sendNewsletterCampaign) and
// verifies them in /api/newsletter/unsubscribe, so changing it invalidates
// links in previously sent emails.
import { createHmac, timingSafeEqual } from 'crypto'

function getSecret(): string | undefined {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET
}

/** Compute the unsubscribe token for an email (HMAC-SHA256 hex digest). */
export function signUnsubscribeToken(email: string): string {
  const secret = getSecret()
  if (!secret) {
    throw new Error('NEWSLETTER_UNSUBSCRIBE_SECRET is not configured')
  }
  return createHmac('sha256', secret).update(email.toLowerCase()).digest('hex')
}

/** Constant-time verification that a token was issued by us for this email. */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const secret = getSecret()
  if (!secret || !token) return false
  try {
    const expected = Buffer.from(signUnsubscribeToken(email), 'hex')
    const provided = Buffer.from(token, 'hex')
    if (expected.length !== provided.length || expected.length === 0) return false
    return timingSafeEqual(expected, provided)
  } catch {
    return false
  }
}

export function buildUnsubscribeUrl(email: string, siteUrl: string): string {
  const normalized = email.toLowerCase()
  const token = signUnsubscribeToken(normalized)
  return `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(normalized)}&token=${token}`
}
