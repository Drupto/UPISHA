import { NextRequest, NextResponse } from 'next/server'
import { updateMember, deleteMember, getMemberById as fetchMemberById } from '@/lib/firestore'
import { getActiveCertificateTemplateByType, createCertificate, getCertificatesByMemberId, seedDefaultCertificateTemplates } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    // Allow updating status and other member fields
    const updateData: Record<string, unknown> = {}
    if (body.status) updateData.status = sanitizeHtml(body.status)
    if (body.fullName) updateData.fullName = sanitizeHtml(body.fullName)
    if (body.email) updateData.email = String(body.email).toLowerCase()
    if (body.phone) updateData.phone = sanitizeHtml(body.phone)
    if (body.membershipType) updateData.membershipType = sanitizeHtml(body.membershipType)
    if (body.city) updateData.city = sanitizeHtml(body.city)
    if (body.address !== undefined) updateData.address = body.address ? sanitizeHtml(body.address) : null

    // Auto-issue certificate when member is approved
    if (body.status === 'approved') {
      try {
        await seedDefaultCertificateTemplates()
        const member = await fetchMemberById(id)
        if (member) {
          const membershipType = member.membershipType || 'all'
          const template = await getActiveCertificateTemplateByType(membershipType)
          if (template && template.id) {
            const existingCerts = await getCertificatesByMemberId(id)
            const alreadyIssued = existingCerts.some(
              (c) => c.templateId === template.id && c.status !== 'revoked'
            )
            if (!alreadyIssued) {
              const memberUid = (member as { uid?: string | null }).uid
              if (memberUid) {
                await createCertificate({
                  templateId: template.id,
                  memberId: id,
                  memberUid,
                  memberName: sanitizeHtml(member.fullName),
                  membershipType: sanitizeHtml(membershipType),
                  qualification: member.qualification ? sanitizeHtml(member.qualification) : null,
                  certificateNumber: `UPISHA-${id}`,
                  issueDate: new Date().toISOString(),
                  status: 'issued',
                })
              }
            }
          }
        }
      } catch (certError) {
        // Log but don't fail the member update if certificate issuance fails
        console.error('Error auto-issuing certificate:', certError)
      }
    }

    await updateMember(id, updateData)

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      certificateIssued: body.status === 'approved',
    }))
  } catch (error) {
    console.error('Error updating member:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update member' }, { status: 500 }))
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    await deleteMember(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Member deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting member:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete member' }, { status: 500 }))
  }
}