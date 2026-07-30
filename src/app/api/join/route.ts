import { NextRequest, NextResponse } from 'next/server'
import { createMember, getMembers } from '@/lib/firestore'
import { joinSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = joinSchema.parse(body)

    // Rate limiting
    if (!rateLimit(`join:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

    // Create Firebase Auth user account first
    const authUser = await createFirebaseAuthUser(
      validated.email.toLowerCase(),
      validated.password,
      validated.fullName
    )

    // Then create the member document in Firestore
    const member = await createMember({
      fullName: sanitizeHtml(validated.fullName),
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      qualification: sanitizeHtml(validated.qualification),
      rciNumber: validated.rciNumber || null,
      membershipType: sanitizeHtml(validated.membershipType),
      city: sanitizeHtml(validated.city),
      transactionNumber: sanitizeHtml(validated.transactionNumber),
      message: validated.message ? sanitizeHtml(validated.message) : null,
      address: sanitizeHtml(validated.address),
      photoUrl: validated.photoUrl || null,
      rciCertificateUrl: validated.rciCertificateUrl || null,
      registrationDate: validated.registrationDate || null,
      declaration: validated.declaration,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: member.id,
      uid: authUser.localId,
      message: 'Account created! Please check your email to verify your account.',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating member:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    const error = err as Error
    if (error.message === 'An account with this email already exists') {
      return withSecurityHeaders(NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to submit application' }, { status: 500 }))
  }
}

export async function GET() {
  try {
    const members = await getMembers()
    return withSecurityHeaders(NextResponse.json({ members }))
  } catch (error) {
    console.error('Error fetching members:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 }))
  }
}