import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { TransactionalEmailsApi, SendSmtpEmail, SendSmtpEmailToInner } from '@getbrevo/brevo'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

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
  status: 'sent' | 'failed' | 'queued'
  messageId?: string | null
  error?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: admin.firestore.FieldValue
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
 * Send a transactional email via Brevo
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getBrevoClient()

  const sender = options.sender ?? {
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@upisha.org',
    name: process.env.BREVO_SENDER_NAME || 'UP ISHA Team',
  }

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

  try {
    const result = await client.sendTransacEmail(sendSmtpEmail)
    const messageId = result.body?.messageId || null

    // Log success
    await logEmail({
      to: options.to[0]?.email || '',
      toName: options.to[0]?.name || null,
      subject: options.subject,
      template: options.tags?.[0] || 'transactional',
      status: 'sent',
      messageId,
      metadata: options.metadata || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { success: true, messageId: messageId || undefined }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error sending email'
    functions.logger.error('Brevo email send failed:', err)

    // Log failure
    await logEmail({
      to: options.to[0]?.email || '',
      toName: options.to[0]?.name || null,
      subject: options.subject,
      template: options.tags?.[0] || 'transactional',
      status: 'failed',
      error: errorMessage,
      metadata: options.metadata || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { success: false, error: errorMessage }
  }
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
 * Send bulk emails with rate limiting (Brevo free tier: 300/day)
 * Processes in batches to avoid hitting rate limits
 */
export async function sendBulkEmails(
  recipients: EmailRecipient[],
  subject: string,
  htmlContent: string,
  textContent?: string,
  tags?: string[],
  batchSize = 50
): Promise<{ successful: number; failed: number; total: number }> {
  let successful = 0
  let failed = 0

  // Process in batches to respect rate limits
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map((recipient) =>
        sendSingleEmail(recipient, subject, htmlContent, textContent, tags)
      )
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        successful++
      } else {
        failed++
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return { successful, failed, total: recipients.length }
}