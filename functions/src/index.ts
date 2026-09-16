import * as admin from 'firebase-admin'
import * as crypto from 'crypto'
import * as functions from 'firebase-functions'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { setGlobalOptions } from 'firebase-functions/v2'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

// ─── Secrets (Secret Manager) ───
// v2 functions only receive Secret Manager values that are explicitly
// declared here — `firebase functions:secrets:set BREVO_API_KEY` is NOT
// enough on its own. Declaring them also makes them available as
// process.env.* at runtime.
export const BREVO_API_KEY = defineSecret('BREVO_API_KEY')
export const BREVO_SENDER_EMAIL = defineSecret('BREVO_SENDER_EMAIL')
export const BREVO_SENDER_NAME = defineSecret('BREVO_SENDER_NAME')
export const SITE_URL = defineSecret('SITE_URL')
// HMAC secret for per-recipient newsletter unsubscribe links — must match
// NEWSLETTER_UNSUBSCRIBE_SECRET in the Next.js app environment.
export const NEWSLETTER_UNSUBSCRIBE_SECRET = defineSecret('NEWSLETTER_UNSUBSCRIBE_SECRET')

// Set region to match the project
setGlobalOptions({
  region: 'asia-south1',
  maxInstances: 10,
  timeoutSeconds: 120,
  secrets: [BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, SITE_URL, NEWSLETTER_UNSUBSCRIBE_SECRET],
})

// ─── Email service imports ───
import {
  sendSingleEmail,
  sendBulkEmails,
  sendBulkRenderedEmails,
  EmailRecipient,
  RenderedBulkEmail,
} from './email/brevo.service'
import {
  renderMemberApprovalEmail,
  MemberApprovalTemplateData,
  MemberApprovalReceiptData,
} from './email/templates.member'
import {
  renderWebinarConfirmationEmail,
  renderWebinarCertificateEmail,
  WebinarConfirmationTemplateData,
  WebinarCertificateTemplateData,
} from './email/templates.webinar'
import {
  renderContactAcknowledgmentEmail,
  renderJoinFormConfirmationEmail,
  renderNewsletterWelcomeEmail,
  renderNewsletterContent,
  renderReceiptEmail,
} from './email/templates.misc'

// ─── Firestore Trigger: Member Created (Join Form) ───
// When a new member doc is created via /api/join, send application received email.
export const sendJoinApplicationEmail = onDocumentCreated('members/{memberId}', async (event) => {
  const member = event.data?.data() as Record<string, unknown> | undefined
  if (!member) return

  const email = String(member.email || '')
  const fullName = String(member.fullName || '')
  if (!email) return

  const rendered = renderJoinFormConfirmationEmail({
    fullName,
    membershipType: String(member.membershipType || ''),
    phone: String(member.phone || ''),
    city: String(member.city || ''),
    qualification: String(member.qualification || ''),
    transactionNumber: member.transactionNumber ? String(member.transactionNumber) : undefined,
  })

  const result = await sendSingleEmail(
    { email, name: fullName },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['join-application'],
    { source: 'firestore-trigger', memberId: event.params.memberId }
  )

  if (!result.success) {
    functions.logger.error('Join application email failed:', result.error)
  }
})

