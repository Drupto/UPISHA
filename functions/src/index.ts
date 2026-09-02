import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

// Set region to match the project
setGlobalOptions({
  region: 'asia-south1',
  maxInstances: 10,
  timeoutSeconds: 120,
})

// ─── Email service imports ───
import {
  sendSingleEmail,
  sendBulkEmails,
  EmailRecipient,
} from './email/brevo.service'
import {
  renderMemberApprovalEmail,
  MemberApprovalTemplateData,
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

  const templateData: MemberApprovalTemplateData = {
    fullName,
    status: newStatus as 'approved' | 'rejected',
    loginUrl: process.env.SITE_URL ? `${process.env.SITE_URL}/login` : undefined,
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

  try {
    const webinarSnap = await db.collection('webinars').doc(webinarId).get()
    if (webinarSnap.exists) {
      const webinar = webinarSnap.data() as Record<string, unknown>
      meetingLink = webinar.meetingLink ? String(webinar.meetingLink) : undefined
      speaker = webinar.speaker ? String(webinar.speaker) : undefined
      duration = webinar.duration ? String(webinar.duration) : undefined
      price = typeof webinar.price === 'number' ? webinar.price : undefined
    }
  } catch (err) {
    functions.logger.warn('Failed to fetch webinar for registration email:', err)
  }

  const templateData: WebinarConfirmationTemplateData = {
    fullName,
    webinarTitle: String(reg.webinarTitle || ''),
    webinarDate: String(reg.webinarDate || reg['date'] || ''),
    webinarTime: String(reg.webinarTime || reg['time'] || ''),
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

  try {
    const webinarSnap = await db.collection('webinars').doc(webinarId).get()
    if (webinarSnap.exists) {
      const webinar = webinarSnap.data() as Record<string, unknown>
      meetingLink = webinar.meetingLink ? String(webinar.meetingLink) : undefined
      speaker = webinar.speaker ? String(webinar.speaker) : undefined
      duration = webinar.duration ? String(webinar.duration) : undefined
      price = typeof webinar.price === 'number' ? webinar.price : undefined
    }
  } catch (err) {
    functions.logger.warn('Failed to fetch webinar for update email:', err)
  }

  const templateData: WebinarConfirmationTemplateData = {
    fullName,
    webinarTitle: String(after.webinarTitle || ''),
    webinarDate: String(after.webinarDate || after['date'] || ''),
    webinarTime: String(after.webinarTime || after['time'] || ''),
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
export const sendNewsletterCampaign = onDocumentUpdated('newsletterCampaigns/{campaignId}', async (event) => {
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

  // Build unsubscribe URL per recipient
  const rendered = renderNewsletterContent({
    email: recipients[0]?.email || '',
    content,
    subject,
    unsubscribeUrl: undefined,
  })

  const result = await sendBulkEmails(
    recipients,
    rendered.subject,
    rendered.html,
    rendered.text,
    ['newsletter-campaign']
  )

  functions.logger.info('Newsletter campaign send complete:', result)

  // Update campaign status
  await db.collection('newsletterCampaigns').doc(event.params.campaignId).update({
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
    sentCount: result.successful,
    failedCount: result.failed,
  })
})

// ─── Firestore Trigger: Receipt Created ───
export const onReceiptCreated = onDocumentCreated('receipts/{receiptId}', async (event) => {
  const receipt = event.data?.data() as Record<string, unknown> | undefined
  if (!receipt) return

  const email = String(receipt.memberEmail || '')
  const fullName = String(receipt.memberName || '')
  if (!email) return

  const rendered = renderReceiptEmail({
    fullName,
    receiptNumber: String(receipt.receiptNumber || ''),
    amount: typeof receipt.amount === 'number' ? receipt.amount : 0,
    transactionType: String(receipt.transactionType || ''),
    description: String(receipt.description || ''),
    paidAt: String(receipt.issuedAt || new Date().toISOString()),
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

  // N4: only admins may send emails — otherwise any signed-in user could
  // abuse the project's Brevo account to send arbitrary emails.
  const callerDoc = await db.collection('users').doc(request.auth.uid).get()
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can send transactional emails.')
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