/**
 * Email outbox sender — the ONLY transactional email path.
 *
 * Admin/public routes write `emailOutbox` documents. This trigger sends items
 * whose status is `approved` (created approved by an explicit admin action, or
 * moved to approved in the approval queue). It never sends `pending_approval`.
 *
 * Safety: kill switch, hourly/daily quota, idempotency marker, and
 * paused/quota failures stay queued instead of being marked failed.
 */
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { sendSingleEmail, getEmailSendingState } from './email/brevo.service'
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
  renderReceiptEmail,
  renderPublicationDecisionEmail,
  renderTeachDecisionEmail,
} from './email/templates.misc'

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

/**
 * How long a claim marker without a Brevo confirmation is considered
 * "actively sending". Past this, the claiming invocation is assumed dead and
 * the item may be re-claimed (crash-before-Brevo recovery).
 */
const OUTBOX_CLAIM_STALE_MS = 10 * 60 * 1000

interface OutboxDoc {
  template?: string
  to?: { email?: string; name?: string }
  subject?: string | null
  templateData?: Record<string, unknown>
  status?: string
  source?: { collection?: string; id?: string }
  attempts?: number
}

interface RenderedEmail {
  subject: string
  html: string
  text: string
}

function renderOutboxEmail(data: OutboxDoc): RenderedEmail {
  const templateData = (data.templateData ?? {}) as Record<string, unknown>

  switch (data.template) {
    case 'contact-ack':
      return renderContactAcknowledgmentEmail(
        templateData as unknown as Parameters<typeof renderContactAcknowledgmentEmail>[0]
      )
    case 'join-received':
      return renderJoinFormConfirmationEmail(
        templateData as unknown as Parameters<typeof renderJoinFormConfirmationEmail>[0]
      )
    case 'member-approval':
      return renderMemberApprovalEmail(templateData as unknown as MemberApprovalTemplateData)
    case 'webinar-confirmation':
      return renderWebinarConfirmationEmail(
        templateData as unknown as WebinarConfirmationTemplateData
      )
    case 'receipt':
      return renderReceiptEmail(
        templateData as unknown as Parameters<typeof renderReceiptEmail>[0]
      )
    case 'webinar-certificate':
      return renderWebinarCertificateEmail(
        templateData as unknown as WebinarCertificateTemplateData
      )
    case 'newsletter-welcome':
      return renderNewsletterWelcomeEmail(
        templateData as unknown as Parameters<typeof renderNewsletterWelcomeEmail>[0]
      )
    case 'publication-decision':
      return renderPublicationDecisionEmail(
        templateData as unknown as Parameters<typeof renderPublicationDecisionEmail>[0]
      )
    case 'teach-decision':
      return renderTeachDecisionEmail(
        templateData as unknown as Parameters<typeof renderTeachDecisionEmail>[0]
      )
    default:
      throw new Error(`Unsupported email template: ${String(data.template)}`)
  }
}