// ─── Firestore Trigger: Member Status Change (Approval/Rejection) ───
export const sendMemberApprovalEmailTrigger = onDocumentUpdated('members/{memberId}', async (event) => {
  const before = event.data?.before?.data?.() as Record<string, unknown> | undefined
  const after = event.data?.after?.data?.() as Record<string, unknown> | undefined

  if (!before || !after) return

  const oldStatus = String(before.status || '')
  const newStatus = String(after.status || '')

  // Only trigger when status actually changes
  if (oldStatus === newStatus) return
  if (newStatus !== 'approved' && newStatus !== 'rejected') return

  const email = String(after.email || '')
  const fullName = String(after.fullName || '')
  if (!email) return

  // On approval, if the auto-generated membership receipt exists (it is
  // written before the member update and flagged suppressEmail so the
  // receipt trigger stays quiet), embed its details in this combined
  // "approved + receipt" email instead of sending two separate emails.
  let receipt: MemberApprovalReceiptData | undefined
  if (newStatus === 'approved') {
    try {
      const receiptSnap = await db.collection('receipts').doc(`UPISHA-RCPT-${event.params.memberId}`).get()
      if (receiptSnap.exists) {
        const r = receiptSnap.data() as Record<string, unknown> | undefined
        if (r && r.receiptNumber) {
          receipt = {
            receiptNumber: String(r.receiptNumber),
            transactionType: String(r.transactionType || ''),
            description: String(r.description || ''),
            amount: typeof r.amount === 'number' ? r.amount : (Number(r.amount) || 0),
            paidAt: formatDateValue(r.issuedAt) || formatDateValue(new Date()),
          }
        }
      }
    } catch (err) {
      // Receipt lookup is best-effort; fall back to the plain approval email.
      functions.logger.warn('Failed to fetch membership receipt for approval email:', err)
    }
  }

  const templateData: MemberApprovalTemplateData = {
    fullName,
    status: newStatus as 'approved' | 'rejected',
    loginUrl: process.env.SITE_URL ? `${process.env.SITE_URL}/login` : undefined,
    receipt,
  }

  const rendered = renderMemberApprovalEmail(templateData)

  const result = await sendSingleEmail(
    { email, name: fullName },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['member-approval'],
    { eventId: event.params.memberId, status: newStatus }
  )

  if (!result.success) {
    functions.logger.error('Member approval email failed:', result.error)
  }
})

/**
 * Formats a webinar date for display in emails. Webinar dates are stored as
 * ISO "yyyy-MM-dd" (from the admin date picker), which reads poorly in emails —
 * convert to "15 Jan 2026". Any other format passes through unchanged.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatWebinarDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return value
  const month = parseInt(match[2], 10)
  if (month < 1 || month > 12) return value
  return `${parseInt(match[3], 10)} ${MONTHS[month - 1]} ${match[1]}`
}

/**
 * Formats a receipt issue date for display in emails. Firestore stores
 * `issuedAt` as a Timestamp object — String() on it renders "[object Object]",
 * so convert via .toDate() when available, format ISO strings, and pass
 * anything else through unchanged.
 */
function formatDateValue(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'object' && value !== null && typeof (value as { toDate?: unknown }).toDate === 'function') {
    const d = (value as { toDate: () => Date }).toDate()
    if (!isNaN(d.getTime())) return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  }
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) return `${value.getDate()} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`
  }
  if (typeof value === 'string') return formatWebinarDate(value)
  return String(value)
}

// ─── Firestore Trigger: Webinar Registration Created ───
export const onWebinarRegistrationCreated = onDocumentCreated('webinarRegistrations/{regId}', async (event) => {
  const reg = event.data?.data() as Record<string, unknown> | undefined
  if (!reg) return

  const email = String(reg.email || '')
  const fullName = String(reg.fullName || '')
  if (!email) return

  // Fetch webinar details for meeting link
  const webinarId = String(reg.webinarId || '')
  let meetingLink: string | undefined
  let speaker: string | undefined
  let duration: string | undefined
  let price: number | undefined
  let webinarDate: string | undefined
  let webinarTime: string | undefined

  try {
    const webinarSnap = await db.collection('webinars').doc(webinarId).get()
    if (webinarSnap.exists) {
      const webinar = webinarSnap.data() as Record<string, unknown>
      meetingLink = webinar.meetingLink ? String(webinar.meetingLink) : undefined
      speaker = webinar.speaker ? String(webinar.speaker) : undefined
      duration = webinar.duration ? String(webinar.duration) : undefined
      price = typeof webinar.price === 'number' ? webinar.price : undefined
      webinarDate = webinar.date ? formatWebinarDate(String(webinar.date)) : undefined
      webinarTime = webinar.time ? String(webinar.time) : undefined
    }
  } catch (err) {
    functions.logger.warn('Failed to fetch webinar for registration email:', err)
  }

  const templateData: WebinarConfirmationTemplateData = {
    fullName,
    webinarTitle: String(reg.webinarTitle || ''),
    webinarDate: formatWebinarDate(String(reg.webinarDate || reg['date'] || webinarDate || '')),
    webinarTime: String(reg.webinarTime || reg['time'] || webinarTime || ''),
    webinarSpeaker: speaker,
    webinarDuration: duration,
    webinarType: (reg.webinarType as 'paid' | 'free') || undefined,
    meetingLink,
    registrationStatus: (reg.status as 'pending' | 'confirmed' | 'rejected') || 'pending',
    registrationNumber: reg.registrationNumber ? String(reg.registrationNumber) : undefined,
    transactionNumber: reg.transactionNumber ? String(reg.transactionNumber) : undefined,
    amount: price,
  }

  const rendered = renderWebinarConfirmationEmail(templateData)

  const result = await sendSingleEmail(
    { email, name: fullName },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['webinar-registration'],
    { eventId: event.params.regId, status: reg.status }
  )

  if (!result.success) {
    functions.logger.error('Webinar registration email failed:', result.error)
  }
})

