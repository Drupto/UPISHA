/**
 * Shared email-outbox types. Safe to import from client components.
 * Server-side writes live in src/lib/email-outbox.ts.
 */

export type EmailOutboxTemplate =
  | 'contact-ack'
  | 'member-approval'
  | 'webinar-confirmation'
  | 'receipt'
  | 'webinar-certificate'
  | 'newsletter-welcome'
  | 'join-received'
  | 'publication-decision'
  | 'teach-decision'

export type EmailOutboxStatus =
  | 'pending_approval'
  | 'approved'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'rejected'

export interface EmailOutboxRecipient {
  email: string
  name?: string
}

export interface EmailOutboxSource {
  collection: string
  id: string
}

export interface EmailOutboxActor {
  type: 'public' | 'admin' | 'system'
  uid?: string
  email?: string | null
  ipHash?: string
}

export interface EmailOutboxApprover {
  uid: string
  email: string | null
}

/** Client-facing shape (Firestore Timestamps serialized to ISO strings). */
export interface EmailOutboxItem {
  id: string
  template: EmailOutboxTemplate
  to: EmailOutboxRecipient
  subject?: string | null
  templateData: Record<string, unknown>
  status: EmailOutboxStatus
  source: EmailOutboxSource
  requestedBy: EmailOutboxActor
  approvedBy?: EmailOutboxApprover | null
  approvedAt?: string | null
  rejectedBy?: EmailOutboxApprover | null
  rejectedAt?: string | null
  rejectionReason?: string | null
  sentAt?: string | null
  attempts: number
  lastError?: string | null
  dedupeKey: string
  createdAt?: string | null
  updatedAt?: string | null
}

export const EMAIL_OUTBOX_STATUSES: EmailOutboxStatus[] = [
  'pending_approval',
  'approved',
  'sending',
  'sent',
  'failed',
  'rejected',
]

/**
 * Firestore document IDs cannot contain '/'. A stable dedupe key becomes the
 * document ID so duplicate submissions/retries can never create two items.
 */
export function outboxDocumentId(dedupeKey: string): string {
  return dedupeKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 380)
}
