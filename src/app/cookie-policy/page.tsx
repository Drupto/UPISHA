import { PolicyPage, PolicySection, PolicyListItem } from '@/components/policy/PolicyPage'

export default function CookiePolicyPage() {
  return (
    <PolicyPage
      badge="Cookie Policy"
      title="Cookie Policy"
      description="This policy explains what cookies and similar technologies the UP ISHA website uses, what they do, and how you can control or delete them. It works together with our Privacy Policy."
      updated="09 September 2026"
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
            <strong>Consent cookie</strong> — remembers whether you accepted or declined our
            cookie-consent banner, so we don't ask you repeatedly.
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
            <strong>Local storage (auto-save)</strong> — we may store partially-entered form
            data (for example from the Contact or Join forms) in your browser's local storage so
            that your input is not lost if the page reloads. This data never leaves your device
            unless you submit the form.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="3. Third-Party Cookies & Analytics">
        <p>
          We use Google Analytics to understand aggregate website usage (such as the number of
          visitors and the pages they view). Google Analytics sets its own cookies on your device
          when you visit our website. These cookies do not identify you personally.
        </p>
        <p>
          For more information about how Google uses data collected through analytics, please
          see Google's privacy policies at policies.google.com.
        </p>
      </PolicySection>

      <PolicySection title="4. Required vs. Optional Cookies">
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>
            <strong>Strictly necessary cookies</strong> — the session cookie and CSRF cookie are
            required for the correct operation of the website and for account security. They
            cannot be disabled without affecting functionality.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Preference cookies</strong> — the consent cookie respects your choice.
          </PolicyListItem>
          <PolicyListItem>
            <strong>Analytics cookies</strong> — used for site improvement; you can block them
            using your browser settings or the cookie-consent banner.
          </PolicyListItem>
        </ul>
      </PolicySection>

      <PolicySection title="5. How to Control or Delete Cookies">
        <p>
          You can control cookies through your browser settings. Most browsers let you:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <PolicyListItem>Block third-party cookies.</PolicyListItem>
          <PolicyListItem>Delete all cookies when you close the browser.</PolicyListItem>
          <PolicyListItem>View and delete individual cookies for a specific website.</PolicyListItem>
          <PolicyListItem>Browse in private/incognito mode, which deletes cookies when the window closes.</PolicyListItem>
        </ul>
        <p>
          If you disable cookies, some parts of the website (such as staying signed in) may not
          work correctly.
        </p>
        <p>
          To reset your cookie consent choice, you can clear the site's consent cookie or local
          storage entry for upisha.org, and the consent banner will appear again on your next
          visit.
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