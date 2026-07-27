import { NextResponse } from 'next/server'
import { getProfessionals } from '@/lib/data'

export async function GET() {
  try {
    const professionals = await getProfessionals()
    return NextResponse.json({ professionals })
  } catch (error) {
    console.error('Error fetching professionals:', error)
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 })
  }
}
