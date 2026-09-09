import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | UP ISHA',
  description:
    'The terms and conditions governing your use of the Uttar Pradesh Speech & Hearing Association (UP ISHA) website, membership, webinars, events, and services.',
}

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}