// ─── Firestore Trigger: Webinar Registration Status Change ───
export const onWebinarRegistrationUpdated = onDocumentUpdated('webinarRegistrations/{regId}', async (event) => {
  const before = event.data?.before?.data?.() as Record<string, unknown> | undefined
  const after = event.data?.after?.data?.() as Record<string, unknown> | undefined

  if (!before || !after) return

  const oldStatus = String(before.status || '')
  const newStatus = String(after.status || '')
  if (oldStatus === newStatus) return
  if (newStatus !== 'confirmed' && newStatus !== 'rejected') return

  const email = String(after.email || '')
  const fullName = String(after.fullName || '')
  if (!email) return

  // Fetch webinar for meeting link
  const webinarId = String(after.webinarId || '')
  let meetingLink: string | undefined
  let speaker: string | undefined
  let duration: string | undefined
  let price: number | undefined
  let webinarDate: string | undefined
  let webinarTime: string | undefined

  try {
    const webinarSnap = await db.collection('webinars').doc(webinarId).get()
    if (webinarSnap.exists) {
      const webinar = webinarSnap.data() as Record<string, unknown>
      meetingLink = webinar.meetingLink ? String(webinar.meetingLink) : undefined
      speaker = webinar.speaker ? String(webinar.speaker) : undefined
      duration = webinar.duration ? String(webinar.duration) : undefined
      price = typeof webinar.price === 'number' ? webinar.price : undefined
      webinarDate = webinar.date ? formatWebinarDate(String(webinar.date)) : undefined
      webinarTime = webinar.time ? String(webinar.time) : undefined
    }
  } catch (err) {
    functions.logger.warn('Failed to fetch webinar for update email:', err)
  }

  const templateData: WebinarConfirmationTemplateData = {
    fullName,
    webinarTitle: String(after.webinarTitle || ''),
    webinarDate: formatWebinarDate(String(after.webinarDate || after['date'] || webinarDate || '')),
    webinarTime: String(after.webinarTime || after['time'] || webinarTime || ''),
    webinarSpeaker: speaker,
    webinarDuration: duration,
    webinarType: (after.webinarType as 'paid' | 'free') || undefined,
    meetingLink,
    registrationStatus: newStatus as 'confirmed' | 'rejected',
    registrationNumber: after.registrationNumber ? String(after.registrationNumber) : undefined,
    transactionNumber: after.transactionNumber ? String(after.transactionNumber) : undefined,
    amount: price,
  }

  const rendered = renderWebinarConfirmationEmail(templateData)

  const result = await sendSingleEmail(
    { email, name: fullName },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['webinar-status-update'],
    { eventId: event.params.regId, status: newStatus }
  )

  if (!result.success) {
    functions.logger.error('Webinar status update email failed:', result.error)
  }
})

// ─── Firestore Trigger: Contact Message Created ───
export const onContactMessageCreated = onDocumentCreated('contactMessages/{messageId}', async (event) => {
  const msg = event.data?.data() as Record<string, unknown> | undefined
  if (!msg) return

  const email = String(msg.email || '')
  const name = String(msg.name || '')
  if (!email) return

  const rendered = renderContactAcknowledgmentEmail({
    name,
    subject: String(msg.subject || ''),
    message: String(msg.message || ''),
    ticketNumber: event.params.messageId.slice(0, 8).toUpperCase(),
  })

  const result = await sendSingleEmail(
    { email, name },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['contact-acknowledgment'],
    { eventId: event.params.messageId }
  )

  if (!result.success) {
    functions.logger.error('Contact acknowledgment email failed:', result.error)
  }
})

