import { PolicyPage, PolicySection, PolicyListItem, PolicyNote } from '@/components/policy/PolicyPage'

export default function TermsOfServicePage() {
  return (
    <PolicyPage
      badge="Terms of Service"
      title="Terms of Service"
      description="These terms govern your use of the UP ISHA website, including membership, webinars, events, and other services. By using this website, you agree to these terms."
      updated="09 September 2026"
    >
      <PolicySection title="1. Acceptance of These Terms">
        <p>
          By accessing or using the UP ISHA website (upisha.org) or any of our services, you
          agree to be bound by these Terms of Service. If you do not agree with any part of these
          terms, please do not use our website or services.
        </p>
        <p>
          These terms apply to all visitors, members, applicants, and anyone who registers for or
          attends our webinars, workshops, events, or uses our publications.
        </p>
      </PolicySection>

      <PolicySection title="2. About UP ISHA & Our Services">
        <p>
          The Uttar Pradesh Speech & Hearing Association (UP ISHA) is a professional association
          of audiologists and speech-language pathologists in Uttar Pradesh, India. We provide:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Membership for qualified professionals and their renewals.</PolicyListItem>
          <PolicyListItem>Continuing-education webinars, workshops, and events.</PolicyListItem>
          <PolicyListItem>A professional directory and network for members.</PolicyListItem>
          <PolicyListItem>Publications, including a journal and clinical monographs.</PolicyListItem>
          <PolicyListItem>News, announcements, and newsletters for the speech-and-hearing community.</PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="3. Eligibility & Membership">
        <p>
          Membership in UP ISHA is open to professionals qualified in audiology,
          speech-language pathology, and related disciplines, in accordance with our eligibility
          criteria and applicable regulations (including, where relevant, registration with the
          Rehabilitation Council of India, RCI).
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            You must provide accurate and complete information in your membership application.
            Knowingly providing false information is grounds for rejection or termination of
            membership.
          </PolicyListItem>
          <PolicyListItem>
            Membership is granted at the sole discretion of UP ISHA, subject to verification of
            your qualifications and documentation.
          </PolicyListItem>
          <PolicyListItem>
            We may ask you to verify your identity, professional credentials, or registration
            status before approving an application.
          </PolicyListItem>
        </ul>
        <PolicyNote title="Professional Verification">
          Listing in our professional directory and access to member benefits may depend on
          verification of your professional credentials. We rely on the information you provide
          and records available to us; we are not responsible for the accuracy of your underlying
          credentials.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="4. Accounts & Account Security">
        <p>
          Some services (such as the member dashboard) require you to create an account. When
          you do so, you agree to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Keep your login credentials (email and password) confidential.</PolicyListItem>
          <PolicyListItem>Notify us immediately if you believe your account has been compromised.</PolicyListItem>
          <PolicyListItem>Not share your account with others in a way that violates these terms.</PolicyListItem>
          <PolicyListItem>Provide accurate registration information.</PolicyListItem>
        </ul>
        <p>
          You are responsible for all activity that occurs under your account. UP ISHA is not
          liable for any loss or damage arising from unauthorized use of your account caused by
          your failure to keep your credentials secure.
        </p>
      </PolicySection>

      <PolicySection title="5. Fees, Payments & Renewals">
        <p>
          Membership fees, webinar fees, and event fees, where applicable, are published on our
          website and communicated to you before you complete a payment. By submitting a payment,
          you agree to pay the applicable fee.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            We provide digital receipts for successful transactions. Please retain them for your
            records.
          </PolicyListItem>
          <PolicyListItem>
            Membership renewals are subject to the renewal terms communicated at the time of
            renewal.
          </PolicyListItem>
          <PolicyListItem>
            The processing of your payment is subject to the payment provider's terms. We do not
            store your card details on our servers.
          </PolicyListItem>
          <PolicyListItem>
<PolicySection title="6. Acceptable Use">
        <p>When using our website and services, you agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Post or transmit unlawful, defamatory, or discriminatory content.</PolicyListItem>
          <PolicyListItem>Attempt to gain unauthorized access to any part of the website, other users' accounts, or our systems.</PolicyListItem>
          <PolicyListItem>Use automated tools or scripts to scrape or harvest data from the website.</PolicyListItem>
          <PolicyListItem>Use our directory or platform to send spam or unsolicited commercial messages.</PolicyListItem>
          <PolicyListItem>Misrepresent your identity, qualifications, or professional credentials.</PolicyListItem>
          <PolicyListItem>Interfere with the availability or security of the website.</PolicyListItem>
        </ul>
        <p>
          We reserve the right to remove content and to suspend or terminate accounts that
          violate these standards.
        </p>
      </PolicySection>

      <PolicySection title="7. Intellectual Property">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            All content on this website (text, graphics, logos, images, publications, and other
            materials) belongs to UP ISHA or its licensors, and is protected by applicable
            intellectual-property laws.
          </PolicyListItem>
          <PolicyListItem>
            You may not reproduce, distribute, or commercially exploit our publications, journal
            content, logo, or other proprietary materials without prior written permission.
          </PolicyListItem>
          <PolicyListItem>
            Individual members retain ownership of the content they contributed (such as profile
            information), subject to a license for us to display it in connection with the
            association's activities.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="8. Events, Webinars & Certificates">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            Registrations for webinars and events are subject to availability and the specific
            terms published for each event.
          </PolicyListItem>
          <PolicyListItem>
            Certificates of participation or attendance are issued at our discretion based on
            your verified participation and completion of any required criteria.
          </PolicyListItem>
          <PolicyListItem>
            The schedule, speakers, or format of an event may change due to circumstances beyond
            our control. We will endeavor to notify registered participants of significant
            changes in advance.
          </PolicyListItem>
          <PolicyListItem>
            Unless otherwise stated, event content is provided for informational and
            professional-development purposes and may not be recorded or redistributed without
            permission.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="9. Professional & Medical Disclaimer">
        <p>
          This website may contain educational and informational material about audiology,
          speech-language pathology, and related topics. It is provided for general professional
          information only and does <strong>not</strong> constitute medical advice, a diagnosis,
          treatment, or a professional recommendation for any specific clinical situation.
        </p>
        <p>
          Always consult a qualified professional for advice specific to you, your family, or
          your patients. See also our full{' '}
          <a href="/disclaimer" className="text-upisha-teal hover:underline">Disclaimer</a>.
        </p>
      </PolicySection>

      <PolicySection title="10. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, UP ISHA will not be liable for any
          direct, indirect, incidental, consequential, or special damages arising from your use
          of the website or services, including (but not limited to) temporary unavailability of
          the site, errors in published content, or reliance on member-provided information.
        </p>
        <p>
          Nothing in these terms limits your statutory rights under Indian consumer-protection or
          data-protection law.
        </p>
      </PolicySection>
            For details on cancellations and refunds, please refer to our{' '}
            <a href="/refund-policy" className="text-upisha-teal hover:underline">Refund & Cancellation Policy</a>.
          </PolicyListItem>
        </ul>
      </PolicySection>
<PolicySection title="11. Indemnification">
        <p>
          You agree to indemnify and hold harmless UP ISHA, its officers, and its authorized
          representatives from and against any claims, damages, losses, or expenses arising out
          of your breach of these terms, your unlawful use of the website, or your provision of
          false or misleading information, to the extent permitted by law.
        </p>
      </PolicySection>

      <PolicySection title="12. Suspension & Termination">
        <p>
          We may suspend or terminate your account or membership if you breach these terms,
          provide false information, engage in unlawful or abusive conduct, or if we are otherwise
          required to do so. Where practical, we will inform you of the reason for the action.
        </p>
        <p>
          You may terminate your membership at any time by contacting us. Termination does not
          affect fees already paid, which remain subject to our Refund & Cancellation Policy.
        </p>
      </PolicySection>

      <PolicySection title="13. Governing Law & Jurisdiction">
        <p>
          These terms are governed by the laws of India. Any disputes arising out of or in
          connection with these terms or your use of the website shall be subject to the exclusive
          jurisdiction of the courts of Lucknow, Uttar Pradesh, India.
        </p>
      </PolicySection>

      <PolicySection title="14. Grievance Redressal">
        <p>
          If you have a grievance or complaint about our website or services, please contact us at{' '}
          <a href="mailto:info@upisha.org" className="text-upisha-teal hover:underline">info@upisha.org</a>. We
          aim to acknowledge and respond to grievances in accordance with applicable Indian law.
        </p>
        <PolicyNote title="Grievance Officer">
          For grievances relating to privacy or user data, you may contact our Grievance Officer /
          Secretary at{' '}
          <a href="mailto:secretary@upisha.org" className="text-upisha-teal underline">
            secretary@upisha.org
          </a>
          .
        </PolicyNote>
      </PolicySection>

      <PolicySection title="15. Changes to These Terms">
        <p>
          We may update these Terms of Service from time to time. The latest version will always
          be available on this page, and the "Last updated" date above will reflect the most
          recent change. Continued use of the website after changes take effect constitutes
          acceptance of the revised terms.
        </p>
      </PolicySection>
    </PolicyPage>
  )
}