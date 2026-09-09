import { PolicyPage, PolicySection, PolicyListItem, PolicyNote } from '@/components/policy/PolicyPage'

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      badge="Refund & Cancellation"
      title="Refund & Cancellation Policy"
      description="This policy explains when and how you may cancel a registration or membership transaction with UP ISHA, and how refunds are processed. Please read it carefully before making a payment."
      updated="09 September 2026"
    >
      <PolicySection title="1. Scope of This Policy">
        <p>This policy applies to payments made on the UP ISHA website for:</p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Membership fees and membership renewals.</PolicyListItem>
          <PolicyListItem>Webinar registration fees.</PolicyListItem>
          <PolicyListItem>Workshop and event registration fees.</PolicyListItem>
        </ul>
        <p>
          If a specific event, webinar, or offer publishes its own refund terms, those terms
          apply to that transaction.
        </p>
      </PolicySection>

      <PolicySection title="2. Membership Fees">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            Membership fees are used to administer your application, verify credentials, and
            provide member benefits. Once your application has been accepted and membership has
            been activated, the fee is generally non-refundable.
          </PolicyListItem>
          <PolicyListItem>
            If we are unable to accept your membership application (for example, because the
            required qualifications or documentation could not be verified), we will refund the
            membership fee in full, net of any payment-processing charges.
          </PolicyListItem>
          <PolicyListItem>
            Renewal fees are non-refundable once your membership period has begun.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="3. Webinar & Event Registrations">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            You may cancel a webinar or event registration and request a refund up to{' '}
            <strong>48 hours before</strong> the scheduled start time of the event.
          </PolicyListItem>
          <PolicyListItem>
            Cancellations made less than 48 hours before the event are non-refundable; however,
            we may, at our discretion, offer a credit toward a future event instead.
          </PolicyListItem>
          <PolicyListItem>
            If UP ISHA cancels or substantially reschedules an event, you will be offered a full
            refund of the registration fee, or a transfer of your registration to the rescheduled
            date, whichever you prefer.
          </PolicyListItem>
        </ul>
        <PolicyNote title="Speaker or Schedule Changes">
          Guest speakers, sessions, or the event format may change due to circumstances beyond
          our control. These changes do not by themselves entitle you to a refund, but we will
          notify registered participants as soon as reasonably possible.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="4. How to Request a Cancellation or Refund">
        <p>To cancel or request a refund, please contact us at:</p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Email: info@upisha.org</PolicyListItem>
          <PolicyListItem>
            Please include your full name, the email used for the transaction, and the receipt or
            transaction number (if available).
          </PolicyListItem>
        </ul>
        <p>
          We will acknowledge your request within 2 business days and process eligible refunds
          within a reasonable period.
        </p>
      </PolicySection>
<PolicySection title="5. Refund Processing">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            Eligible refunds are processed to the original payment method used for the
            transaction.
          </PolicyListItem>
          <PolicyListItem>
            The time taken for the refund to appear in your account depends on the payment
            provider and may take several business days.
          </PolicyListItem>
          <PolicyListItem>
            Payment-processing or gateway charges, if any, may be deducted from the refund
            amount for cancellations initiated by you.
          </PolicyListItem>
          <PolicyListItem>
            Refunds for applications we are unable to accept are processed net of non-recoverable
            payment-processing charges.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="6. Non-Refundable Items">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Membership fees once membership has been activated.</PolicyListItem>
          <PolicyListItem>Registrations cancelled less than 48 hours before the event start time.</PolicyListItem>
          <PolicyListItem>Fees for services already delivered (for example, certificates already issued).</PolicyListItem>
          <PolicyListItem>Donations or voluntary contributions, unless a different arrangement was agreed in writing.</PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="7. Failed or Duplicate Payments">
        <p>
          If you believe you were charged twice, or if a payment failed but funds were debited,
          please contact us within 15 days with your transaction details. We will investigate and
          facilitate a refund of any duplicate or erroneous charge through the payment provider.
        </p>
      </PolicySection>

      <PolicySection title="8. Contact for Refund Queries">
        <p>
          For any question about this policy or a specific refund, contact us at{' '}
          <a href="mailto:info@upisha.org" className="text-upisha-teal hover:underline">info@upisha.org</a>{' '}
          or by post at 110 Raghu Raj Nagar, Patel Nagar, Lucknow - 226016, Uttar Pradesh, India.
        </p>
      </PolicySection>
    </PolicyPage>
  )
}