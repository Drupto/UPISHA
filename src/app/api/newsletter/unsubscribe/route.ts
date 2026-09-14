import { NextRequest, NextResponse } from 'next/server'
import { deactivateNewsletterSubscriber } from '@/lib/firestore'
import { verifyUnsubscribeToken } from '@/lib/email-unsubscribe'
import { withSecurityHeaders, rateLimit } from '@/lib/security'

function confirmationPage(message: string, success: boolean): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${success ? 'Unsubscribed' : 'Unsubscribe link issue'} — UP ISHA</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
    .card { max-width: 480px; text-align: center; padding: 40px 32px; background: #fff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    h1 { font-size: 20px; margin-bottom: 8px; }
    p { color: #475569; font-size: 14px; line-height: 1.6; }
    .error { color: #b91c1c; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${success ? 'You have been unsubscribed' : 'Link could not be verified'}</h1>
    <p class="${success ? '' : 'error'}">${message}</p>
    <p><a href="/">Go to upisha.org</a></p>
  </div>
</body>
</html>`
  return new NextResponse(html, {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
  })
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  if (!rateLimit(`newsletter-unsub:${ip}`, 10, 60 * 1000)) {
    return withSecurityHeaders(confirmationPage('Too many attempts. Please try again later.', false))
  }

  const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase()
  const token = request.nextUrl.searchParams.get('token') || ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return withSecurityHeaders(confirmationPage('The unsubscribe link is invalid.', false))
  }

  // The token must be a valid HMAC for this exact email — links are only
  // issued inside our own emails, so third parties cannot unsubscribe others.
  if (!verifyUnsubscribeToken(email, token)) {
    return withSecurityHeaders(confirmationPage('This unsubscribe link is invalid or has expired (the link secret may have been rotated). Please contact us if you keep receiving emails.', false))
  }

  try {
    await deactivateNewsletterSubscriber(email)
    return withSecurityHeaders(confirmationPage('You will no longer receive newsletter emails from UP ISHA. This may take up to 24 hours to take effect for emails already queued.', true))
  } catch (error) {
    console.error('Error unsubscribing newsletter subscriber:', error)
    return withSecurityHeaders(confirmationPage('Something went wrong while unsubscribing. Please try again later or contact us.', false))
  }
}
