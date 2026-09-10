import { PolicyPage, PolicySection, PolicyListItem, PolicyNote } from '@/components/policy/PolicyPage'

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      badge="Privacy Policy"
      title="Privacy Policy"
      description="This policy explains how Uttar Pradesh Speech & Hearing Association (UP ISHA) collects, uses, stores, and protects your personal information when you use our website, register for membership, attend webinars, or contact us."
      updated="09 September 2026"
    >
      <PolicySection title="1. Who We Are">
        <p>
          The Uttar Pradesh Speech & Hearing Association (UP ISHA) is a professional body
          representing audiologists and speech-language pathologists in Uttar Pradesh, India.
          Our registered office is located at 110 Raghu Raj Nagar, Patel Nagar, Lucknow -
          226016, Uttar Pradesh, India.
        </p>
        <p>
          For any privacy-related queries, you can reach us at{' '}
          <a href="mailto:office@upisha.org" className="text-upisha-teal hover:underline">office@upisha.org</a>{' '}
          or by writing to the address above.
        </p>
      </PolicySection>

      <PolicySection title="2. Information We Collect">
        <p>We collect the following categories of personal information depending on how you interact with us:</p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            <strong>Contact form:</strong> your name, email address, and the message you send us
            through the Contact section.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Membership application (Apply / Join):</strong> your full name, email, phone
            number, address, professional qualifications, RCI (Rehabilitation Council of India)
            registration number, city, a profile photo, your RCI certificate, and your transaction
            number for renewal.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Newsletter subscription:</strong> your email address when you subscribe to our
            newsletter from the footer or other sign-up forms.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Webinar / Event registration:</strong> your name, email, phone number,
            qualification, and payment details.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Account data:</strong> if you register an account, we store your email,
            encrypted password, and your membership role to secure your session.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Payment receipts:</strong> we generate digital receipts for membership fees,
            webinar fees, and event fees (transaction type, status, amount, and date).
          </PolicyListItem>
          <PolicyListItem>
            <strong>Analytics:</strong> we use Google Analytics to understand aggregate website
            usage patterns. This includes anonymized data such as pages visited and referral
            sources.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Local browser data (auto-save):</strong> when you fill in the contact or Join
            forms, we may locally (in your browser) save your partially-entered information so you
            don't lose it if the page reloads. This data is stored only on your device.
          </PolicyListItem>
        </ul>
      </PolicySection>
<PolicySection title="3. How We Use Your Information">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>To process and manage your membership application and renewals.</PolicyListItem>
          <PolicyListItem>To communicate with you about your membership, webinars, events, and updates you've subscribed to.</PolicyListItem>
          <PolicyListItem>To respond to your enquiries submitted through the contact form.</PolicyListItem>
          <PolicyListItem>To process webinar and event registrations and issue certificates or receipts.</PolicyListItem>
          <PolicyListItem>To maintain the security of your account and of the website.</PolicyListItem>
          <PolicyListItem>To improve our website and services through aggregated, non-identifying usage statistics.</PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="4. Legal Basis & Consent">
        <p>
          We process your personal data only for legitimate purposes connected with the
          functioning of UP ISHA as a professional association, and only to the extent necessary.
          When you provide your details (for example, by submitting a form or registering for an
          event), you consent to our use of those details for the stated purpose. You may withdraw
          your consent at any time by contacting us; subject to applicable law, we will then stop
          processing your data and delete it where required.
        </p>
        <p>
          Your consent to receive our newsletter is optional and separate from your membership.
          You can unsubscribe at any time using the link in our emails, or by writing to us.
        </p>
      </PolicySection>

      <PolicySection title="5. Cookies & Similar Technologies">
        <p>
          We use a small number of cookies and browser storage to make the site work and remember
          your choices. For details, including how to manage them, please see our{' '}
          <a href="/cookie-policy" className="text-upisha-teal hover:underline">Cookie Policy</a>.
        </p>
        <p>In summary, we use:</p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>A consent cookie to remember whether you accepted or declined our cookie banner.</PolicyListItem>
          <PolicyListItem>Session cookies to keep you signed in to your member account (httpOnly, secure).</PolicyListItem>
          <PolicyListItem>A short-lived CSRF token cookie to protect our forms from cross-site request forgery.</PolicyListItem>
          <PolicyListItem>Local storage to autosave partially-filled contact and membership forms on your device.</PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="6. How We Store & Protect Your Data">
        <p>
          Your information is stored securely using industry-standard practices. We use
          cloud-based infrastructure (including Google Firebase services) which is protected with
          transport-layer encryption (HTTPS), rate-limiting on our forms, CSRF protections, and
          strict Content-Security-Policy headers. Passwords are stored only in hashed form.
        </p>
        <p>
          Access to membership information is limited to authorized personnel and to you through
          your secured account. We never store credit/debit card numbers—payment details are
          handled by the payment provider you use.
        </p>
        <p>
          In the event of a data breach that is likely to result in a risk to your rights, we
          will notify you and the relevant authorities in accordance with applicable Indian law.
        </p>
      </PolicySection>
