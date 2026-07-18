import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, qualification, rciNumber, membershipType, city, message } = body

    if (!fullName || !email || !phone || !qualification || !membershipType || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const member = await db.member.create({
      data: {
        fullName,
        email,
        phone,
        qualification,
        rciNumber: rciNumber || null,
        membershipType,
        city,
        message: message || null,
      },
    })

    return NextResponse.json({ success: true, id: member.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const members = await db.member.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}
