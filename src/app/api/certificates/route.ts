import { NextRequest, NextResponse } from 'next/server'
import {
  getCertificates,
  upsertCertificate,
  getCertificateTemplateById,
  getCertificatesByMemberId,
  seedDefaultCertificateTemplates,
} from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { checkRateLimitStrict, getClientIp } from '@/lib/firestore-rate-limit'
import { logAdminAction } from '@/lib/audit-log'
import { enforceBodySizeLimit } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-helpers'
import { getMemberById } from './helpers'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    // Ensure default templates are seeded
    await seedDefaultCertificateTemplates()

    const certificates = await getCertificates()
    return withSecurityHeaders(NextResponse.json({ certificates }))
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with templates endpoints)
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  // Reject oversized request bodies
  if (!enforceBodySizeLimit(request.headers)) {
    return withSecurityHeaders(NextResponse.json({ error: 'Request body too large' }, { status: 413 }))
  }

  const ip = getClientIp(request.headers)

  try {
    const body = await request.json()
    const { memberId, templateId } = body

    if (!memberId || !templateId) {
      return withSecurityHeaders(NextResponse.json({ error: 'Please select both a member and a certificate template before issuing.' }, { status: 400 }))
    }

    // Distributed per-admin rate limit (replaces the in-memory global limiter
    // whose 20/hour budget was shared across ALL admins and reset on every
    // serverless instance cold-start).
    const rate = await checkRateLimitStrict(`certificate:create:${ip}:${admin.uid}`, 20, 60 * 60 * 1000)
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Issuance limit reached (20 certificates per hour). Please wait a while before issuing more certificates.' }, { status: 429 }))
    }

    const member = await getMemberById(memberId)
    if (!member) {
      return withSecurityHeaders(NextResponse.json({ error: 'The selected member could not be found. They may have been deleted — refresh the page and try again.' }, { status: 404 }))
    }

    // Server-side enforcement: only approved members may receive a
    // membership certificate (the UI filters the dropdown, but the API
    // must not rely on that). Mirrors the webinar endpoint's
    // registration.status === 'confirmed' check.
    const memberStatus = (member as { status?: string | null }).status
    if (memberStatus !== 'approved') {
      return withSecurityHeaders(NextResponse.json({ error: 'This member has not been approved yet. Approve their application on the Members page first — only approved members can receive a certificate.' }, { status: 400 }))
    }

    const template = await getCertificateTemplateById(templateId)
    if (!template) {
      return withSecurityHeaders(NextResponse.json({ error: 'The selected certificate template no longer exists. It may have been deleted — refresh the page and pick a different template.' }, { status: 404 }))
    }

    // Validate the template is a membership template (mirrors the webinar
    // endpoint's category check).
    if ((template.category || 'membership') !== 'membership') {
      return withSecurityHeaders(NextResponse.json({ error: 'The selected template is not a membership template. Membership certificates can only use templates in the "Membership" category — pick a different template.' }, { status: 400 }))
    }

    // Block multi-template issuance: certificates are stored under the
    // deterministic doc ID UPISHA-<memberId>, so issuing a second template
    // would silently OVERWRITE the member's existing certificate. Only one
    // active (non-revoked) certificate is allowed per member; revoked ones
    // may be re-issued (idempotent upsert revives the same document).
    const existingCerts = await getCertificatesByMemberId(memberId)
    const alreadyIssued = existingCerts.some((c) => c.status !== 'revoked')
    if (alreadyIssued) {
      return withSecurityHeaders(NextResponse.json({ error: 'This member already has an active certificate — each member can hold only one active membership certificate. If you need to issue a different one, revoke the existing certificate from the list above first.' }, { status: 409 }))
    }

    const memberUid = (member as { uid?: string | null }).uid
    if (!memberUid) {
      return withSecurityHeaders(NextResponse.json({ error: 'This member has no registered user account yet. Certificates need a linked account so the member can view them in their profile — ask the member to register first, then issue the certificate.' }, { status: 400 }))
    }

    const certificate = await upsertCertificate({
      templateId,
      type: 'membership',
      memberId,
      memberUid,
      memberName: sanitizeHtml(member.fullName),
      membershipType: sanitizeHtml(member.membershipType),
      qualification: member.qualification ? sanitizeHtml(member.qualification) : null,
      certificateNumber: `UPISHA-${memberId}`,
      issueDate: new Date().toISOString(),
      status: 'issued',
    })

    // Audit log the issuance
    await logAdminAction({
      action: 'certificate.issue',
      resourceType: 'certificate',
      resourceId: certificate.id,
      actor: admin,
      ip,
      userAgent: request.headers.get('user-agent'),
      details: { memberId, memberName: member.fullName, certificateNumber: `UPISHA-${memberId}` },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: certificate.id,
      message: 'Certificate issued successfully. The member can now view and download it from their profile.',
    }, { status: 201 }))
  } catch (error) {
    console.error('Error creating certificate:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Something went wrong while issuing the certificate. Please try again — if it keeps failing, refresh the page or sign in again.' }, { status: 500 }))
  }
}
