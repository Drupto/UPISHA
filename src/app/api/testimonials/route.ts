import { NextRequest, NextResponse } from 'next/server'
import { getTestimonials as fetchTestimonials } from '@/lib/data'
import { createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, rateLimit, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'
    
    if (!rateLimit(`testimonials:${ip}`, 30, 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const testimonials = await fetchTestimonials()
    return withSecurityHeaders(NextResponse.json({ testimonials }))
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json()
    const { id } = await createTestimonial({
      name: sanitizeHtml(body.name),
      role: sanitizeHtml(body.role),
      content: sanitizeHtml(body.content),
      rating: body.rating,
      isActive: body.isActive ?? true,
    })

    return withSecurityHeaders(NextResponse.json({ success: true, id, message: 'Testimonial created successfully' }, { status: 201 }))
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 }))
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json()
    await updateTestimonial(body.id, {
      name: sanitizeHtml(body.name),
      role: sanitizeHtml(body.role),
      content: sanitizeHtml(body.content),
      rating: body.rating,
      isActive: body.isActive,
    })
    return withSecurityHeaders(NextResponse.json({ success: true, id: body.id, message: 'Testimonial updated successfully' }))
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 }))
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json()
    await deleteTestimonial(body.id)
    return withSecurityHeaders(NextResponse.json({ success: true, id: body.id, message: 'Testimonial deleted successfully' }))
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 }))
  }
}
