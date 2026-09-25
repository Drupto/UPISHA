import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | UP ISHA',
  description:
    'How the Uttar Pradesh Indian Speech & Hearing Association (UP ISHA) collects, uses, and protects your personal data, and your rights under India\'s Digital Personal Data Protection Act, 2023.',
}

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}