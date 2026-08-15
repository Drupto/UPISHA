/**
 * Email notification service - Client-side bridge to Firebase Cloud Functions
 *
 * All email sending is handled by Firebase Cloud Functions in the `functions/` directory.
 * The Cloud Functions use Brevo (Sendinblue) to send transactional emails.
 *
 * Firestore triggers automatically send emails for:
 * - Join application received (members collection)
 * - Member approval/rejection (members status change)
 * - Webinar registration confirmation (webinarRegistrations)
 * - Contact form acknowledgment (contactMessages)
 * - Newsletter welcome (newsletterSubscribers)
 * - Newsletter campaigns (newsletterCampaigns marked as sent)
 * - Receipts (receipts)
 */

/**
 * Send member approval email
 * Handled automatically by Firebase Cloud Function `sendMemberApprovalEmailTrigger`
 * when a member's status changes in Firestore.
 */
export async function sendMemberApprovalEmail(
  email: string,
  fullName: string,
  status: 'approved' | 'rejected'
) {
  console.log(`[Email] Member ${status} email queued for: ${email} (${fullName})`)
  return true
}

/**
 * Send webinar registration confirmation email
 * Handled automatically by Firebase Cloud Functions `onWebinarRegistrationCreated`
 * and `onWebinarRegistrationUpdated`.
 */
export async function sendWebinarConfirmationEmail(
  email: string,
  fullName: string,
  webinarTitle: string,
  webinarDate: string,
  webinarTime: string
) {
  console.log(`[Email] Webinar confirmation queued for: ${email} (${fullName}) - ${webinarTitle}`)
  return true
}

/**
 * Send contact form acknowledgment email
 * Handled automatically by Firebase Cloud Function `onContactMessageCreated`.
 */
export async function sendContactAcknowledgmentEmail(email: string, name: string) {
  console.log(`[Email] Contact acknowledgment queued for: ${email} (${name})`)
  return true
}

/**
 * Send newsletter email to a subscriber
 * Handled automatically by Firebase Cloud Function `sendNewsletterCampaign`.
 */
export async function sendNewsletterEmail(
  email: string,
  subject: string,
  content: string
) {
  console.log(`[Email] Newsletter email queued for: ${email} - ${subject}`)
  return true
}

/**
 * Send bulk newsletter emails
 * Handled automatically by Firebase Cloud Function `sendNewsletterCampaign`.
 */
export async function sendBulkNewsletterEmails(
  emails: string[],
  subject: string,
  content: string
) {
  console.log(`[Email] Bulk newsletter queued for ${emails.length} recipients - ${subject}`)
  return { successful: emails.length, failed: 0, total: emails.length }
}