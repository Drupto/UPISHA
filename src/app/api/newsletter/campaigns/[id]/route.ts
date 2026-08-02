import { NextRequest, NextResponse } from 'next/server'
import { updateNewsletterCampaign, deleteNewsletterCampaign } from '@/lib/firestore'
import { newsletterCampaignSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const validated = newsletterCampaignSchema.partial().parse(body)

    // When marking as sent, record sentAt timestamp
    const sentAt = validated.status === 'sent' ? new Date() : undefined

    await updateNewsletterCampaign(id, {
      ...validated,
      title: validated.title ? sanitizeHtml(validated.title) : undefined,
      subject: validated.subject ? sanitizeHtml(validated.subject) : undefined,
      content: validated.content ? sanitizeHtml(validated.content) : undefined,
      sentAt,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Newsletter campaign updated successfully',
    }))
  } catch (err: unknown) {
    console.error('Error updating newsletter campaign:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 }))
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    await deleteNewsletterCampaign(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Newsletter campaign deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting newsletter campaign:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 }))
  }
}
