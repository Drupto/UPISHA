import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { TransactionalEmailsApi, SendSmtpEmail, SendSmtpEmailToInner } from '@getbrevo/brevo'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

// ─── Daily email quota (Brevo free tier: 300 emails/day) ───
// Brevo's API does not expose remaining daily credits reliably, so we track
// our own counter in Firestore (`emailQuota/{YYYY-MM-DD}`, UTC day) and treat
// a Brevo 429/402 response as authoritative "exhausted" signal.
const DAILY_EMAIL_LIMIT = (() => {
  const n = Number(process.env.BREVO_DAILY_LIMIT)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 300
})()

function quotaDocRef(): admin.firestore.DocumentReference {
  const today = new Date().toISOString().slice(0, 10) // UTC day — matches the Next.js admin dashboard
  return db.collection('emailQuota').doc(today)
}

export interface QuotaStatus {
  limit: number
  used: number
  remaining: number
  exhausted: boolean
}

async function getQuotaStatus(): Promise<QuotaStatus> {
  try {
    const snap = await quotaDocRef().get()
    const data = snap.data() as { used?: unknown; exhausted?: unknown } | undefined
    const used = typeof data?.used === 'number' ? data.used : 0
    const exhausted = data?.exhausted === true || used >= DAILY_EMAIL_LIMIT
    return { limit: DAILY_EMAIL_LIMIT, used, remaining: Math.max(0, DAILY_EMAIL_LIMIT - used), exhausted }
  } catch (err) {
    // Fail open: a Firestore hiccup should not block ALL transactional email.
    // Brevo itself will still 429 past the real limit, and we then mark the
    // quota doc as exhausted.
    functions.logger.warn('Failed to read email quota, assuming available:', err)
    return { limit: DAILY_EMAIL_LIMIT, used: 0, remaining: DAILY_EMAIL_LIMIT, exhausted: false }
  }
}

async function incrementQuotaUsed(): Promise<void> {
  try {
    await quotaDocRef().set(
      {
        used: admin.firestore.FieldValue.increment(1),
        limit: DAILY_EMAIL_LIMIT,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  } catch (err) {
    functions.logger.warn('Failed to increment email quota counter:', err)
  }
}

async function markQuotaExhausted(): Promise<void> {
  try {
    await quotaDocRef().set(
      {
        exhausted: true,
        limit: DAILY_EMAIL_LIMIT,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  } catch (err) {
    functions.logger.warn('Failed to mark email quota exhausted:', err)
  }
}

/** Admin dashboard polls this via /api/email/quota. */
export async function getDailyEmailQuota(): Promise<QuotaStatus> {
  return getQuotaStatus()
}

// Brevo API client
let brevoClient: TransactionalEmailsApi | null = null

function getBrevoClient(): TransactionalEmailsApi {
  if (!brevoClient) {
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      throw new Error('BREVO_API_KEY environment variable is not set')
    }
    brevoClient = new TransactionalEmailsApi()
    brevoClient.setApiKey(0, apiKey)
  }
  return brevoClient
}

export interface EmailRecipient {
  email: string
  name?: string
}

export interface EmailAttachment {
  name: string
  content: string // base64 encoded
  contentType?: string
}

export interface SendEmailOptions {
  to: EmailRecipient[]
  subject: string
  htmlContent: string
  textContent?: string
  sender?: EmailRecipient
  replyTo?: EmailRecipient
  attachments?: EmailAttachment[]
  tags?: string[]
  templateId?: number
  params?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface EmailLogData {
  to: string
  toName?: string | null
  subject: string
  template: string
  status: 'sent' | 'failed' | 'queued' | 'quota-exceeded'
  messageId?: string | null
  error?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: admin.firestore.FieldValue
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
  /** True when the send was blocked because the daily Brevo quota is exhausted. */
  quotaExceeded?: boolean
}

/**
 * Log email to Firestore for tracking/analytics
 */
async function logEmail(logData: EmailLogData): Promise<void> {
  try {
    await db.collection('emailLogs').add(logData)
  } catch (err) {
    functions.logger.error('Failed to log email to Firestore:', err)
  }
}

/**
 * Classify a Brevo/axios error.
 * The @getbrevo/brevo SDK (request-based) exposes the HTTP status as
 * `err.statusCode`, while axios-style clients use `err.response.status`.
 */
function errorStatus(err: unknown): number | undefined {
  const anyErr = err as {
    response?: { status?: number }
    status?: number
    statusCode?: number
  } | null
  return anyErr?.response?.status ?? anyErr?.statusCode ?? anyErr?.status
}

function errorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } } }
  return String(
    anyErr?.response?.data?.message || (err instanceof Error ? err.message : 'Unknown error sending email')
  )
}

