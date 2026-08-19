import {
  getWebinarRegistrationById,
  getWebinarById,
  getReceiptByReceiptNumber,
  createReceipt,
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
  const existing = await getReceiptByReceiptNumber(receiptNumber)
  if (existing) {
    return { created: false, receipt: existing }
  }

  const webinar = registration.webinarId ? await getWebinarById(registration.webinarId) : null
  const amount = webinar?.price ?? 0

  await createReceipt({
    receiptNumber,
    memberId: registration.email,
    memberUid: registration.email,
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
