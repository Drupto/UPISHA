import { NextRequest, NextResponse } from 'next/server'
import { updateMember, deleteMember, getMemberById as fetchMemberById, getMemberByMembershipId } from '@/lib/firestore'
import { getActiveCertificateTemplateByType, getCertificatesByMemberId, seedDefaultCertificateTemplates, upsertCertificate } from '@/lib/firestore'
import { upsertMembershipReceipt, getReceiptsByMemberId } from '@/lib/firestore'
import { membershipFees } from '@/lib/static-data'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { parseMemberUpdateInput } from '@/lib/member-update'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with the certificates [id]
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  try {
    const body = await request.json()

    // Group D hardening: field whitelist + status enum + membership-ID
    // format validation + empty-update rejection happen in one pure helper.
    // Bad input 400s here, before any Firestore read or side effect.
    const parsed = parseMemberUpdateInput(body)
    if (!parsed.ok) {
      return withSecurityHeaders(NextResponse.json({ error: parsed.error }, { status: 400 }))
    }
    const { updateData, approved } = parsed

    // 404 when the member does not exist (updateDoc would throw NOT_FOUND
    // → 500; a wrong id is not a server error). The fetched doc is reused
    // below by the approval cascade (one fewer Firestore read).
    const fetchedMember = await fetchMemberById(id)
    if (!fetchedMember) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member not found' }, { status: 404 }))
    }

    // Membership-ID uniqueness still needs a Firestore read — keep it here.
    const membershipId = updateData.membershipId
    if (typeof membershipId === 'string') {
      const existing = await getMemberByMembershipId(membershipId)
      if (existing && existing.id !== id) {
        return withSecurityHeaders(NextResponse.json(
          { error: `Membership ID ${membershipId} is already assigned.` },
          { status: 409 }
        ))
      }
    }

    // Write FIRST, cascade after: if the update fails, no certificate or
    // receipt has been issued yet — no inconsistent state (a pending member
    // holding issued documents). The cascade below is idempotent
    // (alreadyIssued / hasMembershipReceipt checks), so a failed issuance
    // is self-healing: re-send the approval and it completes.
    await updateMember(id, updateData)

    // Post-update view for the cascade: an approve combined with a name
    // edit in the same request must issue the certificate with the NEW name.
    // updateData is already sanitized strings/nulls by parseMemberUpdateInput;
    // the cascade re-sanitizes only values that came from the original doc.
    const member = { ...fetchedMember, ...updateData } as unknown as {
      uid?: string | null
      fullName: string
      email: string
      membershipType: string
      qualification?: string | null
      transactionNumber?: string | null
    }

    // Auto-issue certificate and receipt when member is approved
    if (approved) {
      try {
        await seedDefaultCertificateTemplates()
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
      } catch (certError) {
        // Log but don't fail the member update if certificate/receipt issuance fails
        console.error('Error auto-issuing certificate or receipt:', certError)
      }
    }

    await logAdminAction({
      action: approved ? 'member.approve' : 'member.update',
      resourceType: 'member',
      resourceId: id,
      actor: admin,
      request,
      details: { status: updateData.status ?? null, certificateIssued: approved },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      certificateIssued: approved,
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
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with the certificates [id]
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  try {
    // 404 on a bad id (delete of a nonexistent doc is a silent no-op in
    // Firestore — report it instead of claiming success).
    const existing = await fetchMemberById(id)
    if (!existing) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member not found' }, { status: 404 }))
    }

    await deleteMember(id)

    await logAdminAction({
      action: 'member.delete',
      resourceType: 'member',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Member deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting member:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete member' }, { status: 500 }))
  }
}