import { NextRequest, NextResponse } from 'next/server'
import { createMember, getMembers } from '@/lib/firestore'
import { joinSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = joinSchema.parse(body)

    // Rate limiting
    if (!rateLimit(`join:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

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
    })

    return withSecurityHeaders(NextResponse.json({ success: true, id: member.id }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating member:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
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