// ─── Firestore Trigger: Newsletter Subscriber Created ───
export const onNewsletterSubscriberCreated = onDocumentCreated('newsletterSubscribers/{subId}', async (event) => {
  const sub = event.data?.data() as Record<string, unknown> | undefined
  if (!sub) return

  const email = String(sub.email || '')
  if (!email) return

  const rendered = renderNewsletterWelcomeEmail({ email })

  const result = await sendSingleEmail(
    { email },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['newsletter-welcome'],
    { eventId: event.params.subId }
  )

  if (!result.success) {
    functions.logger.error('Newsletter welcome email failed:', result.error)
  }
})

// ─── Firestore Trigger: Newsletter Campaign Marked as Sent ───
// Raised timeout + batch pacing so a full-day quota's worth of sends (~300)
// completes instead of dying at the default 120s.
export const sendNewsletterCampaign = onDocumentUpdated(
  {
    document: 'newsletterCampaigns/{campaignId}',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (event) => {
  const before = event.data?.before?.data?.() as Record<string, unknown> | undefined
  const after = event.data?.after?.data?.() as Record<string, unknown> | undefined

  if (!before || !after) return

  const oldStatus = String(before.status || '')
  const newStatus = String(after.status || '')
  if (oldStatus === newStatus) return
  if (newStatus !== 'sent') return

  const subject = String(after.subject || '')
  const content = String(after.content || '')

  // Fetch all active subscribers
  const subscribersSnapshot = await db.collection('newsletterSubscribers')
    .where('isActive', '==', true)
    .get()

  const recipients: EmailRecipient[] = []
  for (const doc of subscribersSnapshot.docs) {
    const data = doc.data() as Record<string, unknown>
    const email = String(data.email || '')
    if (email) {
      recipients.push({ email })
    }
  }

  if (recipients.length === 0) {
    functions.logger.log('No active newsletter subscribers found for campaign', event.params.campaignId)
    return
  }

  // ── Per-recipient unsubscribe link (CAN-SPAM/GDPR) ──
  // Token = HMAC-SHA256(email, NEWSLETTER_UNSUBSCRIBE_SECRET) — the same
  // secret signs/verifies in the Next.js /api/newsletter/unsubscribe route.
  const siteUrl = process.env.SITE_URL || 'https://upisha.org'
  const unsubSecret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET

  const items: RenderedBulkEmail[] = recipients.map((recipient) => {
    let unsubscribeUrl: string | undefined
    if (unsubSecret && recipient.email) {
      const token = crypto.createHmac('sha256', unsubSecret).update(recipient.email.toLowerCase()).digest('hex')
      unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(recipient.email.toLowerCase())}&token=${token}`
    }
    const rendered = renderNewsletterContent({
      email: recipient.email,
      content,
      subject,
      unsubscribeUrl,
    })
    return { to: recipient, subject: rendered.subject, html: rendered.html, text: rendered.text }
  })

  if (!unsubSecret) {
    functions.logger.error('NEWSLETTER_UNSUBSCRIBE_SECRET not set — campaign emails will go out WITHOUT an unsubscribe link')
  }

  const result = await sendBulkRenderedEmails(items, ['newsletter-campaign'])

  functions.logger.info('Newsletter campaign send complete:', result)

  // Update campaign status
  await db.collection('newsletterCampaigns').doc(event.params.campaignId).update({
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
    sentCount: result.successful,
    failedCount: result.failed,
    skippedQuotaCount: result.skipped,
  })
})

// ─── Firestore Trigger: Receipt Created ───
export const onReceiptCreated = onDocumentCreated('receipts/{receiptId}', async (event) => {
  const receipt = event.data?.data() as Record<string, unknown> | undefined
  if (!receipt) return

  // Receipts auto-generated during member approval are embedded in the
  // combined approval email by sendMemberApprovalEmailTrigger — skip the
  // standalone receipt email for those.
  if (receipt.suppressEmail === true) return

  const email = String(receipt.memberEmail || '')
  const fullName = String(receipt.memberName || '')
  if (!email) return

  const rendered = renderReceiptEmail({
    fullName,
    receiptNumber: String(receipt.receiptNumber || ''),
    amount: typeof receipt.amount === 'number' ? receipt.amount : 0,
    transactionType: String(receipt.transactionType || ''),
    description: String(receipt.description || ''),
    paidAt: formatDateValue(receipt.issuedAt) || formatDateValue(new Date()),
  })

  const result = await sendSingleEmail(
    { email, name: fullName },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['receipt'],
    { eventId: event.params.receiptId }
  )

  if (!result.success) {
    functions.logger.error('Receipt email failed:', result.error)
  }
})

// ─── Firestore Trigger: Webinar Certificate Created ───
// When a webinar participation certificate is issued (admin action), send
// the recipient an email with a direct link to view/download it.
export const onWebinarCertificateCreated = onDocumentCreated('certificates/{certId}', async (event) => {
  const cert = event.data?.data() as Record<string, unknown> | undefined
  if (!cert) return

  // Only send email for webinar certificates
  if (String(cert.type || '') !== 'webinar') return

  const email = String(cert.email || '')
  const fullName = String(cert.memberName || '')
  if (!email) return

  const siteUrl = process.env.SITE_URL || 'https://upisha.org'
  const certificateUrl = `${siteUrl}/verify/${event.params.certId}`

  const templateData: WebinarCertificateTemplateData = {
    fullName,
    webinarTitle: String(cert.webinarTitle || 'Webinar'),
    certificateNumber: String(cert.certificateNumber || ''),
    certificateUrl,
  }

  const rendered = renderWebinarCertificateEmail(templateData)

  const result = await sendSingleEmail(
    { email, name: fullName },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['webinar-certificate'],
    { eventId: event.params.certId }
  )

  if (!result.success) {
    functions.logger.error('Webinar certificate email failed:', result.error)
  }
})

// ─── Callable: sendTransactionalEmail ───
// Manually trigger a transactional email from the Next.js app (admin use).
export const sendTransactionalEmail = onCall(async (request) => {
  // Only allow authenticated callers
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to send emails.')
  }

  // Admin-only (mirrors firestore.rules isAdmin() and requireAdmin() in
  // the Next.js API layer): role is stored on users/{uid}.role.
  const caller = await db.collection('users').doc(request.auth.uid).get()
  if (caller.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can send emails.')
  }

  const data = request.data as {
    to: EmailRecipient | EmailRecipient[]
    subject: string
    htmlContent?: string
    template?: 'member-approval' | 'webinar' | 'contact' | 'newsletter-welcome' | 'webinar-certificate'
    templateData?: Record<string, unknown>
  }

  if (!data || !data.to || !data.subject) {
    throw new HttpsError('invalid-argument', 'Missing required fields: to, subject')
  }

  const recipients = Array.isArray(data.to) ? data.to : [data.to]

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  for (const r of recipients) {
    if (!r.email || !emailRegex.test(r.email)) {
      throw new HttpsError('invalid-argument', `Invalid email address: ${r.email}`)
    }
  }

  // Determine content
  let html = data.htmlContent || ''
  let subject = data.subject

  // Render from template if template specified
  if (data.template && data.templateData) {
    switch (data.template) {
      case 'member-approval': {
        const rendered = renderMemberApprovalEmail(data.templateData as unknown as MemberApprovalTemplateData)
        subject = rendered.subject
        html = rendered.html
        break
      }
      case 'webinar': {
        const rendered = renderWebinarConfirmationEmail(data.templateData as unknown as WebinarConfirmationTemplateData)
        subject = rendered.subject
        html = rendered.html
        break
      }
      case 'webinar-certificate': {
        const rendered = renderWebinarCertificateEmail(data.templateData as unknown as WebinarCertificateTemplateData)
        subject = rendered.subject
        html = rendered.html
        break
      }
      case 'contact': {
        const rendered = renderContactAcknowledgmentEmail(data.templateData as unknown as Parameters<typeof renderContactAcknowledgmentEmail>[0])
        subject = rendered.subject
        html = rendered.html
        break
      }
      case 'newsletter-welcome': {
        const rendered = renderNewsletterWelcomeEmail(data.templateData as unknown as Parameters<typeof renderNewsletterWelcomeEmail>[0])
        subject = rendered.subject
        html = rendered.html
        break
      }
      default:
        throw new HttpsError('invalid-argument', `Unknown template: ${data.template}`)
    }
  }

  const result = await sendBulkEmails(
    recipients,
    subject,
    html,
    undefined,
    ['manual-send']
  )

  return result
})