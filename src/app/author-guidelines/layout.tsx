import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Author Guidelines | UP ISHA',
  description: 'Author guidelines for submitting original research, case studies, and reviews to the UP Journal of Speech & Hearing.',
}

export default function AuthorGuidelinesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
