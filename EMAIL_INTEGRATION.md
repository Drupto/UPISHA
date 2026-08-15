# Brevo Email Integration with Firebase Cloud Functions

This document describes how the UP ISHA platform sends emails via **Brevo** (formerly Sendinblue) using **Firebase Cloud Functions**.

## Architecture Overview

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Next.js App        │     │  Firestore           │     │  Brevo (API)    │
│  (API Routes)       │ ──► │  (Data writes)       │ ──► │  Email Sending  │
│                     │     │                      │     │                 │
└─────────────────────┘     └──────────┬───────────┘     └─────────────────┘
                                       │
                                  ┌────▼─────┐
                                  │ Firebase │
                                  │ Cloud    │
                                  │ Functions │
                                  │ (Triggers)│
                                  └──────────┘
```

**How it works:**
1. The Next.js app writes data to Firestore (e.g., new member, webinar registration, contact message)
2. Firebase Cloud Functions listen for these Firestore document changes
3. Cloud Functions render HTML email templates and send via Brevo
4. Email delivery status is logged back to Firestore (`emailLogs` collection)

## Email Triggers

| Firestore Event | Cloud Function | Email Sent |
|---|---|---|
| `members` document created | `sendJoinApplicationEmail` | Join application received confirmation |
| `members` status changes to `approved`/`rejected` | `sendMemberApprovalEmailTrigger` | Member approval/rejection |
| `webinarRegistrations` created | `onWebinarRegistrationCreated` | Webinar registration confirmation |
| `webinarRegistrations` status changes | `onWebinarRegistrationUpdated` | Webinar confirm/reject email |
| `contactMessages` document created | `onContactMessageCreated` | Contact form acknowledgment |
| `newsletterSubscribers` document created | `onNewsletterSubscriberCreated` | Newsletter welcome email |
| `newsletterCampaigns` status → `sent` | `sendNewsletterCampaign` | Bulk newsletter to all active subscribers |
| `receipts` document created | `onReceiptCreated` | Payment receipt email |

## Project Structure

```
functions/
├── package.json          # Dependencies & scripts
├── tsconfig.json          # TypeScript config
├── .env.example           # Environment variable template
└── src/
    ├── index.ts           # Main entry point with all Cloud Functions
    └── email/
        ├── brevo.service.ts      # Brevo API client wrapper
        ├── layout.ts             # Shared HTML email layout & styles
        ├── templates.member.ts   # Member approval/rejection templates
        ├── templates.webinar.ts  # Webinar confirmation templates
        └── templates.misc.ts     # Contact, join, newsletter, receipt templates
```

## Environment Variables

Configure these in the Firebase Console under **Functions → Secrets** or `firebase functions:config:set`:

| Variable | Description |
|---|---|
| `BREVO_API_KEY` | Your Brevo API key (from Brevo Dashboard → SMTP & API) |
| `BREVO_SENDER_EMAIL` | Sender email address (e.g., `noreply@upisha.org`) |
| `BREVO_SENDER_NAME` | Sender display name (e.g., `UP ISHA Team`) |
| `SITE_URL` | Your website URL (used for links in emails, e.g., `https://upisha.org`) |

## Setup & Deployment

### 1. Install Firebase CLI (if not already)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Set project ID
Update `.firebaserc` with your Firebase project ID, or run:
```bash
firebase use <your-project-id>
```

### 4. Install functions dependencies
```bash
cd functions
npm install
```

### 5. Set environment variables
```bash
firebase functions:secrets:set BREVO_API_KEY
# Enter your Brevo API key
firebase functions:secrets:set SITE_URL
# Enter https://upisha.org
```

> **Note:** `BREVO_SENDER_EMAIL` and `BREVO_SENDER_NAME` have defaults in the code
> (`noreply@upisha.org` and `UP ISHA Team`), but should be set for production.

### 6. Deploy
```bash
# Deploy only functions
firebase deploy --only functions

# Deploy functions + Firestore rules
firebase deploy --only functions,firestore
```

### 7. Test locally (optional)
```bash
cd functions
npm run serve
```

## Brevo Setup (One-time)

1. **Create a Brevo account** at [https://www.brevo.com](https://www.brevo.com)
2. **Verify your sender email/domain** in Brevo:
   - Go to **Senders & IPs → Senders**
   - Add your domain or sender email (e.g., `noreply@upisha.org`)
   - Complete the verification process (DNS records)
3. **Get your API key**:
   - Go to **SMTP & API → API Keys**
   - Generate an API key
4. **Free tier limits**: 300 emails/day
5. **(Optional) Create templates** in Brevo dashboard if you want template-based emails

## Adding a New Email Type

1. **Create a template** in `functions/src/email/templates.misc.ts` (or a new file)
2. **Send it from a Cloud Function** in `functions/src/index.ts`
3. **Deploy**: `cd functions && npm run build && cd .. && firebase deploy --only functions`

Example:
```typescript
// In templates.misc.ts
export function renderMyNewEmail(data: {...}): RenderedEmail {
  return {
    subject: '...',
    html: wrapTemplate('Subject', '<p>...</p>'),
    text: '...'
  }
}

// In index.ts
export const onMyTrigger = onDocumentCreated('myCollection/{docId}', async (event) => {
  const data = event.data?.data()
  const rendered = renderMyNewEmail(data)
  await sendSingleEmail(
    { email: data.email, name: data.name },
    rendered.subject,
    rendered.html,
    rendered.text,
    ['my-tag']
  )
})
```

## Troubleshooting

### Emails not sending
1. Check Firebase Function logs: `firebase functions:log`
2. Verify the API key is set: `firebase functions:secrets:list`
3. Check `emailLogs` collection in Firestore for error messages

### Emails going to spam
1. Verify your domain in Brevo (DNS records)
2. Use your own domain for sender email
3. Add SPF/DKIM/DMARC DNS records in Brevo

### Rate limiting
Brevo free tier: **300 emails/day**. For larger volumes, upgrade to a paid Brevo plan or batch send in smaller groups.
</｜DSML｜>
<task_progress>
- [x] Reassess current codebase state
- [x] Check current email implementation (stubs, not imported anywhere)
- [x] Check for Firebase Functions setup (none exists)
- [x] Review new features (certificates, receipts, etc.)
- [x] Identify all email trigger points
- [x] Design updated Brevo integration plan
- [x] Create Firebase project config (firebase.json)
- [x] Create Firebase Cloud Functions package setup
- [x] Create Brevo email service in functions
- [x] Create email templates (layout, member, webinar, misc)
- [x] Create Cloud Function triggers
- [x] Create HTTP callable functions
- [x] Fix collection names to match app's camelCase convention
- [x] Update client email service (src/lib/email.ts)
- [x] Update environment configuration
- [x] Create Firestore rules file
- [x] Create firestore.indexes.json
- [x] Install dependencies for functions
- [x] Fix SendSmtpEmailTo import in brevo.service.ts
- [x] Build functions to verify TypeScript compiles
- [ ] Document the setup
</task_progress>
</｜DSML｜>