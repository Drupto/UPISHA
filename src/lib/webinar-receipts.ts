import {
  getWebinarRegistrationById,
  getWebinarById,
  getReceiptByReceiptNumber,
  createReceipt,
  updateReceipt,
  getMemberByEmail,
} from '@/lib/firestore'
import { sanitizeHtml } from '@/lib/security'
import type { ReceiptDoc } from '@/lib/types'

/**
 * Receipts for webinar registrations are stored with a deterministic
 * receiptNumber: `UPISHA-RCPT-WEB-<registrationId>` where <registrationId>
 * is the Firestore document id of the registration.
 */
export const webinarReceiptNumber = (registrationId: string) => `UPISHA-RCPT-WEB-${registrationId}`

/**
 * Ensure a payment receipt exists for a (paid) webinar registration.
 *
 * This is idempotent: if a receipt already exists it is returned without
 * creating a duplicate. It is called automatically when an admin confirms a
 * paid registration, and can also be triggered manually from the admin panel.
 *
 * Unlike the old inline logic, this generates the receipt for ANY paid
 * registration (not only when price > 0), so a missing/zero webinar price can
 * no longer silently prevent a receipt from being created.
 */
export async function ensureWebinarReceipt(
  id: string
): Promise<{ created: boolean; receipt: ReceiptDoc | null; skipped?: 'not-paid' | 'not-found' }> {
  const registration = await getWebinarRegistrationById(id)
  if (!registration) {
    return { created: false, receipt: null, skipped: 'not-found' }
  }
  if (registration.webinarType !== 'paid') {
    return { created: false, receipt: null, skipped: 'not-paid' }
  }

  const receiptNumber = webinarReceiptNumber(id)
  const webinar = registration.webinarId ? await getWebinarById(registration.webinarId) : null
  const amount = webinar?.price ?? 0

  const existing = await getReceiptByReceiptNumber(receiptNumber)
  if (existing) {
    // Receipts issued before the webinar had a price (or before the price was
    // set on the webinar) carry amount 0. Sync them so the corrected fee
    // flows through to the stored/downloadable receipt.
    const price = typeof webinar?.price === 'number' ? webinar.price : 0
    if (existing.id && existing.amount === 0 && price > 0) {
      try {
        await updateReceipt(existing.id, { amount: price })
        const refreshed = await getReceiptByReceiptNumber(receiptNumber)
        return { created: false, receipt: refreshed ?? existing }
      } catch (syncError) {
        console.error('Failed to sync webinar receipt amount:', syncError)
      }
    }
    return { created: false, receipt: existing }
  }

  // Link the receipt to the member account when the registration email
  // belongs to one, so it matches the profile queries (memberUid / memberId)
  // in addition to the email-based lookup.
  let memberId: string = registration.email
  let memberUid: string = registration.email
  try {
    const linkedMember = await getMemberByEmail(registration.email)
    if (linkedMember) {
      if (linkedMember.id) memberId = linkedMember.id
      if (linkedMember.uid) memberUid = linkedMember.uid
    }
  } catch (linkError) {
    // Fall back to email-based linkage
    console.error('Failed to link webinar receipt to member account:', linkError)
  }

  await createReceipt({
    receiptNumber,
    memberId,
    memberUid,
    memberName: sanitizeHtml(registration.fullName),
    memberEmail: registration.email,
    transactionType: 'webinar',
    description: `Webinar Registration - ${registration.webinarTitle}`,
    amount,
    currency: 'INR',
    transactionNumber: registration.transactionNumber || null,
    paymentMethod: 'UPI',
    status: 'paid',
    issuedAt: new Date(),
  })

  const created = await getReceiptByReceiptNumber(receiptNumber)
  return { created: true, receipt: created }
}
