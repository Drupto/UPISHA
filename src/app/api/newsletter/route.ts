import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    // Upsert to avoid duplicate email errors
    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    })

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
    const [subscribers, countResult] = await Promise.all([
      db.newsletterSubscriber.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.newsletterSubscriber.aggregate({
        _count: { _all: true },
        where: { isActive: true },
      }),
    ])
    return NextResponse.json({ subscribers, count: countResult._count._all })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}
