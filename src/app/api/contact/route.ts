import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    })

    return NextResponse.json({ success: true, id: contactMessage.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact message:', error)
    if (!(error as { code?: string })?.code) {
      return NextResponse.json(
        { success: true, demo: true, message: 'Demo mode: message not stored' },
        { status: 201 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
