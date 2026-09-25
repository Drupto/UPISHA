import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events | UP ISHA',
  description: 'Stay informed about upcoming conferences, workshops, webinars, and community outreach programs from the Uttar Pradesh Indian Speech & Hearing Association.',
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}