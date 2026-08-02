import Script from "next/script";

/**
 * Google Analytics 4 Component
 * Only renders when NEXT_PUBLIC_GA_ID is set.
 * Uses Next.js Script component with afterInteractive strategy.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag("js", new Date());
          gtag("config", "${gaId}", {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
