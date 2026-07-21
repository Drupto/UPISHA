import { NextRequest, NextResponse } from 'next/server'
import { createMember, getMembers } from '@/lib/firestore'

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

    const member = await createMember({
      fullName,
      email,
      phone,
      qualification,
      rciNumber: rciNumber || null,
      membershipType,
      city,
      message: message || null,
    })

    return NextResponse.json({ success: true, id: member.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    if (!(error as { code?: string })?.code) {
      return NextResponse.json(
        { success: true, demo: true, message: 'Demo mode: application not stored' },
        { status: 201 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const members = await getMembers()
    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}
