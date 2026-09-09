import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | UP ISHA',
  description:
    'The refund and cancellation policy of the Uttar Pradesh Speech & Hearing Association (UP ISHA) for membership fees, webinar registrations, and event fees.',
}

export default function RefundPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}