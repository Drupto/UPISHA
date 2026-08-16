import { NextRequest, NextResponse } from 'next/server'
import { updateCertificateTemplate, deleteCertificateTemplate, getCertificateTemplateById, setDefaultCertificateTemplate } from '@/lib/firestore'
import { certificateTemplateSchema, enforceBodySizeLimit } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimitStrict, getClientIp } from '@/lib/firestore-rate-limit'
import { logApiRequest } from '@/lib/request-logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  // Reject oversized request bodies
  if (!enforceBodySizeLimit(request.headers)) {
    return withSecurityHeaders(NextResponse.json({ error: 'Request body too large' }, { status: 413 }))
  }

  const ip = getClientIp(request.headers)

  try {
    const rate = await checkRateLimitStrict(`cert-template:update:${ip}:${admin.uid}`, 30, 60 * 60 * 1000)
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    // Verify the template exists before applying changes
    const existing = await getCertificateTemplateById(id)
    if (!existing) {
      return withSecurityHeaders(NextResponse.json({ error: 'Template not found' }, { status: 404 }))
    }

    const body = await request.json()
    const validated = certificateTemplateSchema.parse(body)

    await updateCertificateTemplate(id, {
      name: sanitizeHtml(validated.name),
      accountType: validated.accountType,
      category: validated.category,
      title: sanitizeHtml(validated.title),
      subtitle: validated.subtitle ? sanitizeHtml(validated.subtitle) : '',
      titleFont: validated.titleFont,
      subtitleFont: validated.subtitleFont,
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
      isDefault: false, // Enforce uniqueness via setDefaultCertificateTemplate below
      updatedBy: admin.uid,
    })

    // If this template should be the default, atomically unset any other defaults
    if (validated.isDefault) {
      await setDefaultCertificateTemplate(id, admin.uid)
    }

    // Audit log the update
    await logApiRequest({
      endpoint: `/api/certificates/templates/${id}`,
      method: 'PUT',
      ip,
      userId: admin.uid,
      userAgent: request.headers.get('user-agent'),
      status: 200,
      timestamp: new Date(),
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
    if (err instanceof Error && err.message === 'Template not found') {
      return withSecurityHeaders(NextResponse.json({ error: 'Template not found' }, { status: 404 }))
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
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  const ip = getClientIp(request.headers)

  try {
    const rate = await checkRateLimitStrict(`cert-template:delete:${ip}:${admin.uid}`, 10, 60 * 60 * 1000)
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    await deleteCertificateTemplate(id)

    // Audit log the deletion
    await logApiRequest({
      endpoint: `/api/certificates/templates/${id}`,
      method: 'DELETE',
      ip,
      userId: admin.uid,
      userAgent: request.headers.get('user-agent'),
      status: 200,
      timestamp: new Date(),
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      message: 'Certificate template deleted successfully',
    }))
  } catch (err: unknown) {
    console.error('Error deleting certificate template:', err)
    if (err instanceof Error && err.message === 'Template not found') {
      return withSecurityHeaders(NextResponse.json({ error: 'Template not found' }, { status: 404 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to delete certificate template' }, { status: 500 }))
  }
}
