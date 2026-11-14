import { NextRequest, NextResponse } from 'next/server'
import {
  createWebinarRegistration,
  getWebinarRegistrations,
  getWebinarRegistrationsByEmail,
  getWebinarById,
  getWebinarRegistrationCount,
  getWebinarRegistrationByTransactionNumber,
} from '@/lib/firestore'
import { webinarRegistrationSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection, withAppCheckProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { isWebinarPast } from '@/lib/webinar-status'
import { publicFormsDisabledResponse, enforcePublicEndpointLimit } from '@/lib/public-endpoint-guard'

export async function POST(request: NextRequest) {
  // Operator kill switch + distributed per-IP/global/email limits.
  const disabled = publicFormsDisabledResponse()
  if (disabled) return disabled

  try {
    const body = await request.json()
    const validated = webinarRegistrationSchema.parse(body)
    const email = validated.email.toLowerCase()

    const limited = await enforcePublicEndpointLimit(request, 'webinar-register', {
      perIp: 10,
      global: 100,
      email,
      perEmail: 5,
    })
    if (limited) return limited

    // CSRF protection (double-submit) — same pattern as /api/join and
    // /api/contact so this public form cannot be cross-site submitted.
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    // Firebase App Check (APP_CHECK.md §5): primary bot defense for this
    // public form. Verified before the duplicate-registration and capacity
    // reads (avoids paying Firestore reads for unattested traffic) and
    // before the registration write. Monitor logs-and-allows; enforce 403s.
    const appCheckError = await withAppCheckProtection(request)
    if (appCheckError) return appCheckError

    // Duplicate registration check: same email + same webinar
    const existing = await getWebinarRegistrationsByEmail(email)
    const alreadyRegistered = existing.some((r) => r.webinarId === validated.webinarId)
    if (alreadyRegistered) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'You have already registered for this webinar.' },
        { status: 409 }
      ))
    }

    // Capacity check: enforce maxAttendees if set
    const webinar = await getWebinarById(validated.webinarId)
    if (!webinar || webinar.isActive === false) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Webinar not found.' },
        { status: 404 }
      ))
    }

    // Registration closes once the webinar date has passed (end of that day)
    if (isWebinarPast(webinar.date)) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Registration is closed: this webinar has already taken place.' },
        { status: 409 }
      ))
    }

    if (webinar.maxAttendees && webinar.maxAttendees > 0) {
      const count = await getWebinarRegistrationCount(validated.webinarId)
      if (count >= webinar.maxAttendees) {
        return withSecurityHeaders(NextResponse.json(
          { error: 'Sorry, this webinar has reached its maximum capacity.' },
          { status: 409 }
        ))
      }
    }

    // SECURITY: type, title and price come ONLY from the webinar document.
    // The client must never be able to declare a paid webinar "free".
    const webinarType = webinar.type === 'free' ? 'free' : 'paid'
    const isFree = webinarType === 'free'
    const amount = typeof webinar.price === 'number' ? webinar.price : null

    if (!isFree && (amount === null || amount <= 0)) {
      return withSecurityHeaders(NextResponse.json(
        {
          error:
            'This webinar is not currently accepting registrations. Please contact the administrator.',
        },
        { status: 409 }
      ))
    }

    // For paid webinars a usable, unique transaction reference is required.
    const transactionNumber = validated.transactionNumber?.trim() ?? ''
    if (!isFree) {
      if (transactionNumber.length < 4 || transactionNumber.length > 100) {
        return withSecurityHeaders(NextResponse.json(
          { error: 'Please enter a valid payment transaction / reference number.' },
          { status: 400 }
        ))
      }
      const duplicate = await getWebinarRegistrationByTransactionNumber(transactionNumber)
      if (duplicate) {
        return withSecurityHeaders(NextResponse.json(
          {
            error:
              'This transaction number has already been submitted. If you believe this is an error, please contact us.',
          },
          { status: 409 }
        ))
      }
    }

    // ALL registrations (free and paid) remain pending until an admin reviews
    // them. The confirmation email is only created after that approval.
    const status = 'pending'

    const registration = await createWebinarRegistration({
      fullName: sanitizeHtml(validated.fullName),
      email,
      phone: validated.phone,
      qualification: validated.qualification ? sanitizeHtml(validated.qualification) : null,
      rciCrrNumber: validated.rciCrrNumber ? sanitizeHtml(validated.rciCrrNumber) : null,
      city: sanitizeHtml(validated.city),
      webinarId: validated.webinarId,
      webinarTitle: sanitizeHtml(webinar.title),
      webinarDate: webinar.date ?? null,
      webinarTime: webinar.time ?? null,
      webinarType,
      transactionNumber: isFree ? null : sanitizeHtml(transactionNumber),
      message: validated.message ? sanitizeHtml(validated.message) : null,
      declaration: validated.declaration,
      status,
      amount: isFree ? 0 : amount,
      currency: 'INR',
      paymentStatus: isFree ? 'not_required' : 'pending_verification',
      paymentVerifiedBy: null,
      paymentVerifiedAt: null,
      receiptNumber: null,
      rejectionReason: null,
    })

    // Rate-limit keys are intentionally NOT reset on success: that would allow
    // an attacker to bypass the limiter by interleaving one valid registration.

    const message = isFree
      ? 'Registration submitted! Your free registration is pending admin confirmation. You will receive the meeting link by email once confirmed.'
      : 'Registration submitted successfully! Your registration is pending payment verification and admin confirmation. You will receive an email once confirmed.'

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: registration.id,
      registrationNumber: registration.registrationNumber,
      status,
      message,
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating webinar registration:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const registrations = await getWebinarRegistrations()
    return withSecurityHeaders(NextResponse.json({ registrations }))
  } catch (error) {
    console.error('Error fetching webinar registrations:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 }))
  }
}