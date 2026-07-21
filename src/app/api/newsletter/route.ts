import { NextRequest, NextResponse } from 'next/server'
import { upsertNewsletterSubscriber, getNewsletterSubscribers } from '@/lib/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const subscriber = await upsertNewsletterSubscriber(email)

    return NextResponse.json({ success: true, id: subscriber.id }, { status: 201 })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    if (!(error as { code?: string })?.code) {
      return NextResponse.json(
        { success: true, demo: true, message: 'Demo mode: subscription not stored' },
        { status: 201 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { subscribers, count } = await getNewsletterSubscribers()
    return NextResponse.json({ subscribers, count })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}
