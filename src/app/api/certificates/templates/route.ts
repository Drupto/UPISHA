import { NextRequest, NextResponse } from 'next/server'
import { getCertificateTemplates, createCertificateTemplate, setDefaultCertificateTemplate, seedDefaultCertificateTemplates } from '@/lib/firestore'
import { certificateTemplateSchema, enforceBodySizeLimit } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimitStrict, getClientIp } from '@/lib/firestore-rate-limit'
import { logApiRequest } from '@/lib/request-logger'

const MAX_TEMPLATES = 50

export async function GET(request: NextRequest) {
  try {
    // Templates are admin-only configuration; restrict access.
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) {
      return withSecurityHeaders(auth)
    }

    const ip = getClientIp(request.headers)

    const rate = await checkRateLimitStrict(`cert-templates:get:${ip}`, 60, 60 * 1000)
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    // Ensure default templates (including the webinar participation template)
    // are seeded so admins can always issue certificates on a fresh database.
    await seedDefaultCertificateTemplates()

    const templates = await getCertificateTemplates()
    return withSecurityHeaders(NextResponse.json({ templates }))
  } catch (error) {
    console.error('Error fetching certificate templates:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch certificate templates' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
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
    const rate = await checkRateLimitStrict(`cert-template:create:${ip}:${admin.uid}`, 10, 60 * 60 * 1000)
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const body = await request.json()
    const validated = certificateTemplateSchema.parse(body)

    // Enforce a hard cap on the number of templates to prevent storage abuse
    const existing = await getCertificateTemplates()
    if (existing.length >= MAX_TEMPLATES) {
      return withSecurityHeaders(NextResponse.json(
        { error: `Maximum of ${MAX_TEMPLATES} templates allowed` },
        { status: 400 }
      ))
    }

    const template = await createCertificateTemplate({
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
      createdBy: admin.uid,
      updatedBy: admin.uid,
    })

    // If this template should be the default, atomically unset any other defaults
    if (validated.isDefault && template.id) {
      await setDefaultCertificateTemplate(template.id, admin.uid)
    }

    // Audit log the creation
    await logApiRequest({
      endpoint: '/api/certificates/templates',
      method: 'POST',
      ip,
      userId: admin.uid,
      userAgent: request.headers.get('user-agent'),
      status: 201,
      timestamp: new Date(),
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: template.id,
      message: 'Certificate template created successfully',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating certificate template:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create certificate template' }, { status: 500 }))
  }
}