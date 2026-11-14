import * as admin from 'firebase-admin'
import * as crypto from 'crypto'
import * as functions from 'firebase-functions'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { setGlobalOptions } from 'firebase-functions/v2'
import { auditLogRetention } from './audit-retention'

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
// NOTE: BREVO_DAILY_LIMIT is intentionally NOT a params declaration —
// `defineString` demands a dotenv value at deploy time and breaks
// non-interactive deploys when unset. functions/src/email/brevo.service.ts
// already reads process.env.BREVO_DAILY_LIMIT with a safe 300 fallback, so
// set it via functions/.env only when upgrading the Brevo plan.

// Set region to match the project
setGlobalOptions({
  region: 'asia-south1',
  maxInstances: 10,
  timeoutSeconds: 120,
  secrets: [BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, SITE_URL, NEWSLETTER_UNSUBSCRIBE_SECRET],
})

// Re-export the scheduled audit-log retention function so the Firebase CLI
// picks it up on `firebase deploy --only functions`.
export { auditLogRetention }

// The ONLY transactional-email sender (approval-gated outbox) + crash recovery.
export {
  onEmailOutboxApproved,
  reconcileEmailOutbox,
  drainApprovedEmailOutbox,
} from './email-outbox'

// ─── LEGACY DIRECT EMAIL TRIGGERS (disabled) ───
// These trigger definitions are intentionally NOT exported: the Firebase CLI
// discovers only exports, so they will be undeployed. Email now flows through
// emailOutbox -> onEmailOutboxApproved only. They are kept temporarily for
// template/format helpers and will be deleted in the cleanup pass.


