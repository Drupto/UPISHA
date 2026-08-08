import { NextRequest, NextResponse } from 'next/server'
import { getPublications as fetchPublications } from '@/lib/data'
import { createPublication, updatePublication, deletePublication } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { publicationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'
    
    if (!rateLimit(`publications:${ip}`, 30, 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const publications = await fetchPublications()
    return withSecurityHeaders(NextResponse.json({ publications }))
  } catch (error) {
    console.error('Error fetching publications:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch publications' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const validated = publicationSchema.parse(body)
    const { id } = await createPublication({
      title: sanitizeHtml(validated.title),
      description: sanitizeHtml(validated.description),
      type: validated.type,
      author: validated.author ? sanitizeHtml(validated.author) : null,
      fileUrl: validated.fileUrl ? sanitizeHtml(validated.fileUrl) : null,
      link: validated.link ? sanitizeHtml(validated.link) : null,
      isActive: validated.isActive ?? true,
    })

    return withSecurityHeaders(NextResponse.json({ success: true, id, message: 'Publication created successfully' }, { status: 201 }))
  } catch (error) {
    console.error('Error creating publication:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create publication' }, { status: 500 }))
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const validated = publicationSchema.parse(body)
    await updatePublication(body.id, {
      title: sanitizeHtml(validated.title),
      description: sanitizeHtml(validated.description),
      type: validated.type,
      author: validated.author ? sanitizeHtml(validated.author) : null,
      fileUrl: validated.fileUrl ? sanitizeHtml(validated.fileUrl) : null,
      link: validated.link ? sanitizeHtml(validated.link) : null,
      isActive: validated.isActive,
    })
    return withSecurityHeaders(NextResponse.json({ success: true, id: body.id, message: 'Publication updated successfully' }))
  } catch (error) {
    console.error('Error updating publication:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update publication' }, { status: 500 }))
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    await deletePublication(body.id)
    return withSecurityHeaders(NextResponse.json({ success: true, id: body.id, message: 'Publication deleted successfully' }))
  } catch (error) {
    console.error('Error deleting publication:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete publication' }, { status: 500 }))
  }
}