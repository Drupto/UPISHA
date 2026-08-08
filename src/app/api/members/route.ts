import { NextRequest, NextResponse } from 'next/server'
import { getMembers, createMember } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { joinSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const members = await getMembers()
    // Convert Firestore Timestamp objects to ISO date strings so they
    // serialize correctly through JSON and can be parsed on the client.
    const serializedMembers = members.map((member: Record<string, unknown>) => {
      const { createdAt, updatedAt, ...rest } = member
      const serialize = (ts: unknown) => {
        if (!ts) return null
        if (ts instanceof Date) return ts.toISOString()
        if (typeof ts === 'string') return ts
        if (typeof ts === 'object' && 'seconds' in (ts as object) && 'nanoseconds' in (ts as object)) {
          return new Date((ts as { seconds: number }).seconds * 1000).toISOString()
        }
        return null
      }
      return { ...rest, createdAt: serialize(createdAt), updatedAt: serialize(updatedAt) }
    })
    return withSecurityHeaders(NextResponse.json({ members: serializedMembers }))
  } catch (error) {
    console.error('Error fetching members:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const validated = joinSchema.parse(body)

    if (!rateLimit(`member:create`, 10, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const member = await createMember({
      fullName: sanitizeHtml(validated.fullName),
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      qualification: sanitizeHtml(validated.qualification),
      rciNumber: validated.rciNumber ? sanitizeHtml(validated.rciNumber) : null,
      membershipType: sanitizeHtml(validated.membershipType),
      city: sanitizeHtml(validated.city),
      transactionNumber: sanitizeHtml(validated.transactionNumber),
      message: validated.message ? sanitizeHtml(validated.message) : null,
      address: sanitizeHtml(validated.address),
      photoUrl: validated.photoUrl ?? null,
      rciCertificateUrl: validated.rciCertificateUrl ?? null,
      registrationDate: validated.registrationDate ?? null,
      declaration: validated.declaration,
      status: 'pending',
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: member.id,
      message: 'Member created successfully',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating member:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create member' }, { status: 500 }))
  }
}