/**
 * Shared email layout and styles for UP ISHA
 */
export const EMAIL_STYLES = `
  body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
  .header { background-color: #1e3a5f; padding: 32px 24px; text-align: center; }
  .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; }
  .header p { margin: 8px 0 0; color: #b8d4e8; font-size: 14px; }
  .content { padding: 32px 24px; color: #334155; }
  .content h2 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; }
  .content p { margin: 0 0 16px; line-height: 1.6; font-size: 14px; }
  .details-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .details-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; vertical-align: top; }
  .details-table td:first-child { font-weight: 600; color: #1e3a5f; width: 35%; }
  .details-table tr:last-child td { border-bottom: none; }
  .button { display: inline-block; padding: 12px 28px; background: #0d9488; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 8px 0; }
  .info-box { background-color: #f0fafc; border-left: 4px solid #0ea5e9; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #0c4a6e; }
  .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #64748b; }
  .footer a { color: #0d9488; text-decoration: none; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
  .badge-success { background-color: #dcfce7; color: #166534; }
  .badge-warning { background-color: #fef3c7; color: #92400e; }
  .badge-error { background-color: #fee2e2; color: #991b1b; }
  .alert-success { background-color: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 14px; }
`

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export function wrapTemplate(title: string, bodyHtml: string, unsubscribeLink?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>UP ISHA</h1><p>Uttar Pradesh Indian Speech & Hearing Association</p></div>
    <div class="content">${bodyHtml}</div>
    <div class="footer">
      <p>UP ISHA - Uttar Pradesh Indian Speech & Hearing Association</p>
      <p>You received this email because you're registered with UP ISHA.</p>
      ${unsubscribeLink ? `<p><a href="${unsubscribeLink}">Unsubscribe</a></p>` : ''}
    </div>
  </div>
</body>
</html>`
}