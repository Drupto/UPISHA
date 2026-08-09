import { NextRequest, NextResponse } from 'next/server'
import { updateCertificateTemplate, deleteCertificateTemplate } from '@/lib/firestore'
import { certificateTemplateSchema } from '@/lib/validations'
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
    const validated = certificateTemplateSchema.parse(body)

    await updateCertificateTemplate(id, {
      name: sanitizeHtml(validated.name),
      accountType: validated.accountType,
      title: sanitizeHtml(validated.title),
      subtitle: validated.subtitle ? sanitizeHtml(validated.subtitle) : '',
      textBlocks: validated.textBlocks.map((block) => ({
        ...block,
        content: sanitizeHtml(block.content),
      })),
      footerText: validated.footerText ? sanitizeHtml(validated.footerText) : '',
      logoUrl: validated.logoUrl ?? null,
      signatureUrl: validated.signatureUrl ?? null,
      stampUrl: validated.stampUrl ?? null,
      backgroundUrl: validated.backgroundUrl ?? null,
      borderColor: validated.borderColor,
      accentColor: validated.accentColor,
      fontFamily: validated.fontFamily,
      isActive: validated.isActive,
      isDefault: validated.isDefault,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Certificate template updated successfully',
    }))
  } catch (err: unknown) {
    console.error('Error updating certificate template:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to update certificate template' }, { status: 500 }))
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
    await deleteCertificateTemplate(id)
    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Certificate template deleted successfully',
    }))
  } catch (error) {
    console.error('Error deleting certificate template:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete certificate template' }, { status: 500 }))
  }
}