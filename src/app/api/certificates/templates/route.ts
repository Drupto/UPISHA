import { NextRequest, NextResponse } from 'next/server'
import { getCertificateTemplates, createCertificateTemplate, seedDefaultCertificateTemplates } from '@/lib/firestore'
import { certificateTemplateSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    // Ensure default templates are seeded on first access
    await seedDefaultCertificateTemplates()

    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'

    if (!rateLimit(`cert-templates:${ip}`, 30, 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

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

  try {
    const body = await request.json()
    const validated = certificateTemplateSchema.parse(body)

    if (!rateLimit(`cert-template:create`, 10, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const template = await createCertificateTemplate({
      name: sanitizeHtml(validated.name),
      accountType: validated.accountType,
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
      isDefault: validated.isDefault,
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