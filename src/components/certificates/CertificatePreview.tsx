'use client'

import { useRef, useState, useEffect } from 'react'
import QRCode from 'qrcode'
import type { CertificateTextBlock, CertificateTemplateDoc } from '@/lib/types'

// Base certificate dimensions (A4 landscape at 96 DPI)
const BASE_WIDTH = 1123
const BASE_HEIGHT = 794
const BASE_ASPECT = BASE_WIDTH / BASE_HEIGHT

interface CertificatePreviewProps {
  template: CertificateTemplateDoc | null
  memberName?: string
  membershipType?: string
  memberId?: string
  date?: string
  qualification?: string
  certificateNumber?: string
  verificationUrl?: string
  scale?: number
  certificateRef?: React.Ref<HTMLDivElement>
  webinarTitle?: string
  webinarDate?: string
  webinarSpeaker?: string
  duration?: string
}

export function replacePlaceholders(
  content: string,
  data: {
    name?: string
    membershipType?: string
    memberId?: string
    date?: string
    qualification?: string
    certificateNumber?: string
    webinarTitle?: string
    webinarDate?: string
    webinarSpeaker?: string
    duration?: string
  }
): string {
  return content
    .replace(/\{name\}/g, data.name || '')
    .replace(/\{membershipType\}/g, formatMembershipType(data.membershipType || ''))
    .replace(/\{memberId\}/g, data.memberId || '')
    .replace(/\{date\}/g, data.date || '')
    .replace(/\{qualification\}/g, data.qualification || '')
    .replace(/\{certificateNumber\}/g, data.certificateNumber || '')
    .replace(/\{webinarTitle\}/g, data.webinarTitle || '')
    .replace(/\{webinarDate\}/g, data.webinarDate || '')
    .replace(/\{webinarSpeaker\}/g, data.webinarSpeaker || '')
    .replace(/\{duration\}/g, data.duration || '')
}

