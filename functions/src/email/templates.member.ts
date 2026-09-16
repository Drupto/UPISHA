import { wrapTemplate, RenderedEmail } from './layout'

export interface MemberApprovalReceiptData {
  receiptNumber: string
  transactionType: string
  description: string
  amount: number
  paidAt: string
}

export interface MemberApprovalTemplateData {
  fullName: string
  status: 'approved' | 'rejected'
  loginUrl?: string
  certificateUrl?: string
  receiptUrl?: string
  reason?: string
  /** When present, the approval email embeds the payment receipt details. */
  receipt?: MemberApprovalReceiptData
}

export function renderMemberApprovalEmail(data: MemberApprovalTemplateData): RenderedEmail {
  const { fullName, status } = data

  if (status === 'approved') {
    const subject = 'Your UP ISHA Membership Has Been Approved'
    const bodyHtml = `
      <h2>Welcome to UP ISHA! 🎉</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>We are thrilled to inform you that your membership application with the <strong>Uttar Pradesh Indian Speech & Hearing Association (UP ISHA)</strong> has been <span class="badge badge-success">APPROVED</span>.</p>
      <div class="alert-success"><strong>Congratulations!</strong> You are now an official member of UP ISHA.</div>
      <p>You can now log in to your member dashboard to access your profile, upcoming webinars, publications, certificates, and receipts.</p>
      ${data.loginUrl ? `<p style="text-align:center;"><a class="button" href="${data.loginUrl}">Login to Your Dashboard</a></p>` : ''}
      ${data.certificateUrl ? `<p style="text-align:center;"><a class="button" href="${data.certificateUrl}" style="background:#1e3a5f;">View Certificate</a></p>` : ''}
      ${data.receiptUrl ? `<p style="text-align:center;"><a class="button" href="${data.receiptUrl}" style="background:#334155;">View Receipt</a></p>` : ''}
      ${data.receipt ? `
        <h3 style="margin-top:28px;">Payment Receipt 🧾</h3>
        <table class="details-table">
          <tr><td>Receipt No.</td><td><code>${data.receipt.receiptNumber}</code></td></tr>
          <tr><td>Description</td><td>${data.receipt.description}</td></tr>
          <tr><td>Amount</td><td><strong>₹${data.receipt.amount}</strong></td></tr>
          <tr><td>Date</td><td>${data.receipt.paidAt}</td></tr>
        </table>
      ` : ''}
      <p style="color:#64748b;">Welcome aboard! We look forward to your active participation in our community.</p>
      <p>Warm regards,<br><strong>UP ISHA Team</strong></p>
    `
    const receiptText = data.receipt
      ? `\n\nPayment Receipt:\nReceipt No: ${data.receipt.receiptNumber}\nDescription: ${data.receipt.description}\nAmount: ₹${data.receipt.amount}\nDate: ${data.receipt.paidAt}`
      : ''
    const text = `Dear ${fullName},\n\nWe are pleased to inform you that your membership application with UP ISHA has been approved.\n\nYou can now log in to your member dashboard and access all member benefits.${receiptText}\n\nWelcome to UP ISHA!\n\nBest regards,\nUP ISHA Team`
    return { subject, html: wrapTemplate(subject, bodyHtml), text }
  }

  const subject = 'Your UP ISHA Membership Application Status'
  const bodyHtml = `
    <h2>Membership Application Status</h2>
    <p>Dear <strong>${fullName}</strong>,</p>
    <p>Thank you for your interest in joining the <strong>Uttar Pradesh Indian Speech & Hearing Association (UP ISHA)</strong>.</p>
    <p>After careful review, we regret to inform you that your membership application was <span class="badge badge-error">NOT APPROVED</span> at this time.</p>
    ${data.reason ? `<div class="info-box"><strong>Reason:</strong> ${data.reason}</div>` : ''}
    <p>This may be due to incomplete documentation or eligibility criteria not being met. You are welcome to re-apply after addressing the concerns.</p>
    <p>If you believe this decision was made in error, please contact us.</p>
    <p>Warm regards,<br><strong>UP ISHA Team</strong></p>
  `
  const text = `Dear ${fullName},\n\nThank you for your interest in joining UP ISHA. After careful review, we regret to inform you that your membership application was not approved at this time.\n\nIf you have any questions, please contact us.\n\nBest regards,\nUP ISHA Team`
  return { subject, html: wrapTemplate(subject, bodyHtml), text }
}