/**
 * Server-side email outbox — the single approval gate for transactional email.
 *
 * Public routes enqueue `pending_approval` items. Admin actions enqueue
 * `approved` items (the admin action itself is the approval) only when the
 * admin explicitly opted to notify. The Cloud Functions sender
 * (`functions/src/email-outbox.ts`) is the only consumer that calls Brevo.
 *
 * Firestore rules deny all client access to `emailOutbox`.
 *
 * SERVER ONLY — imports the Firebase Admin SDK.
 */

import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getAdminDb } from './firebase-server'
import type {
  EmailOutboxActor,
  EmailOutboxApprover,
  EmailOutboxItem,
  EmailOutboxRecipient,
  EmailOutboxSource,
  EmailOutboxStatus,
  EmailOutboxTemplate,
} from './email-outbox-types'
import { outboxDocumentId, stripUndefined } from './email-outbox-types'

export interface EnqueueEmailInput {
  /** Stable key, e.g. `contact-ack:<messageId>`. Becomes the document ID. */
  dedupeKey: string
  template: EmailOutboxTemplate
  to: EmailOutboxRecipient
  templateData: Record<string, unknown>
  source: EmailOutboxSource
  requestedBy: EmailOutboxActor
  /** When set, the item is created already approved by this admin. */
  approvedBy?: EmailOutboxApprover
  subject?: string
}

const EMAIL_SENDS_COLLECTION = 'emailSends'

function outboxMarkerId(id: string): string {
  return `outbox:${id}`
}

export { stripUndefined } from './email-outbox-types'

export async function enqueueEmail(
  input: EnqueueEmailInput
): Promise<{ id: string; created: boolean }> {
  if (!input.to.email || !input.to.email.includes('@')) {
    throw new Error('enqueueEmail requires a valid recipient email')
  }
  if (input.approvedBy && !input.approvedBy.uid) {
    throw new Error('enqueueEmail approvedBy requires an admin uid')
  }

  const db = getAdminDb()
  const id = outboxDocumentId(input.dedupeKey)
  const ref = db.collection('emailOutbox').doc(id)
  const now = FieldValue.serverTimestamp()

  const data: Record<string, unknown> = {
    template: input.template,
    to: input.to,
    subject: input.subject ?? null,
    templateData: stripUndefined(input.templateData) as Record<string, unknown>,
    status: input.approvedBy ? 'approved' : 'pending_approval',
    source: input.source,
    requestedBy: input.requestedBy,
    approvedBy: input.approvedBy ?? null,
    approvedAt: input.approvedBy ? now : null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    sentAt: null,
    attempts: 0,
    lastError: null,
    dedupeKey: input.dedupeKey,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await ref.create(data)
    return { id, created: true }
  } catch (error) {
    const code = (error as { code?: number | string } | null)?.code
    // gRPC ALREADY_EXISTS (6) or the JS SDK's already-exists code.
    if (code === 6 || code === 'already-exists') {
      return { id, created: false }
    }
    throw error
  }
}

function toIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return null
}

export function serializeOutbox(
  id: string,
  data: Record<string, unknown>
): EmailOutboxItem {
  return {
    id,
    template: data.template as EmailOutboxTemplate,
    to: (data.to ?? { email: '' }) as EmailOutboxRecipient,
    subject: (data.subject as string | null | undefined) ?? null,
    templateData: (data.templateData ?? {}) as Record<string, unknown>,
    status: (data.status ?? 'pending_approval') as EmailOutboxStatus,
    source: (data.source ?? { collection: '', id: '' }) as EmailOutboxSource,
    requestedBy: (data.requestedBy ?? { type: 'system' }) as EmailOutboxActor,
    approvedBy: (data.approvedBy as EmailOutboxApprover | null | undefined) ?? null,
    approvedAt: toIso(data.approvedAt),
    rejectedBy: (data.rejectedBy as EmailOutboxApprover | null | undefined) ?? null,
    rejectedAt: toIso(data.rejectedAt),
    rejectionReason: (data.rejectionReason as string | null | undefined) ?? null,
    sentAt: toIso(data.sentAt),
    attempts: typeof data.attempts === 'number' ? data.attempts : 0,
    lastError: (data.lastError as string | null | undefined) ?? null,
    dedupeKey: String(data.dedupeKey ?? id),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

export async function listOutboxItems(options: {
  status?: EmailOutboxStatus
  limit?: number
} = {}): Promise<EmailOutboxItem[]> {
  const db = getAdminDb()
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 200)
  const query = options.status
    ? db
        .collection('emailOutbox')
        .where('status', '==', options.status)
        .orderBy('createdAt', 'desc')
        .limit(limit)
    : db.collection('emailOutbox').orderBy('createdAt', 'desc').limit(limit)

  const snapshot = await query.get()
  return snapshot.docs.map((doc) => serializeOutbox(doc.id, doc.data()))
}

export async function approveOutboxItem(
  id: string,
  approver: EmailOutboxApprover
): Promise<'approved' | 'not-found' | 'invalid-status'> {
  const db = getAdminDb()
  const ref = db.collection('emailOutbox').doc(id)

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) return 'not-found'
    const data = snap.data() as Record<string, unknown>
    if (data.status !== 'pending_approval') return 'invalid-status'

    tx.update(ref, {
      status: 'approved',
      approvedBy: approver,
      approvedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return 'approved'
  })
}

export async function rejectOutboxItem(
  id: string,
  rejector: EmailOutboxApprover,
  reason: string
): Promise<'rejected' | 'not-found' | 'invalid-status'> {
  const db = getAdminDb()
  const ref = db.collection('emailOutbox').doc(id)

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) return 'not-found'
    const data = snap.data() as Record<string, unknown>
    if (data.status !== 'pending_approval') return 'invalid-status'

    tx.update(ref, {
      status: 'rejected',
      rejectedBy: rejector,
      rejectedAt: FieldValue.serverTimestamp(),
      rejectionReason: reason,
      updatedAt: FieldValue.serverTimestamp(),
    })
    return 'rejected'
  })
}

export async function retryOutboxItem(
  id: string
): Promise<'approved' | 'not-found' | 'invalid-status'> {
  const db = getAdminDb()
  const ref = db.collection('emailOutbox').doc(id)
  const markerRef = db.collection(EMAIL_SENDS_COLLECTION).doc(outboxMarkerId(id))

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) return 'not-found'
    const data = snap.data() as Record<string, unknown>
    if (data.status !== 'failed') return 'invalid-status'

    // Allow the sender to re-claim this item. The marker is what prevents
    // duplicate sends during normal retries — deleting it is only safe from
    // this explicit admin "retry failed email" action.
    tx.delete(markerRef)
    tx.update(ref, {
      status: 'approved',
      lastError: null,
      updatedAt: FieldValue.serverTimestamp(),
    })
    return 'approved'
  })
}


