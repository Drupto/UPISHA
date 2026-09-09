import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | UP ISHA',
  description:
    'How the UP ISHA website uses cookies and similar technologies, what they do, and how you can control or delete them.',
}

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}