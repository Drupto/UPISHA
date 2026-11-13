'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { useCookieConsent } from '@/lib/hooks/useCookieConsent'

/**
 * Google Analytics 4 — consent gated.
 *
 * Nothing is loaded (and no _ga cookies are written) until the visitor opts in
 * to the "analytics" category. If consent is withdrawn later, tracking is
 * disabled via the official ga-disable-<id> flag and any GA cookies are
 * expired. Strictly necessary site functionality is unaffected.
 */
const GA_COOKIE_PATTERN = /^(_ga|_gid|_gat)/

function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return

  const cookieNames = document.cookie
    .split(';')
    .map((part) => part.split('=')[0]?.trim())
    .filter((name): name is string => Boolean(name) && GA_COOKIE_PATTERN.test(name))

  const host = window.location.hostname
  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; path=/`
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${host}`
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${host}`
  }
}

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const { consent, isLoaded } = useCookieConsent()
  const analyticsAllowed = isLoaded && consent?.categories.analytics === true

  // Toggle GA's official opt-out flag and remove first-party GA cookies when
  // consent is absent or withdrawn. Runs even before any script is loaded.
  useEffect(() => {
    if (!gaId) return

    const w = window as unknown as Record<string, unknown>
    w[`ga-disable-${gaId}`] = !analyticsAllowed

    if (isLoaded && !analyticsAllowed) {
      clearAnalyticsCookies()
    }
  }, [gaId, isLoaded, analyticsAllowed])

  if (!gaId || !analyticsAllowed) return null

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
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            page_path: window.location.pathname
          });
        `}
      </Script>
    </>
  )
}

