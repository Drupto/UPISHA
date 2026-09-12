import { PolicyPage, PolicySection, PolicyListItem, PolicyNote } from '@/components/policy/PolicyPage'

export default function AuthorGuidelinesPage() {
  return (
    <PolicyPage
      badge="Author Guidelines"
      title="Author Guidelines"
      description="Guidelines for authors submitting to the UP Journal of Speech & Hearing, the official peer-reviewed publication of UP ISHA."
      updated="13 September 2026"
    >
      <PolicySection title="1. About the Journal">
        <p>
          The UP Journal of Speech & Hearing is the official peer-reviewed publication of the Uttar
          Pradesh Speech & Hearing Association (UP ISHA). It publishes original research, case
          studies, clinical reports, and review articles in audiology, speech-language pathology,
          and allied areas.
        </p>
        <p>
          We invite submissions from researchers, clinicians, academicians, and postgraduate
          students working in speech, language, hearing, balance, and swallowing sciences.
        </p>
      </PolicySection>

      <PolicySection title="2. Article Types">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            <strong>Original research article:</strong> up to 4,000 words excluding abstract,
            tables, figures, and references.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Case study / clinical report:</strong> up to 2,500 words describing novel,
            rare, or instructive clinical findings.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Review article:</strong> up to 5,000 words providing a systematic or narrative
            synthesis of the literature.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Short communication / letter to the editor:</strong> up to 1,200 words.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="3. Formatting (APA 7th Edition)">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Prepare the manuscript in A4 size with 1-inch (2.54 cm) margins.</PolicyListItem>
          <PolicyListItem>Use Times New Roman, 12 pt, double-spaced throughout, including references.</PolicyListItem>
          <PolicyListItem>Follow APA 7th edition for in-text citations, references, headings, and tables.</PolicyListItem>
          <PolicyListItem>Number pages consecutively starting from the title page.</PolicyListItem>
          <PolicyListItem>Use SI units for all measurements and define abbreviations at first use.</PolicyListItem>
          <PolicyListItem>Place each table on a separate page with a self-explanatory title; keep figures high-resolution (minimum 300 dpi).</PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="4. Manuscript Structure">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            <strong>Title page:</strong> full title, author names with affiliations, and
            corresponding author contact details.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Abstract:</strong> structured abstract of 200-250 words with 4-6 keywords.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Main text:</strong> Introduction, Methods, Results, Discussion, Conclusion,
            Acknowledgements, Conflict of Interest, Funding, and References.
          </PolicyListItem>
          <PolicyListItem>
            <strong>References:</strong> APA 7th style, listed alphabetically with DOIs verified.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="5. Ethics & Originality">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Submit only original, unpublished work not under review elsewhere.</PolicyListItem>
          <PolicyListItem>Mention ethics committee approval and informed consent for human studies.</PolicyListItem>
          <PolicyListItem>Ensure patient anonymity in text, images, and audiograms.</PolicyListItem>
          <PolicyListItem>Disclose conflicts of interest and funding sources.</PolicyListItem>
        </ul>
        <PolicyNote title="Ethical Responsibility">
          Authors are responsible for data accuracy, proper citation, and compliance with
          applicable ethical requirements.
        </PolicyNote>
      </PolicySection>

      <PolicySection title="6. Peer-Review Process">
        <p>
          All manuscripts undergo editorial screening followed by double-blind peer review by at
          least two reviewers. Decisions include accept, minor revision, major revision, or
          reject. Authors should return revisions with a point-by-point response to reviewers.
        </p>
      </PolicySection>

      <PolicySection title="7. How to Submit">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Submit a single PDF (max 10MB) via the member portal Submit Paper option.</PolicyListItem>
          <PolicyListItem>Or email your manuscript to office@upisha.org with subject line Manuscript Submission.</PolicyListItem>
          <PolicyListItem>Include a cover letter confirming originality.</PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="8. Contact">
        <p>
          For submission queries, write to{' '}
          <a href="mailto:office@upisha.org" className="text-upisha-teal hover:underline">
            office@upisha.org
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  )
}
