import { NextRequest, NextResponse } from 'next/server'
import { getMemberByUid, updateMember } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'
import { profileSchema } from '@/lib/validations'
import { uploadDataUrl } from '@/lib/storage'

/**
 * Upload a base64 data URL to Firebase Storage if it is a data URL.
 * Returns the resulting download URL, or the original value if it's not a data URL.
 */
async function maybeUploadToStorage(value: string | null | undefined, path: string): Promise<string | null> {
  if (!value || !value.startsWith('data:')) return value ?? null
  return uploadDataUrl(value, path)
}

/**
 * GET /api/members/me
 * Returns the authenticated member's own profile.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const decoded = auth as { uid: string }
    const member = await getMemberByUid(decoded.uid)

    if (!member) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member profile not found' }, { status: 404 }))
    }

    return withSecurityHeaders(NextResponse.json({ member }))
  } catch (error) {
    console.error('Error fetching member profile:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 }))
  }
}

/**
 * PATCH /api/members/me
 * Updates the authenticated member's own profile.
 * Only allows editing safe, self-service fields.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const decoded = auth as { uid: string }
    const member = await getMemberByUid(decoded.uid)

    if (!member) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member profile not found' }, { status: 404 }))
    }

    if (!rateLimit(`member:update:${decoded.uid}`, 10, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const body = await request.json()
    const validated = profileSchema.parse(body)

    const updateData: Record<string, unknown> = {}

    if (validated.fullName !== undefined) updateData.fullName = sanitizeHtml(validated.fullName)
    if (validated.phone !== undefined) updateData.phone = sanitizeHtml(validated.phone)
    if (validated.qualification !== undefined) updateData.qualification = sanitizeHtml(validated.qualification)
    if (validated.rciNumber !== undefined) updateData.rciNumber = validated.rciNumber ? sanitizeHtml(validated.rciNumber) : null
    if (validated.city !== undefined) updateData.city = sanitizeHtml(validated.city)
    if (validated.address !== undefined) updateData.address = validated.address ? sanitizeHtml(validated.address) : null
    if (validated.registrationDate !== undefined) updateData.registrationDate = validated.registrationDate ?? null

    // Handle photo upload (base64 data URL → Firebase Storage)
    if (validated.photoUrl !== undefined) {
      if (validated.photoUrl && validated.photoUrl.startsWith('data:')) {
        const timestamp = Date.now()
        updateData.photoUrl = await maybeUploadToStorage(
          validated.photoUrl,
          `members/${decoded.uid}/photo-${timestamp}.jpg`
        )
      } else {
        updateData.photoUrl = validated.photoUrl ?? null
      }
    }

    // Handle RCI certificate upload (base64 data URL → Firebase Storage)
    if (validated.rciCertificateUrl !== undefined) {
      if (validated.rciCertificateUrl && validated.rciCertificateUrl.startsWith('data:')) {
        const timestamp = Date.now()
        updateData.rciCertificateUrl = await maybeUploadToStorage(
          validated.rciCertificateUrl,
          `members/${decoded.uid}/rci-certificate-${timestamp}.pdf`
        )
      } else {
        updateData.rciCertificateUrl = validated.rciCertificateUrl ?? null
      }
    }

    if (member.id) {
      await updateMember(member.id, updateData)
    }

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    }))
  } catch (err: unknown) {
    console.error('Error updating member profile:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update profile' }, { status: 500 }))
  }
}