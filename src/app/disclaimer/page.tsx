import { PolicyPage, PolicySection, PolicyListItem, PolicyNote } from '@/components/policy/PolicyPage'

export default function DisclaimerPage() {
  return (
    <PolicyPage
      badge="Disclaimer"
      title="Disclaimer"
      description="Please read this disclaimer carefully. It clarifies what UP ISHA's website content is - and is not - and the limits of our responsibility for information published on this site."
      updated="09 September 2026"
    >
      <PolicySection title="1. General Disclaimer">
        <p>
          The content on this website is made available for general information and
          professional-awareness purposes only. While we aim to keep the information accurate and
          up to date, UP ISHA does not warrant or guarantee the completeness, correctness, or
          timeliness of the information published here.
        </p>
        <p>
          Nothing on this website is intended to constitute, and nothing on this website should
          be construed as, professional advice for any individual clinical, therapeutic, or
          educational decision.
        </p>
      </PolicySection>

      <PolicySection title="2. No Medical or Professional Advice">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            This website may describe audiology, speech-language pathology, hearing-health, and
            related topics. Such material is educational and is <strong>not</strong> a
            diagnosis, treatment plan, or recommendation for your (or your patient's) specific
            condition.
          </PolicyListItem>
          <PolicyListItem>
            If you or someone you care for has a hearing, speech, or communication concern,
            please consult a qualified audiologist, speech-language pathologist, or physician.
          </PolicyListItem>
          <PolicyListItem>
            Do not rely on this website in an emergency. Contact local emergency services or a
            hospital as appropriate.
          </PolicyListItem>
        </ul>
        <PolicyNote title="Emergency Advice">
          In an emergency, always contact your nearest hospital or emergency services. UP ISHA
          cannot provide emergency medical advice through this website.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="3. Membership & Professional Directory">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            The professional directory lists members who have chosen to be listed. Inclusion in
            the directory does not constitute an endorsement of any individual professional's
            clinical skills, services, or conduct.
          </PolicyListItem>
          <PolicyListItem>
            Members are responsible for the accuracy of the information they provide for their
            listings (such as qualifications, contact details, and RCI registration numbers).
          </PolicyListItem>
          <PolicyListItem>
            We encourage visitors to independently verify a professional's credentials,
            registration status, and suitability before seeking services, and to confirm coverage
            and charges directly with the professional.
          </PolicyListItem>
          <PolicyListItem>
            UP ISHA is not a party to any engagement between a member and a patient, and is not
            liable for the professional services provided by individual members.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="4. Publications & Journal Content">
        <p>
          Articles, research summaries, and other material in our publications and journal are
          provided for information. They do not represent the official position of UP ISHA unless
          expressly stated, and UP ISHA is not responsible for the clinical application of any
          material contained therein.
        </p>
      </PolicySection>

      <PolicySection title="5. External Links">
        <p>
          Our website may contain links to external websites (including payment providers,
          Google Maps, and partner organizations). These links are provided for convenience only.
          UP ISHA does not control, endorse, or take responsibility for the content, accuracy, or
          availability of external websites, and their own terms and privacy policies apply when
          you visit them.
        </p>
      </PolicySection>

      <PolicySection title="6. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, UP ISHA shall not be liable for any loss or
          damage - direct, indirect, or consequential - arising from reliance on information on
          this website, from the unavailability of the website, or from errors or omissions in the
          content. Nothing in this disclaimer limits your rights under applicable Indian law.
        </p>
      </PolicySection>

      <PolicySection title="7. Contact Us">
        <p>
          If you have questions about this disclaimer, or if you believe any content on this site
          is inaccurate and wish to report it, please contact us at{' '}
          <a href="mailto:info@upisha.org" className="text-upisha-teal hover:underline">info@upisha.org</a>.
        </p>
      </PolicySection>
    </PolicyPage>
  )
}