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
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ subscribers })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}
