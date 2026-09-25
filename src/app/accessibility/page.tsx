import { PolicyPage, PolicySection, PolicyListItem, PolicyNote } from '@/components/policy/PolicyPage'

export default function AccessibilityPage() {
  return (
    <PolicyPage
      badge="Accessibility"
      title="Accessibility Statement"
      description="UP ISHA is committed to making this website accessible to everyone, including visitors with disabilities and those using assistive technologies."
      updated="09 September 2026"
    >
      <PolicySection title="1. Our Commitment">
        <p>
          The Uttar Pradesh Indian Speech &amp; Hearing Association (UP ISHA) believes that information
          about hearing and communication health should be available to everyone. We aim to conform
          to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>, and we
          design new features with accessibility in mind from the start.
        </p>
        <PolicyNote title="Commitment">
          We treat accessibility as an ongoing process, not a one-time task. As the site evolves, we
          continue to test and improve its accessibility.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="2. Accessibility Features on This Site">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            <strong>Keyboard navigation</strong> — all interactive elements (menus, forms, buttons,
            carousels) can be reached and operated using the keyboard alone, with visible focus
            indicators.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Keyboard shortcuts</strong> — quick navigation shortcuts (e.g., menu, search,
            and theme commands) are available throughout the site.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Dark mode</strong> — a high-contrast dark theme can be enabled from the header
            and is remembered between visits.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Semantic HTML &amp; ARIA labels</strong> — pages use landmarks, headings, and
            descriptive <em>aria-label</em>s so screen readers can navigate content meaningfully.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Alternative text</strong> — meaningful images, including photographs of
            office bearers and event galleries, carry descriptive alt text.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Reduced motion</strong> — animations respect the operating-system &ldquo;reduce
            motion&rdquo; preference where supported.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Responsive text</strong> — layouts adapt to different screen sizes, and text
            remains legible when the browser zoom is increased up to 200%.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="3. Known Limitations">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            Some older PDF documents (e.g., past journals or forms) may not be fully tagged for
            screen readers. We are progressively remediating these; contact us if you need a
            document in an alternative format.
          </PolicyListItem>
          <PolicyListItem>
            The embedded OpenStreetMap in the contact section is a third-party component whose
            internal accessibility we do not control; a text address and a &ldquo;Get
            Directions&rdquo; link are always provided alongside it.
          </PolicyListItem>
          <PolicyListItem>
            A small number of third-party embeds or social links may not yet meet the same standard.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="4. Feedback">
        <p>
          We welcome your feedback on the accessibility of this website. If you encounter any
          barrier — a page that is hard to navigate with a screen reader, missing captions, poor
          contrast, or anything else — please let us know at{' '}
          <a href="mailto:office@upisha.org" className="text-upisha-teal hover:underline">
            office@upisha.org
          </a>
          , and we will aim to respond within 5 working days and to resolve confirmed issues as
          quickly as reasonably possible.
        </p>
      </PolicySection>
    </PolicyPage>
  )
}