import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createMember, getMembers, createUserRecord } from '@/lib/firestore'
import { joinSchema, JOIN_FIELD_LABELS } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit, withCsrfProtection, getClientIp } from '@/lib/security'
import { uploadDataUrl } from '@/lib/storage'

async function createFirebaseAuthUser(email: string, password: string, displayName: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) throw new Error('Firebase API key not configured')

  // Create user via Firebase Auth REST API
  const signUpRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        displayName,
        returnSecureToken: true,
      }),
    }
  )

  const signUpData = await signUpRes.json()

  if (!signUpRes.ok) {
    const errorCode = signUpData.error?.message || ''
    if (errorCode === 'EMAIL_EXISTS') {
      throw new Error('An account with this email already exists')
    }
    throw new Error(errorCode || 'Failed to create account')
  }

  // Send email verification
  const verifyRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'VERIFY_EMAIL',
        idToken: signUpData.idToken,
      }),
    }
  )

  if (!verifyRes.ok) {
    console.error('Failed to send verification email')
  }

  return { localId: signUpData.localId, email: signUpData.email }
}

/**
 * Upload a base64 data URL to Firebase Storage if it is a data URL.
 * Returns the resulting download URL, or the original value if it's not a data URL.
 */
async function maybeUploadToStorage(value: string | null | undefined, path: string): Promise<string | null> {
  if (!value || !value.startsWith('data:')) return value ?? null
  return uploadDataUrl(value, path)
}

export async function POST(request: NextRequest) {
  // (C3) This endpoint only accepts POST requests; there is no GET handler,
  // so unauthenticated GET is not applicable.
  let authUser: { localId: string; email: string } | null = null
  try {
    const body = await request.json()
    const validated = joinSchema.parse(body)

    // Rate limiting — use IP + email to prevent bypass via email change (H3)
    const clientIp = getClientIp(request)
    if (!rateLimit(`join:${clientIp}:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

    // CSRF protection
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    // 1. Create Firebase Auth user account first
    authUser = await createFirebaseAuthUser(
      validated.email.toLowerCase(),
      validated.password,
      validated.fullName
    )

    // 2. Upload photo & RCI certificate to Firebase Storage (if provided as base64 data URLs)
    const timestamp = Date.now()
    let photoUrl: string | null = null
    let rciCertificateUrl: string | null = null

    try {
      if (validated.photoUrl) {
        photoUrl = await maybeUploadToStorage(
          validated.photoUrl,
          `members/${authUser.localId}/photo-${timestamp}.jpg`
        )
      }
      if (validated.rciCertificateUrl) {
        rciCertificateUrl = await maybeUploadToStorage(
          validated.rciCertificateUrl,
          `members/${authUser.localId}/rci-certificate-${timestamp}.pdf`
        )
      }
    } catch (storageErr) {
      console.error('Storage upload failed, falling back to raw values:', storageErr)
      // Fall back to the original values (may be null) so the join isn't blocked
      photoUrl = validated.photoUrl || null
      rciCertificateUrl = validated.rciCertificateUrl || null
    }

    // 3. Create the member document in Firestore (linked to the auth user via uid)
    const member = await createMember({
      uid: authUser.localId,
      fullName: sanitizeHtml(validated.fullName),
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      qualification: sanitizeHtml(validated.qualification),
      rciNumber: validated.rciNumber || null,
      membershipType: sanitizeHtml(validated.membershipType),
      course: validated.course ? sanitizeHtml(validated.course) : null,
      currentYear: validated.currentYear || null,
      city: sanitizeHtml(validated.city),
      transactionNumber: sanitizeHtml(validated.transactionNumber),
      message: validated.message ? sanitizeHtml(validated.message) : null,
      address: sanitizeHtml(validated.address),
      photoUrl,
      rciCertificateUrl,
      registrationDate: validated.registrationDate || null,
      declaration: validated.declaration,
    })

    // 4. Create a users record with role 'member' so the user is recognized after login
    try {
      await createUserRecord({
        uid: authUser.localId,
        email: validated.email.toLowerCase(),
        displayName: validated.fullName,
        role: 'member',
      })
    } catch (userErr) {
      console.error('Failed to create user role record (non-fatal):', userErr)
      // Non-fatal: the member document was created successfully.
      // The user can still authenticate; role will default to 'user' on first verify.
    }

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: member.id,
      uid: authUser.localId,
      message: 'Account created! Please check your email to verify your account.',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating member:', err)
    if (err instanceof ZodError) {
      const fieldOrder = Object.keys(JOIN_FIELD_LABELS)
      const details = err.issues.map((issue) => {
        const rawField = issue.path.length > 0 ? String(issue.path[0]) : 'form'
        const field = rawField in JOIN_FIELD_LABELS ? rawField : 'form'
        return { field, message: issue.message }
      }).sort((a, b) => fieldOrder.indexOf(a.field) - fieldOrder.indexOf(b.field))
      const fieldNames = Array.from(new Set(details.filter((d) => d.field !== 'form').map((d) => JOIN_FIELD_LABELS[d.field] ?? d.field)))
      return withSecurityHeaders(NextResponse.json({
        error: fieldNames.length > 0
          ? `Please fix the following fields: ${fieldNames.join(', ')}`
          : 'Please fix the highlighted fields and try again.',
        details,
      }, { status: 400 }))
    }
    const error = err as Error
    // Duplicate email gets an actionable message (with a distinct code so the
    // client can offer a "sign in instead" path) — without it, users get stuck
    // in a retry loop because the Auth account from attempt #1 already exists.
    if (error?.message === 'An account with this email already exists') {
      return withSecurityHeaders(NextResponse.json({
        error: 'An account with this email already exists. Please sign in instead of submitting a new application.',
        code: 'EMAIL_EXISTS',
      }, { status: 409 }))
    }
    // Return a generic message to prevent email enumeration (H5).
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to submit application' }, { status: 500 }))
  }
}

