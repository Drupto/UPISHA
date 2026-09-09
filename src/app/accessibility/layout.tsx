import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility | UP ISHA',
  description:
    'Our commitment to making the UP ISHA website accessible to everyone, including visitors using assistive technologies.',
}

export default function AccessibilityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}