/** Brevo 429/402 or an explicit "limit" message means the daily quota is gone. */
function isQuotaError(err: unknown): boolean {
  const status = errorStatus(err)
  if (status === 429 || status === 402) return true
  return /quota|account limit|daily limit|sending limit|credits? (exhausted|exceeded)/i.test(errorMessage(err))
}

/** Only network glitches / server-side hiccups are worth retrying. */
function isTransientError(err: unknown): boolean {
  const status = errorStatus(err)
  if (status === undefined) return true // no HTTP response → network-level failure
  if (status === 429) return true // rate limited (quota exhaustion is handled separately)
  return status >= 500
  // 4xx client errors (401 invalid API key, 403, 400 bad payload, …) are
  // permanent — retrying just wastes time and burns quota.
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const MAX_SEND_ATTEMPTS = 3

/**
 * Send a transactional email via Brevo.
 * - Enforces the daily quota (skip + flag when exhausted)
 * - Retries transient failures (network / 5xx / 429-not-quota) with backoff
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const client = getBrevoClient()

  const sender = options.sender ?? {
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@upisha.org',
    name: process.env.BREVO_SENDER_NAME || 'UP ISHA Team',
  }

  const templateTag = options.tags?.[0] || 'transactional'
  const recipientEmail = options.to[0]?.email || ''

  // ── Quota pre-check ──
  const quota = await getQuotaStatus()
  if (quota.exhausted) {
    await logEmail({
      to: recipientEmail,
      toName: options.to[0]?.name || null,
      subject: options.subject,
      template: templateTag,
      status: 'quota-exceeded',
      error: 'Daily email quota exhausted — send skipped',
      metadata: options.metadata || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return { success: false, quotaExceeded: true, error: 'Daily email quota exhausted' }
  }

  // Count the attempt BEFORE sending: slightly overcounts on hard failures,
  // but that is the safe direction — better to stop early than to overrun
  // Brevo's limit and have sends fail silently.
  await incrementQuotaUsed()

  const sendSmtpEmail = new SendSmtpEmail()
  sendSmtpEmail.to = options.to.map((r) => {
    const recipient = new SendSmtpEmailToInner()
    recipient.email = r.email
    if (r.name) recipient.name = r.name
    return recipient
  })
  sendSmtpEmail.sender = sender
  sendSmtpEmail.subject = options.subject
  sendSmtpEmail.htmlContent = options.htmlContent
  if (options.textContent) sendSmtpEmail.textContent = options.textContent
  if (options.replyTo) sendSmtpEmail.replyTo = options.replyTo
  if (options.attachments && options.attachments.length > 0) {
    sendSmtpEmail.attachment = options.attachments.map((a) => ({
      name: a.name,
      content: a.content,
      contentType: a.contentType || 'application/octet-stream',
    }))
  }
  if (options.tags && options.tags.length > 0) {
    sendSmtpEmail.tags = options.tags
  }
  if (options.templateId) {
    sendSmtpEmail.templateId = options.templateId
  }
  if (options.params) {
    sendSmtpEmail.params = options.params
  }

  // ── Send with retry ──
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
    try {
      const result = await client.sendTransacEmail(sendSmtpEmail)
      const messageId = result.body?.messageId || null

      await logEmail({
        to: recipientEmail,
        toName: options.to[0]?.name || null,
        subject: options.subject,
        template: templateTag,
        status: 'sent',
        messageId,
        metadata: options.metadata || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      return { success: true, messageId: messageId || undefined }
    } catch (err) {
      lastError = err

      if (isQuotaError(err)) {
        // Brevo says the account is out of credits — authoritative signal.
        await markQuotaExhausted()
        const msg = errorMessage(err)
        await logEmail({
          to: recipientEmail,
          toName: options.to[0]?.name || null,
          subject: options.subject,
          template: templateTag,
          status: 'quota-exceeded',
          error: msg,
          metadata: options.metadata || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        return { success: false, quotaExceeded: true, error: 'Daily email quota exhausted' }
      }

      if (attempt < MAX_SEND_ATTEMPTS && isTransientError(err)) {
        const delayMs = attempt * 1000 // 1s, 2s
        functions.logger.warn(
          `Brevo send failed (attempt ${attempt}/${MAX_SEND_ATTEMPTS}), retrying in ${delayMs}ms:`,
          err
        )
        await sleep(delayMs)
        continue
      }
      break
    }
  }

  const errorMessageFinal = errorMessage(lastError)
  functions.logger.error('Brevo email send failed:', lastError)

  await logEmail({
    to: recipientEmail,
    toName: options.to[0]?.name || null,
    subject: options.subject,
    template: templateTag,
    status: 'failed',
    error: errorMessageFinal,
    metadata: options.metadata || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return { success: false, error: errorMessageFinal }
}

/**
 * Send a single email to one recipient (convenience wrapper)
 */
export async function sendSingleEmail(
  to: EmailRecipient,
  subject: string,
  htmlContent: string,
  textContent?: string,
  tags?: string[],
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail({
    to: [to],
    subject,
    htmlContent,
    textContent,
    tags,
    metadata,
  })
}

/**
 * Bulk-send pre-rendered emails (each recipient can get its own HTML, e.g.
 * personalized unsubscribe links) with rate limiting.
 *
 * Batches are paced to respect Brevo's rate limits; the loop aborts as soon
 * as the daily quota is exhausted and reports the remaining items as
 * `skipped` instead of hammering the API with doomed requests.
 */
export interface RenderedBulkEmail {
  to: EmailRecipient
  subject: string
  html: string
  text?: string
}

export interface BulkSendResult {
  successful: number
  failed: number
  /** Emails NOT attempted because the daily quota ran out mid-send. */
  skipped: number
  total: number
}

export async function sendBulkRenderedEmails(
  items: RenderedBulkEmail[],
  tags?: string[],
  batchSize = 25
): Promise<BulkSendResult> {
  let successful = 0
  let failed = 0
  let skipped = 0
  let processed = 0

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    const results = await Promise.allSettled(
      batch.map((item) =>
        sendEmail({
          to: [item.to],
          subject: item.subject,
          htmlContent: item.html,
          textContent: item.text,
          tags,
        })
      )
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successful++
        } else if (result.value.quotaExceeded) {
          skipped++
        } else {
          failed++
        }
      } else {
        failed++
      }
    }
    processed += batch.length

    // Stop early — no point sending more today once the quota is gone.
    const quota = await getQuotaStatus()
    if (quota.exhausted) {
      skipped += items.length - processed
      break
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await sleep(1000)
    }
  }

  return { successful, failed, skipped, total: items.length }
}

/**
 * Send bulk emails sharing the same content (convenience wrapper kept for
 * the admin "manual send" path).
 */
export async function sendBulkEmails(
  recipients: EmailRecipient[],
  subject: string,
  htmlContent: string,
  textContent?: string,
  tags?: string[],
  batchSize = 25
): Promise<BulkSendResult> {
  return sendBulkRenderedEmails(
    recipients.map((r) => ({ to: r, subject, html: htmlContent, text: textContent })),
    tags,
    batchSize
  )
}