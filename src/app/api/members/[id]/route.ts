import { NextRequest, NextResponse } from 'next/server'
import { updateMember, deleteMember, getMemberById as fetchMemberById, normalizeMembershipId, isValidMembershipId, getMemberByMembershipId } from '@/lib/firestore'
import { getActiveCertificateTemplateByType, getCertificatesByMemberId, seedDefaultCertificateTemplates, upsertCertificate } from '@/lib/firestore'
import { upsertMembershipReceipt, getReceiptsByMemberId } from '@/lib/firestore'
import { membershipFees } from '@/lib/static-data'
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

    // Admin-assigned membership ID (e.g. "UP001"). Optional: blank clears it.
    // Never touched by /api/join, so applications stay admin-assignable only.
    if (body.membershipId !== undefined) {
      const normalized = normalizeMembershipId(body.membershipId)
      if (normalized && !isValidMembershipId(normalized)) {
        return withSecurityHeaders(NextResponse.json(
          { error: 'Invalid membership ID. Use the format UP001 (UP followed by at least 3 digits).' },
          { status: 400 }
        ))
      }
      if (normalized) {
        const existing = await getMemberByMembershipId(normalized)
        if (existing && existing.id !== id) {
          return withSecurityHeaders(NextResponse.json(
            { error: `Membership ID ${normalized} is already assigned.` },
            { status: 409 }
          ))
        }
      }
      updateData.membershipId = normalized || null
    }

    // Auto-issue certificate and receipt when member is approved
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
                await upsertCertificate({
                  templateId: template.id,
                  type: 'membership',
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

          // Auto-generate membership receipt
          const memberUid = (member as { uid?: string | null }).uid
          const amount = membershipFees[membershipType] ?? 0
          if (memberUid && amount > 0) {
            const existingReceipts = await getReceiptsByMemberId(id)
            const hasMembershipReceipt = existingReceipts.some((r) => r.transactionType === 'membership')
            if (!hasMembershipReceipt) {
              const membershipLabel: Record<string, string> = {
                life: 'Life Membership Fee',
                annual: 'Annual Membership Fee',
                student: 'Student Membership Fee',
              }
              await upsertMembershipReceipt({
                receiptNumber: `UPISHA-RCPT-${id}`,
                memberId: id,
                memberUid,
                memberName: sanitizeHtml(member.fullName),
                memberEmail: member.email,
                transactionType: 'membership',
                description: membershipLabel[membershipType] || 'Membership Fee',
                amount,
                currency: 'INR',
                transactionNumber: member.transactionNumber || null,
                paymentMethod: 'UPI',
                status: 'paid',
                issuedAt: new Date(),
                // Approval trigger sends one combined "approved + receipt"
                // email; suppress the standalone receipt email for this one.
                suppressEmail: true,
              })
            }
          }
        }
      } catch (certError) {
        // Log but don't fail the member update if certificate/receipt issuance fails
        console.error('Error auto-issuing certificate or receipt:', certError)
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