// ─── Email service imports ───
import {
  sendSingleEmail,
  sendBulkEmails,
  sendBulkRenderedEmails,
  getEmailSendingState,
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

// ─── Email send idempotency guard ───
// Firestore triggers are at-least-once: a retry must not send a duplicate
// email. Each send claims a deterministic marker doc in `emailSends` via a
// create-if-absent transaction. Returns true when this invocation won the
// claim and should send; false when a previous attempt already sent/skipped.
async function claimEmailSend(markerId: string): Promise<boolean> {
  const ref = db.collection('emailSends').doc(markerId)
  try {
    let claimed = false
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      if (snap.exists) return
      tx.set(ref, {
        claimedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      claimed = true
    })
    if (!claimed) {
      functions.logger.log(`Duplicate trigger delivery skipped (marker ${markerId} already claimed)`)
    }
    return claimed
  } catch (err) {
    // Fail open: a Firestore hiccup must not silently drop transactional email.
    // The duplicate-send risk on concurrent claims is far smaller than the
    // lost-email risk of bailing out here.
    functions.logger.warn(`Idempotency claim failed for ${markerId}, proceeding with send:`, err)
    return true
  }
}

// ─── Firestore Trigger: Member Created (Join Form) ───
// When a new member doc is created via /api/join, send application received email.
const sendJoinApplicationEmail = onDocumentCreated('members/{memberId}', async (event) => {
  const member = event.data?.data() as Record<string, unknown> | undefined
  if (!member) return

  if (!(await claimEmailSend(`join-application:${event.params.memberId}`))) return

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
const sendMemberApprovalEmailTrigger = onDocumentUpdated('members/{memberId}', async (event) => {
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

  // Idempotency: member status updates can redeliver; only the first delivery
  // for a given member+status transition sends.
  if (!(await claimEmailSend(`member-approval:${event.params.memberId}:${newStatus}`))) return

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
const onWebinarRegistrationCreated = onDocumentCreated('webinarRegistrations/{regId}', async (event) => {
  const reg = event.data?.data() as Record<string, unknown> | undefined
  if (!reg) return

  const email = String(reg.email || '')
  const fullName = String(reg.fullName || '')
  if (!email) return

  if (!(await claimEmailSend(`webinar-registration:${event.params.regId}`))) return

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
const onWebinarRegistrationUpdated = onDocumentUpdated('webinarRegistrations/{regId}', async (event) => {
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

  if (!(await claimEmailSend(`webinar-status:${event.params.regId}:${newStatus}`))) return

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
const onContactMessageCreated = onDocumentCreated('contactMessages/{messageId}', async (event) => {
  const msg = event.data?.data() as Record<string, unknown> | undefined
  if (!msg) return

  const email = String(msg.email || '')
  const name = String(msg.name || '')
  if (!email) return

  if (!(await claimEmailSend(`contact-ack:${event.params.messageId}`))) return

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

// ── Shared per-recipient unsubscribe link (CAN-SPAM/GDPR) ──
// Token = HMAC-SHA256(email, NEWSLETTER_UNSUBSCRIBE_SECRET) — the same
// secret signs/verifies in the Next.js /api/newsletter/unsubscribe route.
// Used by both the welcome email and every newsletter campaign send so a
// single code path builds the link.
function buildUnsubscribeUrlFor(email: string): string | undefined {
  const unsubSecret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET
  if (!unsubSecret || !email) return undefined
  const siteUrl = process.env.SITE_URL || 'https://upisha.org'
  const token = crypto.createHmac('sha256', unsubSecret).update(email.toLowerCase()).digest('hex')
  return `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}&token=${token}`
}

// ─── Firestore Trigger: Newsletter Subscriber Created ───
const onNewsletterSubscriberCreated = onDocumentCreated('newsletterSubscribers/{subId}', async (event) => {
  const sub = event.data?.data() as Record<string, unknown> | undefined
  if (!sub) return

  const email = String(sub.email || '')
  if (!email) return

  if (!(await claimEmailSend(`newsletter-welcome:${event.params.subId}`))) return

  const rendered = renderNewsletterWelcomeEmail({ email, unsubscribeUrl: buildUnsubscribeUrlFor(email) })

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

// ─── Newsletter Campaign Sending (resumable) ───
// A campaign list can be bigger than one invocation's timeout, so sending is
// cursor-based: the last processed subscriber doc ID and running counters are
// persisted after every batch, and `resumeStalledNewsletterCampaigns` picks
// the work back up until `sendState === 'completed'`. Per-batch markers in
// `emailSends` make redelivery/timeout recovery duplicate-free.
const CAMPAIGN_BATCH_SIZE = 25
const CAMPAIGN_TIME_BUDGET_MS = 7 * 60 * 1000 // stay under the 540s timeout
const CAMPAIGN_LOCK_STALE_MS = 15 * 60 * 1000

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

    await runNewsletterCampaign(event.params.campaignId)
  }
)

/**
 * Resume campaigns that stalled mid-send (timeout, deploy, quota window).
 * Only campaigns the sender itself marked `sendState: 'in_progress'` are
 * picked up — historical campaigns are never re-sent.
 */
export const resumeStalledNewsletterCampaigns = onSchedule(
  {
    schedule: 'every 10 minutes',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async () => {
    const state = await getEmailSendingState()
    if (!state.enabled) return

    const snapshot = await db
      .collection('newsletterCampaigns')
      .where('status', '==', 'sent')
      .where('sendState', '==', 'in_progress')
      .limit(10)
      .get()

    for (const doc of snapshot.docs) {
      await runNewsletterCampaign(doc.id)
    }
  }
)

async function runNewsletterCampaign(campaignId: string): Promise<void> {
  const ref = db.collection('newsletterCampaigns').doc(campaignId)
  const snap = await ref.get()
  if (!snap.exists) return
  const data = snap.data() as Record<string, unknown>
  if (String(data.status || '') !== 'sent') return
  if (data.sendState === 'completed' || data.sendState === 'failed') return

  // Operator kill switch: do not start (or resume) while paused.
  const sendingState = await getEmailSendingState()
  if (!sendingState.enabled) {
    functions.logger.warn('Newsletter campaign skipped: email sending is paused')
    return
  }

  // Concurrency lock: only one invocation works a campaign at a time; a lock
  // older than CAMPAIGN_LOCK_STALE_MS means the previous invocation died.
  const lockAcquired = await db.runTransaction(async (tx) => {
    const s = await tx.get(ref)
    const d = s.data() as Record<string, unknown> | undefined
    if (!d) return false
    if (String(d.status || '') !== 'sent') return false
    if (d.sendState === 'completed' || d.sendState === 'failed') return false
    const lockAt =
      (d.processingAt as admin.firestore.Timestamp | undefined)?.toDate?.()?.getTime?.() ?? 0
    if (Date.now() - lockAt < CAMPAIGN_LOCK_STALE_MS) return false
    tx.update(ref, { processingAt: admin.firestore.FieldValue.serverTimestamp() })
    return true
  })
  if (!lockAcquired) return

  const subject = String(data.subject || '')
  const content = String(data.content || '')

  if (!process.env.NEWSLETTER_UNSUBSCRIBE_SECRET) {
    // Compliance: never send bulk mail without an unsubscribe mechanism.
    functions.logger.error('NEWSLETTER_UNSUBSCRIBE_SECRET not set — campaign aborted, no emails sent')
    await ref.update({
      sendState: 'failed',
      processingAt: admin.firestore.FieldValue.delete(),
      failedCount: 0,
      skippedQuotaCount: 0,
      error: 'NEWSLETTER_UNSUBSCRIBE_SECRET not configured',
    })
    return
  }

  const deadline = Date.now() + CAMPAIGN_TIME_BUDGET_MS
  let cursor: string | null = typeof data.cursor === 'string' ? data.cursor : null
  let sentCount = typeof data.sentCount === 'number' ? data.sentCount : 0
  let failedCount = typeof data.failedCount === 'number' ? data.failedCount : 0
  let skippedCount = typeof data.skippedQuotaCount === 'number' ? data.skippedQuotaCount : 0
  let outOfTime = false
  let quotaBlocked = false

  try {
    outer: for (;;) {
      let query = db
        .collection('newsletterSubscribers')
        .where('isActive', '==', true)
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(500)
      if (cursor) query = query.startAfter(cursor)
      const page = await query.get()
      if (page.empty) break

      for (let i = 0; i < page.docs.length; i += CAMPAIGN_BATCH_SIZE) {
        if (Date.now() > deadline) {
          outOfTime = true
          break outer
        }
        const chunk = page.docs.slice(i, i + CAMPAIGN_BATCH_SIZE)
        const batchKey = chunk[chunk.length - 1].id
        const markerId = `newsletter-campaign:${campaignId}:batch:${batchKey}`

        if (await claimEmailSend(markerId)) {
          const items: RenderedBulkEmail[] = chunk
            .map((doc) => {
              const d = doc.data() as Record<string, unknown>
              const email = String(d.email || '')
              return { email, unsubscribeUrl: buildUnsubscribeUrlFor(email) }
            })
            .filter((r) => r.email && r.unsubscribeUrl)
            .map((r) => {
              const rendered = renderNewsletterContent({
                email: r.email,
                content,
                subject,
                unsubscribeUrl: r.unsubscribeUrl,
              })
              return {
                to: { email: r.email } as EmailRecipient,
                subject: rendered.subject,
                html: rendered.html,
                text: rendered.text,
              }
            })

          const result = await sendBulkRenderedEmails(items, ['newsletter-campaign'])
          sentCount += result.successful
          failedCount += result.failed
          skippedCount += result.skipped

          if (result.skipped > 0 && result.successful === 0) {
            // Quota exhausted and NOTHING was sent for this batch — release
            // the marker so the batch is re-sent (not skipped) when the
            // quota window resets.
            try {
              await db.collection('emailSends').doc(markerId).delete()
            } catch (deleteErr) {
              functions.logger.warn(`Failed to release campaign batch marker ${markerId}:`, deleteErr)
            }
            quotaBlocked = true
            break outer
          }
        } else {
          functions.logger.log(`Campaign batch ${batchKey} already sent; advancing cursor`)
        }

        // Persist progress after every batch: a timeout/deploy loses at most
        // the in-flight batch, never duplicates an already-sent one.
        cursor = batchKey
        await ref.update({
          cursor,
          sentCount,
          failedCount,
          skippedQuotaCount: skippedCount,
          processingAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }

      if (page.size < 500) break
    }

    const completed = !outOfTime && !quotaBlocked
    await ref.update({
      sendState: completed ? 'completed' : 'in_progress',
      cursor: cursor ?? null,
      sentCount,
      failedCount,
      skippedQuotaCount: skippedCount,
      processingAt: admin.firestore.FieldValue.delete(),
      ...(completed ? { sentAt: admin.firestore.FieldValue.serverTimestamp() } : {}),
    })

    functions.logger.info('Newsletter campaign run finished:', {
      campaignId,
      completed,
      outOfTime,
      quotaBlocked,
      sentCount,
      failedCount,
      skippedCount,
      cursor,
    })
  } catch (err) {
    functions.logger.error('Newsletter campaign send failed:', err)
    try {
      await ref.update({
        sendState: 'in_progress',
        cursor: cursor ?? null,
        sentCount,
        failedCount,
        skippedQuotaCount: skippedCount,
        processingAt: admin.firestore.FieldValue.delete(),
        error: err instanceof Error ? err.message : 'Unknown campaign error',
      })
    } catch (updateErr) {
      functions.logger.error('Failed to persist campaign error state:', updateErr)
    }
  }
}

// ─── Firestore Trigger: Receipt Created ───
const onReceiptCreated = onDocumentCreated('receipts/{receiptId}', async (event) => {
  const receipt = event.data?.data() as Record<string, unknown> | undefined
  if (!receipt) return

  // Receipts auto-generated during member approval are embedded in the
  // combined approval email by sendMemberApprovalEmailTrigger — skip the
  // standalone receipt email for those.
  if (receipt.suppressEmail === true) return

  const email = String(receipt.memberEmail || '')
  const fullName = String(receipt.memberName || '')
  if (!email) return

  if (!(await claimEmailSend(`receipt:${event.params.receiptId}`))) return

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
const onWebinarCertificateCreated = onDocumentCreated('certificates/{certId}', async (event) => {
  const cert = event.data?.data() as Record<string, unknown> | undefined
  if (!cert) return

  // Only send email for webinar certificates
  if (String(cert.type || '') !== 'webinar') return

  const email = String(cert.email || '')
  const fullName = String(cert.memberName || '')
  if (!email) return

  if (!(await claimEmailSend(`webinar-certificate:${event.params.certId}`))) return

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
const sendTransactionalEmail = onCall(async (request) => {
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

  // Abuse guard: a compromised/stolen admin token must not turn this into an
  // unbounded spam cannon. Manual sends are for single/recipient-list resends.
  const MAX_MANUAL_RECIPIENTS = 50
  if (recipients.length === 0 || recipients.length > MAX_MANUAL_RECIPIENTS) {
    throw new HttpsError('invalid-argument', `Recipient count must be 1-${MAX_MANUAL_RECIPIENTS}`)
  }
  if (typeof data.subject !== 'string' || data.subject.length === 0 || data.subject.length > 200) {
    throw new HttpsError('invalid-argument', 'Subject must be 1-200 characters')
  }

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

  // Payload guard: Brevo + Firestore stay healthy with a bounded message size.
  // 500KB HTML is far above any legitimate transactional template.
  const MAX_HTML_BYTES = 500 * 1024
  if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
    throw new HttpsError('invalid-argument', 'HTML content exceeds 500KB limit')
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

// Keep the disabled legacy trigger definitions referenced so TypeScript's
// `noUnusedLocals` passes while they are pending deletion. They are NOT
// exported and therefore are not deployed.
void sendJoinApplicationEmail
void sendMemberApprovalEmailTrigger
void onWebinarRegistrationCreated
void onWebinarRegistrationUpdated
void onContactMessageCreated
void onNewsletterSubscriberCreated
void onReceiptCreated
void onWebinarCertificateCreated
void sendTransactionalEmail