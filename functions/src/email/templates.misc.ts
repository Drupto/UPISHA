import { wrapTemplate, RenderedEmail } from './layout'

// Contact Acknowledgment
export interface ContactAcknowledgmentTemplateData {
  name: string
  subject: string
  message: string
  ticketNumber?: string
}

export function renderContactAcknowledgmentEmail(data: ContactAcknowledgmentTemplateData): RenderedEmail {
  const subject = 'We received your message - UP ISHA'
  const bodyHtml = `
    <h2>Message Received 📬</h2>
    <p>Dear <strong>${data.name}</strong>,</p>
    <p>Thank you for contacting <strong>UP ISHA</strong>. We have received your message and will get back to you within 48 hours.</p>
    <table class="details-table">
      <tr><td>Subject</td><td>${data.subject}</td></tr>
      ${data.ticketNumber ? `<tr><td>Reference #</td><td><code>${data.ticketNumber}</code></td></tr>` : ''}
      <tr><td>Message</td><td style="white-space: pre-line;">${data.message}</td></tr>
    </table>
    <div class="info-box"><strong>Please save your reference number</strong> for any follow-up queries.</div>
    <p>Best regards,<br><strong>UP ISHA Team</strong></p>
  `
  const text = `Dear ${data.name},\n\nThank you for contacting UP ISHA. We have received your message and will get back to you within 48 hours.\n\nBest regards,\nUP ISHA Team`
  return { subject, html: wrapTemplate(subject, bodyHtml), text }
}

// Join Form Confirmation
export interface JoinFormConfirmationTemplateData {
  fullName: string
  membershipType: string
  phone: string
  city: string
  qualification: string
  transactionNumber?: string
}

export function renderJoinFormConfirmationEmail(data: JoinFormConfirmationTemplateData): RenderedEmail {
  const subject = 'Your UP ISHA Membership Application Received'
  const membershipLabels: Record<string, string> = {
    life: 'Life Membership',
    annual: 'Annual Membership',
    student: 'Student Membership',
  }
  const membershipLabel = membershipLabels[data.membershipType] || data.membershipType

  const bodyHtml = `
    <h2>Application Received ✅</h2>
    <p>Dear <strong>${data.fullName}</strong>,</p>
    <p>Thank you for applying to join the <strong>Uttar Pradesh Indian Speech & Hearing Association (UP ISHA)</strong>.</p>
    <p>We have received your membership application. Here is a summary:</p>
    <table class="details-table">
      <tr><td>Name</td><td>${data.fullName}</td></tr>
      <tr><td>Membership</td><td>${membershipLabel}</td></tr>
      <tr><td>Phone</td><td>${data.phone}</td></tr>
      <tr><td>City</td><td>${data.city}</td></tr>
      <tr><td>Qualification</td><td>${data.qualification}</td></tr>
      ${data.transactionNumber ? `<tr><td>Transaction</td><td>${data.transactionNumber}</td></tr>` : ''}
    </table>
    <div class="info-box"><strong>Next Steps:</strong> Our team will review your application and verify your details. You will receive an approval confirmation email once your membership is activated.</div>
    <p>Warm regards,<br><strong>UP ISHA Team</strong></p>
  `
  const text = `Dear ${data.fullName},\n\nThank you for applying to join UP ISHA.\n\nYour membership application has been received. Our team will review it and confirm your membership shortly.\n\nBest regards,\nUP ISHA Team`
  return { subject, html: wrapHtml(subject, bodyHtml), text }
}

// Receipt
export interface MembershipReceiptEmailData {
  fullName: string
  receiptNumber: string
  amount: number
  transactionType: string
  description: string
  paidAt: string
  receiptUrl?: string
}

export function renderReceiptEmail(data: MembershipReceiptEmailData): RenderedEmail {
  const subject = `Payment Receipt: ${data.receiptNumber}`
  const bodyHtml = `
    <h2>Payment Receipt 🧾</h2>
    <p>Dear <strong>${data.fullName}</strong>,</p>
    <p>We are providing the receipt for your recent transaction with UP ISHA.</p>
    <table class="details-table">
      <tr><td>Receipt #</td><td><code>${data.receiptNumber}</code></td></tr>
      <tr><td>Type</td><td>${data.transactionType}</td></tr>
      <tr><td>Description</td><td>${data.description}</td></tr>
      <tr><td>Amount</td><td><strong>₹${data.amount}</strong></td></tr>
      <tr><td>Date</td><td>${data.paidAt}</td></tr>
    </table>
    ${data.receiptUrl ? `<p style="text-align:center;"><a class="button" href="${data.receiptUrl}">Download Receipt</a></p>` : ''}
    <p>Thank you for your support!</p>
    <p>Warm regards,<br><strong>UP ISHA Team</strong></p>
  `
  const text = `Dear ${data.fullName},\n\nYour payment receipt (${data.receiptNumber}) is attached.\n\nAmount: ₹${data.amount}\n\nBest regards,\nUP ISHA Team`
  return { subject, html: wrapHtml(subject, bodyHtml), text }
}

// Newsletter Welcome
export function renderNewsletterWelcomeEmail(data: { email: string }): RenderedEmail {
  const subject = 'Welcome to UP ISHA Newsletter! 🎉'
  const bodyHtml = `
    <h2>Welcome to UP ISHA Newsletter! 🎉</h2>
    <p>Hello,</p>
    <p>You've successfully subscribed to the <strong>UP ISHA Newsletter</strong> at <code>${data.email}</code>.</p>
    <p>You'll now receive updates about:</p>
    <ul>
      <li>💡 Upcoming webinars and workshops</li>
      <li>📢 Announcements from UP ISHA</li>
      <li>🎓 Professional development opportunities</li>
      <li>📚 Publications & resources</li>
    </ul>
    <div class="info-box">To ensure you see these emails, please add <strong>${process.env.BREVO_SENDER_EMAIL || 'noreply@upisha.org'}</strong> to your contacts.</div>
    <p>Warm regards,<br><strong>UP ISHA Team</strong></p>
  `
  const text = `Welcome to UP ISHA Newsletter!\n\nYou've successfully subscribed at ${data.email}.\n\nBest regards,\nUP ISHA Team`
  return { subject, html: wrapHtml(subject, bodyHtml), text }
}

// Newsletter Content
export function renderNewsletterContent(data: {
  email: string
  fullName?: string
  content: string
  subject: string
  unsubscribeUrl?: string
}): RenderedEmail {
  const greeting = data.fullName ? `Dear <strong>${data.fullName}</strong>,` : 'Dear subscriber,'
  const bodyHtml = `
    <h2>${data.subject}</h2>
    <p>${greeting}</p>
    <div style="font-size:14px; line-height:1.7; color:#334155;">${data.content}</div>
    <p style="color:#64748b; font-size:12px;">You are receiving this because you subscribed to UP ISHA newsletter.</p>
    ${data.unsubscribeUrl ? `<p style="text-align:center;"><a href="${data.unsubscribeUrl}" style="color:#0d9488; font-size:12px;">Unsubscribe</a></p>` : ''}
  `
  return {
    subject: data.subject,
    html: wrapHtml(data.subject, bodyHtml),
    text: `Dear subscriber,\n\n${data.content}`,
  }
}

// Helper: wrapHtml is local alias since wrapTemplate is imported
function wrapHtml(subject: string, bodyHtml: string, unsubscribeLink?: string): string {
  return wrapTemplate(subject, bodyHtml, unsubscribeLink)
}