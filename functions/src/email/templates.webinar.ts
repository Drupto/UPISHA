import { wrapTemplate, RenderedEmail } from './layout'

export interface WebinarConfirmationTemplateData {
  fullName: string
  webinarTitle: string
  webinarDate: string
  webinarTime: string
  webinarSpeaker?: string
  webinarDuration?: string
  webinarType?: 'paid' | 'free'
  meetingLink?: string
  registrationStatus?: 'pending' | 'confirmed' | 'rejected'
  transactionNumber?: string
  amount?: number
}

export function renderWebinarConfirmationEmail(data: WebinarConfirmationTemplateData): RenderedEmail {
  const { fullName, webinarTitle, webinarDate, webinarTime, meetingLink, registrationStatus = 'confirmed' } = data

  if (registrationStatus === 'confirmed') {
    const subject = `Webinar Registration Confirmed: ${webinarTitle}`
    const bodyHtml = `
      <h2>Webinar Registration Confirmed ✅</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Thank you for registering for the webinar:</p>
      <table class="details-table">
        <tr><td>Webinar</td><td><strong>${webinarTitle}</strong></td></tr>
        <tr><td>Date</td><td>${webinarDate}</td></tr>
        <tr><td>Time</td><td>${webinarTime}</td></tr>
        ${data.webinarSpeaker ? `<tr><td>Speaker</td><td>${data.webinarSpeaker}</td></tr>` : ''}
        ${data.webinarDuration ? `<tr><td>Duration</td><td>${data.webinarDuration}</td></tr>` : ''}
        ${data.amount ? `<tr><td>Fee</td><td>₹${data.amount}</td></tr>` : ''}
        ${data.transactionNumber ? `<tr><td>Transaction</td><td>${data.transactionNumber}</td></tr>` : ''}
      </table>
      ${meetingLink ? `
        <div class="info-box"><strong>Webinar Meeting Link:</strong><br><a href="${meetingLink}">${meetingLink}</a></div>
        <p>Please save this link. You will also receive a reminder before the webinar.</p>
      ` : `
        <div class="info-box"><strong>Important:</strong> You will receive the webinar meeting link via email closer to the event date.</div>
      `}
      <p style="color:#64748b;">Please join 10 minutes early to ensure smooth connectivity.</p>
      <p>Warm regards,<br><strong>UP ISHA Team</strong></p>
    `
    const text = `Dear ${fullName},\n\nThank you for registering for the webinar "${webinarTitle}".\n\nWebinar Details:\nDate: ${webinarDate}\nTime: ${webinarTime}\n\nYou will receive the webinar link via email.\n\nBest regards,\nUP ISHA Team`
    return { subject, html: wrapTemplate(subject, bodyHtml), text }
  }

  if (registrationStatus === 'pending') {
    const subject = `Webinar Registration Submitted: ${webinarTitle}`
    const bodyHtml = `
      <h2>Registration Submitted 📝</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Your registration for the webinar <strong>${webinarTitle}</strong> has been <span class="badge badge-warning">PENDING</span> admin confirmation.</p>
      <table class="details-table">
        <tr><td>Webinar</td><td><strong>${webinarTitle}</strong></td></tr>
        <tr><td>Date</td><td>${webinarDate}</td></tr>
        <tr><td>Time</td><td>${webinarTime}</td></tr>
        ${data.transactionNumber ? `<tr><td>Transaction</td><td>${data.transactionNumber}</td></tr>` : ''}
      </table>
      <p>Your registration is currently under review. We will send you a confirmation email once it is approved.</p>
      <p>Warm regards,<br><strong>UP ISHA Team</strong></p>
    `
    const text = `Dear ${fullName},\n\nYour webinar registration for "${webinarTitle}" has been submitted.\n\nThe team will review your registration and confirm shortly.\n\nBest regards,\nUP ISHA Team`
    return { subject, html: wrapTemplate(subject, bodyHtml), text }
  }

  // Rejected
  const subject = `Webinar Registration Update: ${webinarTitle}`
  const bodyHtml = `
    <h2>Registration Update</h2>
    <p>Dear <strong>${fullName}</strong>,</p>
    <p>We regret to inform you that your registration for the webinar <strong>${webinarTitle}</strong> was <span class="badge badge-error">NOT CONFIRMED</span>.</p>
    <p>This may be due to payment verification issues or capacity constraints. Please contact us if you believe this is a mistake.</p>
    <p>Warm regards,<br><strong>UP ISHA Team</strong></p>
  `
  const text = `Dear ${fullName},\n\nWe regret to inform you that your registration for "${webinarTitle}" was not confirmed.\n\nBest regards,\nUP ISHA Team`
  return { subject, html: wrapTemplate(subject, bodyHtml), text }
}