async function claimOutboxItem(id: string): Promise<boolean> {
  const outboxRef = db.collection('emailOutbox').doc(id)
  const markerRef = db.collection('emailSends').doc(`outbox:${id}`)

  try {
    return await db.runTransaction(async (tx) => {
      const outboxSnap = await tx.get(outboxRef)
      if (!outboxSnap.exists) return false

      const outbox = outboxSnap.data() as OutboxDoc
      if (outbox.status !== 'approved') return false

      const markerSnap = await tx.get(markerRef)
      if (markerSnap.exists) {
        const markerData = markerSnap.data() as {
          sentAt?: admin.firestore.Timestamp
          claimedAt?: admin.firestore.Timestamp
        }
        if (markerData.sentAt) {
          // A previous invocation confirmed the Brevo send but crashed before
          // updating the status. The marker is authoritative: never send twice.
          tx.update(outboxRef, {
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          return false
        }
        // Claimed but never confirmed. A fresh claim means another invocation
        // is actively sending; a stale claim means the previous invocation
        // died before Brevo responded, so it is safe to re-claim and send.
        const claimedAt = markerData.claimedAt?.toDate?.()?.getTime?.() ?? 0
        if (Date.now() - claimedAt < OUTBOX_CLAIM_STALE_MS) return false
      }

      tx.set(markerRef, { claimedAt: admin.firestore.FieldValue.serverTimestamp() })
      tx.update(outboxRef, {
        status: 'sending',
        attempts: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      return true
    })
  } catch (err) {
    functions.logger.warn(`Outbox claim failed for ${id}, not sending:`, err)
    return false
  }
}

async function releaseOutboxItem(id: string, error: string): Promise<void> {
  const outboxRef = db.collection('emailOutbox').doc(id)
  const markerRef = db.collection('emailSends').doc(`outbox:${id}`)
  try {
    await markerRef.delete()
    await outboxRef.update({
      status: 'approved',
      lastError: error,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (err) {
    functions.logger.error(`Failed to release outbox item ${id}:`, err)
  }
}

async function failOutboxItem(id: string, error: string): Promise<void> {
  try {
    await db.collection('emailOutbox').doc(id).update({
      status: 'failed',
      lastError: error,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (err) {
    functions.logger.error(`Failed to mark outbox item ${id} failed:`, err)
  }
}

async function processOutboxItem(id: string): Promise<void> {
  const outboxRef = db.collection('emailOutbox').doc(id)
  const markerRef = db.collection('emailSends').doc(`outbox:${id}`)
  const snap = await outboxRef.get()
  if (!snap.exists) return

  const data = snap.data() as OutboxDoc
  if (data.status !== 'approved') return

  // Do not even claim while the operator kill switch is off — the scheduled
  // drain will pick the item up after email is re-enabled.
  const sendingState = await getEmailSendingState()
  if (!sendingState.enabled) return

  const email = String(data.to?.email ?? '')
  if (!email) {
    await failOutboxItem(id, 'Missing recipient email')
    return
  }

  if (!(await claimOutboxItem(id))) return

  try {
    const rendered = renderOutboxEmail(data)
    const result = await sendSingleEmail(
      { email, name: data.to?.name },
      rendered.subject,
      rendered.html,
      rendered.text,
      ['outbox', String(data.template ?? 'transactional')],
      {
        outboxId: id,
        sourceCollection: data.source?.collection,
        sourceId: data.source?.id,
      }
    )

    if (result.success) {
      // Stamp the marker BEFORE marking the item sent: reconcileEmailOutbox
      // (and claimOutboxItem) use this field to distinguish "Brevo accepted
      // the email" from "claimed but the process died before the Brevo call".
      await markerRef.set(
        { sentAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      )
      await outboxRef.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        lastError: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      return
    }

    if (result.paused || result.quotaExceeded || result.rateLimited) {
      await releaseOutboxItem(id, result.error || 'Email sending temporarily unavailable')
      return
    }

    await failOutboxItem(id, result.error || 'Brevo send failed')
  } catch (err) {
    await failOutboxItem(id, err instanceof Error ? err.message : 'Unknown send error')
  }
}

export const onEmailOutboxApproved = onDocumentWritten(
  'emailOutbox/{outboxId}',
  async (event) => {
    const before = event.data?.before?.data() as OutboxDoc | undefined
    const after = event.data?.after?.data() as OutboxDoc | undefined
    if (!after) return
    if (after.status !== 'approved') return
    // Ignore no-op updates while already approved; process create-as-approved
    // and transitions into approved (e.g. failed -> approved on retry).
    if (before?.status === 'approved' || before?.status === 'sending') return

    await processOutboxItem(event.params.outboxId)
  }
)

/**
 * Crash recovery: an invocation that died mid-send leaves an item in
 * `sending`. A marker stamped with `sentAt` proves Brevo accepted the email
 * (mark it `sent`); a marker without `sentAt` means the process died before
 * (or during) the Brevo call, so the item is re-queued for the drain to
 * re-send. Run every 15 minutes.
 */
export const reconcileEmailOutbox = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeoutSeconds: 300,
  },
  async () => {
    const cutoff = Date.now() - 10 * 60 * 1000
    const deadline = Date.now() + 4 * 60 * 1000 // stop before the timeout kills us mid-item
    const snapshot = await db
      .collection('emailOutbox')
      .where('status', '==', 'sending')
      .limit(200)
      .get()

    for (const doc of snapshot.docs) {
      if (Date.now() > deadline) {
        functions.logger.warn('Outbox reconcile hit its time budget; remaining items next run')
        break
      }
      const data = doc.data() as OutboxDoc & { updatedAt?: admin.firestore.Timestamp }
      const updatedAt = data.updatedAt?.toDate?.()?.getTime?.() ?? 0
      if (updatedAt > cutoff) continue

      const markerRef = db.collection('emailSends').doc(`outbox:${doc.id}`)
      try {
        await db.runTransaction(async (tx) => {
          const outboxSnap = await tx.get(doc.ref)
          if (!outboxSnap.exists) return
          if ((outboxSnap.data() as OutboxDoc).status !== 'sending') return

          const markerSnap = await tx.get(markerRef)
          if (markerSnap.exists && markerSnap.data()?.sentAt) {
            // Brevo confirmed the send before the crash — the email is out.
            tx.update(doc.ref, {
              status: 'sent',
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            return
          }
          // Claimed but never confirmed: the invocation died before (or during)
          // the Brevo call, so the email almost certainly never left. Re-queue
          // the item for the drain job instead of assuming it was sent.
          if (markerSnap.exists) tx.delete(markerRef)
          tx.update(doc.ref, {
            status: 'approved',
            lastError: 'Recovered: send was claimed but never confirmed; re-queued',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        })
      } catch (err) {
        functions.logger.warn(`Outbox recovery failed for ${doc.id}:`, err)
      }
    }
  }
)

/**
 * Drain approved items. This is what resumes the queue after a pause/quota
 * window ends (a Firestore event is not emitted when `config/emailSending`
 * flips back on). Also catches any approved item whose trigger event was lost.
 */
export const drainApprovedEmailOutbox = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeoutSeconds: 300,
  },
  async () => {
    const state = await getEmailSendingState()
    if (!state.enabled) return

    const deadline = Date.now() + 4 * 60 * 1000 // stop before the timeout kills us mid-item
    const snapshot = await db
      .collection('emailOutbox')
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get()

    for (const doc of snapshot.docs) {
      if (Date.now() > deadline) {
        functions.logger.warn('Outbox drain hit its time budget; remaining items resume next run')
        break
      }
      await processOutboxItem(doc.id)
    }
  }
)


