import { NextRequest, NextResponse } from 'next/server'
import { uploadDataUrl } from '@/lib/storage'
import { withSecurityHeaders, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) {
      return withSecurityHeaders(auth)
    }

    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'

    if (!rateLimit(`upload:${ip}`, 10, 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const body = await request.json()
    const { dataUrl, path } = body

    if (!dataUrl || !path) {
      return withSecurityHeaders(NextResponse.json({ error: 'Missing required fields: dataUrl and path' }, { status: 400 }))
    }

    const downloadUrl = await uploadDataUrl(dataUrl, path)

    return withSecurityHeaders(NextResponse.json({ url: downloadUrl }))
  } catch (error) {
    console.error('Error uploading image:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to upload image' }, { status: 500 }))
  }
}