<PolicySection title="7. How Long We Keep Your Data">
        <p>
          We keep your data only for as long as necessary for the purpose for which it was collected:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Membership records are retained while your membership is active and for a reasonable period afterwards for administrative and statutory purposes.</PolicyListItem>
          <PolicyListItem>Newsletter subscriptions are retained until you unsubscribe.</PolicyListItem>
          <PolicyListItem>Contact-form messages are retained as long as needed to respond and resolve your query.</PolicyListItem>
          <PolicyListItem>Financial receipts are retained in accordance with applicable tax and accounting laws.</PolicyListItem>
        </ul>
        <p>
          When the purpose is fulfilled, we delete or anonymize the data unless we are required by
          law to keep it.
        </p>
      </PolicySection>

      <PolicySection title="8. Your Rights Under the DPDP Act, 2023">
        <p>
          Under India's Digital Personal Data Protection Act, 2023 (DPDP Act), you have rights over
          your personal data. You can exercise them by writing to us at{' '}
          <a href="mailto:office@upisha.org" className="text-upisha-teal hover:underline">office@upisha.org</a>.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            <strong>Right to access:</strong> ask for a summary of the personal data we hold about
            you and how it is being processed.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Right to correction:</strong> ask us to correct or update inaccurate or
            incomplete personal data.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Right to erasure:</strong> request deletion of your personal data, subject to
            legal retention requirements.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Right to grievance redressal:</strong> raise a grievance with us, which we
            will address promptly (we aim to respond within 30 days).
          </PolicyListItem>
          <PolicyListItem>
            <strong>Right to nomination:</strong> you may nominate a person to exercise your
            rights on your behalf in the event of your death or incapacity.
          </PolicyListItem>
        </ul>
        <PolicyNote title="Grievance Officer">
          You may direct any privacy-related grievances or complaints to our Grievance Officer /
          Secretary at{' '}
          <a href="mailto:secretary@upisha.org" className="text-upisha-teal underline">
            secretary@upisha.org
          </a>
          . We will acknowledge your complaint promptly and respond in line with applicable law.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="9. Children's Data">
        <p>
          UP ISHA is a professional body for audiologists and speech-language pathologists, and
          our membership is intended for qualified professionals. We do not knowingly collect
          personal data of children. If you believe a child's personal data has been provided to
          us, please contact us so we can delete it without delay.
        </p>
      </PolicySection>

      <PolicySection title="10. Sharing & Third Parties">
        <p>We do not sell your personal information. We share data only with:</p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            Our infrastructure providers (such as Google Firebase for authentication and storage),
            who process data on our behalf under appropriate agreements.
          </PolicyListItem>
          <PolicyListItem>
            Analytics providers (Google Analytics) who receive aggregated, non-identifying usage
            data.
          </PolicyListItem>
          <PolicyListItem>
            Government or law-enforcement authorities, where we are legally required to do so and
            to the extent permitted by law.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our services,
          or in applicable laws and regulations. When we make significant changes, we will update
          the "Last updated" date above and, where practical, notify members by email. Your
          continued use of the website after changes take effect constitutes acceptance of the
          revised policy.
        </p>
      </PolicySection>

      <PolicySection title="12. Contact Us">
        <p>
          If you have any questions about this Privacy Policy or wish to exercise your rights,
          please contact us:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Email: office@upisha.org</PolicyListItem>
          <PolicyListItem>Grievances: secretary@upisha.org</PolicyListItem>
          <PolicyListItem>
            Address: 110 Raghu Raj Nagar, Patel Nagar, Lucknow - 226016, Uttar Pradesh, India
          </PolicyListItem>
        </ul>
      </PolicySection>
    </PolicyPage>
  )
}