import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer | UP ISHA',
  description:
    'Important disclaimers about the content published by the Uttar Pradesh Indian Speech & Hearing Association (UP ISHA), including the professional directory and publications.',
}

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}