import { PolicyPage, PolicySection, PolicyListItem } from '@/components/policy/PolicyPage'
import { CookiePreferencesButton } from '@/components/consent/CookiePreferencesButton'

export default function CookiePolicyPage() {
  return (
    <PolicyPage
      badge="Cookie Policy"
      title="Cookie Policy"
      description="This policy explains what cookies and similar technologies the UP ISHA website uses, what they do, and how you can control or delete them. It works together with our Privacy Policy."
      updated="14 November 2026"
    >
      <PolicySection title="1. What Are Cookies?">
        <p>
          Cookies are small text files stored in your browser when you visit a website. They help
          the website remember information about your visit, such as your preferences or login
          status. We also use your browser's local storage for similar purposes.
        </p>
      </PolicySection>

      <PolicySection title="2. Cookies & Similar Technologies We Use">
        <p>We use the following types of cookies and browser storage:</p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            <strong>Consent record (local storage)</strong> — remembers your cookie choice
            (including which optional categories you allowed). It is stored in your browser
            under the key <code>upisha-cookie-consent-v2</code>, is never sent to our servers,
            and stays until you change it or clear your browser storage.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Session cookie</strong> — keeps you signed in to your member account. It is
            flagged as httpOnly and Secure, meaning scripts cannot read it and it is only sent
            over HTTPS.
          </PolicyListItem>
          <PolicyListItem>
            <strong>CSRF protection cookie</strong> — a short-lived token cookie that helps
            protect our forms from cross-site request forgery attacks. It does not contain
            personal information.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Functional local storage</strong> — remembers your theme choice and may
            auto-save partially-entered form data (for example from the Contact or Join forms)
            so your input is not lost if the page reloads. This data stays on your device and is
            never sent to us unless you submit the form.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="3. Third-Party Cookies & Analytics">
        <p>
          We use Google Analytics 4 to understand aggregate website usage (such as the number of
          visitors and the pages they view). Google Analytics is <strong>not loaded at all</strong>{' '}
          until you choose “Accept all” or enable the Analytics category in the cookie
          preferences dialog. If you reject it, no Google Analytics script runs and no{' '}
          <code>_ga</code> cookies are written.
        </p>
        <p>
          When enabled, Google Analytics sets its own first-party cookies (for example{' '}
          <code>_ga</code> and <code>_ga_&lt;container-id&gt;</code>) to distinguish browsers. We
          enable IP anonymization and we do not use advertising, remarketing, or cross-site
          tracking features. If you later withdraw consent, we disable Google Analytics for this
          site and expire the Google Analytics cookies we can access.
        </p>
        <p>
          For more information about how Google uses data collected through analytics, please
          see Google&apos;s privacy policies at policies.google.com.
        </p>
      </PolicySection>

      <PolicySection title="4. Required vs. Optional Cookies">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            <strong>Strictly necessary</strong> — the session cookie, CSRF cookie, consent
            record, and functional storage (theme/form drafts) are required for the website to
            operate correctly and securely. They cannot be switched off in the banner.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Analytics (optional)</strong> — Google Analytics cookies are used only to
            improve the site. They are <strong>off by default</strong> and load only after you
            opt in.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Marketing / advertising</strong> — we do not currently use advertising or
            cross-site marketing cookies.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="5. How to Control or Delete Cookies">
        <p>
          You can change your choice at any time using the button below or the “Cookie settings”
          link in the website footer. You can accept all optional cookies, reject everything
          optional, or allow only the categories you choose.
        </p>
        <div className="pt-1">
          <CookiePreferencesButton />
        </div>
        <p className="pt-2">
          You can also control cookies through your browser settings. Most browsers let you:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Block third-party cookies.</PolicyListItem>
          <PolicyListItem>Delete all cookies when you close the browser.</PolicyListItem>
          <PolicyListItem>View and delete individual cookies for a specific website.</PolicyListItem>
          <PolicyListItem>Browse in private/incognito mode, which deletes cookies when the window closes.</PolicyListItem>
        </ul>
        <p>
          If you disable strictly necessary cookies, some parts of the website (such as staying
          signed in) may not work correctly. Clearing this site&apos;s storage removes your
          consent record, and the banner will ask for your choice again on your next visit.
        </p>
      </PolicySection>

      <PolicySection title="6. Changes to This Policy">
        <p>
          We may update this Cookie Policy from time to time. The latest version will always be
          available on this page with the date of the change shown at the top.
        </p>
      </PolicySection>
    </PolicyPage>
  )
}