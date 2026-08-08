import { NextRequest, NextResponse } from 'next/server'
import { getGalleryImages as fetchGalleryImages } from '@/lib/data'
import { createGalleryImage, updateGalleryImage, deleteGalleryImage } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'
    
    if (!rateLimit(`gallery:${ip}`, 30, 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const images = await fetchGalleryImages()
    return withSecurityHeaders(NextResponse.json({ images }))
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const { id } = await createGalleryImage({
      src: sanitizeHtml(body.src),
      title: sanitizeHtml(body.title),
      category: sanitizeHtml(body.category),
      isActive: body.isActive ?? true,
    })

    return withSecurityHeaders(NextResponse.json({ success: true, id, message: 'Gallery image created successfully' }, { status: 201 }))
  } catch (error) {
    console.error('Error creating gallery image:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 }))
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    await updateGalleryImage(body.id, {
      src: sanitizeHtml(body.src),
      title: sanitizeHtml(body.title),
      category: sanitizeHtml(body.category),
      isActive: body.isActive,
    })
    return withSecurityHeaders(NextResponse.json({ success: true, id: body.id, message: 'Gallery image updated successfully' }))
  } catch (error) {
    console.error('Error updating gallery image:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 }))
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    await deleteGalleryImage(body.id)
    return withSecurityHeaders(NextResponse.json({ success: true, id: body.id, message: 'Gallery image deleted successfully' }))
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 }))
  }
}