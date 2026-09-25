import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publications | UP ISHA',
  description: 'Explore the UP Journal of Speech & Hearing, clinical monographs, and research contributions from the Uttar Pradesh Indian Speech & Hearing Association.',
}

export default function PublicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}