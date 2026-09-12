import { NextRequest, NextResponse } from 'next/server'
import {
  getReceiptsByMemberUid,
  getReceiptsByMemberId,
  getReceiptsByEmail,
  getMemberByUid,
  createReceipt,
} from '@/lib/firestore'
import { membershipFees } from '@/lib/static-data'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireVerifiedMember } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const auth = await requireVerifiedMember(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const decoded = auth as { uid: string }
    const member = await getMemberByUid(decoded.uid)

    if (!member) {
      return withSecurityHeaders(NextResponse.json({ error: 'Member profile not found' }, { status: 404 }))
    }

    const memberId = (member as { id?: string }).id
    const memberEmail = member.email?.toLowerCase()

    // Query by memberUid, memberId AND email. Webinar receipts are keyed by
    // the registration email (memberEmail) since registrations happen
    // pre-login on the public site - same approach as /api/certificates/mine.
    const [uidReceipts, idReceipts, emailReceipts] = await Promise.all([
      getReceiptsByMemberUid(decoded.uid),
      memberId ? getReceiptsByMemberId(memberId) : Promise.resolve([]),
      memberEmail ? getReceiptsByEmail(memberEmail) : Promise.resolve([]),
    ])

    // Merge and deduplicate by receipt id
    const receiptMap = new Map<string, (typeof uidReceipts)[number]>()
    for (const receipt of [...uidReceipts, ...idReceipts, ...emailReceipts]) {
      if (receipt.id && !receiptMap.has(receipt.id)) {
        receiptMap.set(receipt.id, receipt)
      }
    }
    let receipts = Array.from(receiptMap.values())
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })

    // Lazy backfill: if the member is approved but has no membership receipt,
    // auto-generate one on-the-fly. This handles members who were approved
    // before the receipt auto-generation was deployed.
    const hasMembershipReceipt = receipts.some((r) => r.transactionType === 'membership')
    if (!hasMembershipReceipt && member.status === 'approved') {
      try {
        const membershipType = member.membershipType || 'life'
        const amount = membershipFees[membershipType] ?? 0
        const memberUid = (member as { uid?: string | null }).uid
        if (memberUid && amount > 0) {
          const membershipLabel: Record<string, string> = {
            life: 'Life Membership Fee',
            annual: 'Annual Membership Fee',
            student: 'Student Membership Fee',
          }
          await createReceipt({
            receiptNumber: `UPISHA-RCPT-${memberId || ''}`,
            memberId: memberId || '',
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
          })
          // Re-fetch receipts after backfill
          const [newUidReceipts, newIdReceipts, newEmailReceipts] = await Promise.all([
            getReceiptsByMemberUid(decoded.uid),
            memberId ? getReceiptsByMemberId(memberId) : Promise.resolve([]),
            memberEmail ? getReceiptsByEmail(memberEmail) : Promise.resolve([]),
          ])
          const newReceiptMap = new Map<string, (typeof newUidReceipts)[number]>()
          for (const receipt of [...newUidReceipts, ...newIdReceipts, ...newEmailReceipts]) {
            if (receipt.id && !newReceiptMap.has(receipt.id)) {
              newReceiptMap.set(receipt.id, receipt)
            }
          }
          receipts = Array.from(newReceiptMap.values())
            .sort((a, b) => {
              const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
              return bTime - aTime
            })
        }
      } catch (backfillError) {
        // Log but don't fail the request if backfill fails
        console.error('Error auto-generating receipt on backfill:', backfillError)
      }
    }

    return withSecurityHeaders(NextResponse.json({ receipts }))
  } catch (error) {
    console.error('Error fetching member receipts:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 }))
  }
}