export function formatMembershipType(type: string): string {
  const map: Record<string, string> = {
    life: 'Life Member',
    annual: 'Annual Member',
    student: 'Student Member',
  }
  return map[type] || type
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  try {
    return new Date(isoDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}

const fontFamilyMap: Record<string, string> = {
  serif: 'Georgia, "Times New Roman", serif',
  'sans-serif': 'Arial, Helvetica, sans-serif',
  cursive: '"Brush Script MT", "Segoe Script", cursive',
}

// Defense-in-depth: only allow http(s) URLs for images/backgrounds
// to prevent javascript:/data: injection into <img src> and CSS url().
// Also allow the app's own main logo (relative path) as a safe fallback.
const MAIN_LOGO_URL = '/images/mainlogo.jpeg'
function isSafeUrl(url: string | null | undefined): url is string {
  if (!url) return false
  if (url === MAIN_LOGO_URL) return true
  return /^https?:\/\//i.test(url)
}

export default function CertificatePreview({
  template,
  memberName = 'Member Name',
  membershipType = 'life',
  memberId = 'member-id',
  date,
  qualification,
  certificateNumber,
  verificationUrl,
  scale: externalScale,
  certificateRef,
  webinarTitle,
  webinarDate,
  webinarSpeaker,
  duration,
}: CertificatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScale, setAutoScale] = useState(1)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // Generate the verification QR code as a data URL so it renders as an <img>
  // (captured correctly by html-to-image for PDF download and by the print flow).
  useEffect(() => {
    let cancelled = false
    if (!verificationUrl) {
      setQrDataUrl(null)
      return
    }
    QRCode.toDataURL(verificationUrl, {
      width: 140,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#1f2937',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch((err) => {
        console.error('Error generating QR code:', err)
        if (!cancelled) setQrDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [verificationUrl])

  // Auto-scale the certificate to fit its container while keeping
  // a fixed base width so proportions are identical everywhere.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateScale = () => {
      const width = el.clientWidth
      if (width > 0) {
        setAutoScale(width / BASE_WIDTH)
      }
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scale = externalScale ?? autoScale

  if (!template) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
        style={{ aspectRatio: `${BASE_ASPECT}` }}
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">Select a template to preview</p>
      </div>
    )
  }

  const displayDate = date ? formatDate(date) : ''

  const safeLogoUrl = isSafeUrl(template.logoUrl) ? template.logoUrl : MAIN_LOGO_URL
  const safeSignatureUrl = isSafeUrl(template.signatureUrl) ? template.signatureUrl : null
  const safeStampUrl = isSafeUrl(template.stampUrl) ? template.stampUrl : null
  const safeBackgroundUrl = isSafeUrl(template.backgroundUrl) ? template.backgroundUrl : null

  const renderBlock = (block: CertificateTextBlock) => {
    const text = replacePlaceholders(block.content, {
      name: memberName,
      membershipType,
      memberId,
      date: displayDate,
      qualification,
      certificateNumber,
      webinarTitle,
      webinarDate: webinarDate ? formatDate(webinarDate) : '',
      webinarSpeaker,
      duration,
    })

    return (
      <div
        key={block.id}
        style={{
          fontSize: block.fontSize,
          fontWeight: block.fontWeight === 'semibold' ? 600 : block.fontWeight,
          fontStyle: block.fontStyle,
          textAlign: block.textAlign,
          color: block.color,
          marginTop: block.marginTop,
          marginBottom: block.marginBottom,
          lineHeight: 1.4,
        }}
      >
        {text}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{ aspectRatio: `${BASE_ASPECT}` }}
    >
      <div
        ref={certificateRef}
        className="overflow-hidden rounded-lg shadow-lg bg-white"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
        }}
      >
        <div
          className="w-full h-full relative flex flex-col items-center justify-center px-[6%] py-[4%]"
          style={{
            fontFamily: fontFamilyMap[template.fontFamily] || fontFamilyMap.serif,
            background: safeBackgroundUrl
              ? `url(${safeBackgroundUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #fdfbf7 0%, #ffffff 50%, #faf6ef 100%)',
            border: `8px solid ${template.borderColor}`,
            outline: `2px solid ${template.accentColor}`,
            outlineOffset: '-16px',
          }}
        >
          {/* Decorative corner accents */}
          <div
            className="absolute top-4 left-4 w-12 h-12"
            style={{
              borderTop: `3px solid ${template.accentColor}`,
              borderLeft: `3px solid ${template.accentColor}`,
            }}
          />
          <div
            className="absolute top-4 right-4 w-12 h-12"
            style={{
              borderTop: `3px solid ${template.accentColor}`,
              borderRight: `3px solid ${template.accentColor}`,
            }}
          />
          <div
            className="absolute bottom-4 left-4 w-12 h-12"
            style={{
              borderBottom: `3px solid ${template.accentColor}`,
              borderLeft: `3px solid ${template.accentColor}`,
            }}
          />
          <div
            className="absolute bottom-4 right-4 w-12 h-12"
            style={{
              borderBottom: `3px solid ${template.accentColor}`,
              borderRight: `3px solid ${template.accentColor}`,
            }}
          />

          {/* Logo */}
          <div className="mb-4">
            <img
              src={safeLogoUrl}
              alt="UP ISHA Logo"
              className="h-20 w-20 object-contain mx-auto"
            />
          </div>

          {/* Title */}
          <h1
            className="text-center mb-2"
            style={{
              fontSize: template.titleFont?.fontSize || 32,
              fontWeight: template.titleFont?.fontWeight === 'semibold' ? 600 : template.titleFont?.fontWeight || 'bold',
              fontStyle: template.titleFont?.fontStyle || 'normal',
              textAlign: template.titleFont?.textAlign || 'center',
              color: template.titleFont?.color || template.accentColor,
              letterSpacing: `${template.titleFont?.letterSpacing ?? 0.02}em`,
              textTransform: 'uppercase',
            }}
          >
            {template.title}
          </h1>

          {/* Subtitle */}
          {template.subtitle && (
            <p
              className="text-center mb-3"
              style={{
                fontSize: template.subtitleFont?.fontSize || 16,
                fontWeight: template.subtitleFont?.fontWeight === 'semibold' ? 600 : template.subtitleFont?.fontWeight || 'normal',
                fontStyle: template.subtitleFont?.fontStyle || 'normal',
                textAlign: template.subtitleFont?.textAlign || 'center',
                color: template.subtitleFont?.color || '#6b7280',
                letterSpacing: `${template.subtitleFont?.letterSpacing ?? 0.05}em`,
              }}
            >
              {template.subtitle}
            </p>
          )}

          {/* Divider */}
          <div
            className="w-2/3 h-px mx-auto mb-3"
            style={{ backgroundColor: template.borderColor }}
          />

          {/* Text blocks */}
          <div className="w-full max-w-[85%] space-y-0">
            {template.textBlocks.map(renderBlock)}
          </div>

          {/* Certificate number */}
          {certificateNumber && (
            <p
              className="absolute bottom-8 right-10 text-xs font-mono"
              style={{ color: '#9ca3af' }}
            >
              {certificateNumber}
            </p>
          )}

          {/* Footer with QR verification, seal, and signature */}
          <div className="w-full flex items-end justify-between px-4 mt-auto pt-6">
            {/* Stamp */}
            <div className="flex flex-col items-center gap-1 w-32">
              {safeStampUrl && (
                <img
                  src={safeStampUrl}
                  alt="Stamp"
                  className="h-16 w-16 object-contain"
                />
              )}
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">
                Official Seal
              </p>
            </div>

            {/* QR Verification */}
            <div className="flex flex-col items-center gap-1 w-36">
              {qrDataUrl ? (
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 no-underline"
                >
                  <img
                    src={qrDataUrl}
                    alt="Verify this certificate"
                    className="h-16 w-16 object-contain p-0.5 bg-white border border-gray-200 rounded"
                  />
                  <span className="text-[9px] text-gray-500 text-center leading-tight">
                    Scan to Verify
                  </span>
                </a>
              ) : (
                <div className="h-16 w-16 rounded border border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-[9px] text-gray-400 text-center leading-tight px-1">
                    Verification QR
                  </span>
                </div>
              )}
            </div>

            {/* Signature */}
            <div className="flex flex-col items-center gap-1 w-40">
              {safeSignatureUrl && (
                <img
                  src={safeSignatureUrl}
                  alt="Signature"
                  className="h-12 w-32 object-contain"
                />
              )}
              <div className="w-full h-px bg-gray-400" />
              <p className="text-xs text-gray-600 text-center">{template.footerText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}