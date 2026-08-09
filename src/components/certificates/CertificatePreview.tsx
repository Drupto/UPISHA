'use client'

import type { CertificateTextBlock, CertificateTemplateDoc } from '@/lib/types'

interface CertificatePreviewProps {
  template: CertificateTemplateDoc | null
  memberName?: string
  membershipType?: string
  memberId?: string
  date?: string
  qualification?: string
  certificateNumber?: string
  scale?: number
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
  }
): string {
  return content
    .replace(/\{name\}/g, data.name || '')
    .replace(/\{membershipType\}/g, formatMembershipType(data.membershipType || ''))
    .replace(/\{memberId\}/g, data.memberId || '')
    .replace(/\{date\}/g, data.date || '')
    .replace(/\{qualification\}/g, data.qualification || '')
    .replace(/\{certificateNumber\}/g, data.certificateNumber || '')
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

export default function CertificatePreview({
  template,
  memberName = 'Member Name',
  membershipType = 'life',
  memberId = 'member-id',
  date,
  qualification,
  certificateNumber,
  scale = 1,
}: CertificatePreviewProps) {
  if (!template) {
    return (
      <div className="flex items-center justify-center aspect-[1.414/1] bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Select a template to preview</p>
      </div>
    )
  }

  const displayDate = date ? formatDate(date) : ''

  const renderBlock = (block: CertificateTextBlock) => {
    const text = replacePlaceholders(block.content, {
      name: memberName,
      membershipType,
      memberId,
      date: displayDate,
      qualification,
      certificateNumber,
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
      className="w-full overflow-hidden rounded-lg shadow-lg bg-white"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `calc(100% / ${scale})`,
        aspectRatio: '1.414 / 1',
      }}
    >
      <div
        className="w-full h-full relative flex flex-col items-center justify-center px-[6%] py-[4%]"
        style={{
          fontFamily: fontFamilyMap[template.fontFamily] || fontFamilyMap.serif,
          background: template.backgroundUrl
            ? `url(${template.backgroundUrl}) center/cover no-repeat`
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
        {template.logoUrl && (
          <div className="mb-4">
            <img
              src={template.logoUrl}
              alt="UP ISHA Logo"
              className="h-20 w-20 object-contain mx-auto"
            />
          </div>
        )}

        {/* Title */}
        <h1
          className="text-center font-bold mb-2"
          style={{
            fontSize: 32,
            color: template.accentColor,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {template.title}
        </h1>

        {/* Subtitle */}
        {template.subtitle && (
          <p
            className="text-center mb-6"
            style={{
              fontSize: 16,
              color: '#6b7280',
              letterSpacing: '0.05em',
            }}
          >
            {template.subtitle}
          </p>
        )}

        {/* Divider */}
        <div
          className="w-2/3 h-px mx-auto mb-6"
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

        {/* Footer with signature and stamp */}
        <div className="w-full flex items-end justify-between px-4 mt-auto pt-6">
          {/* Stamp */}
          <div className="flex flex-col items-center gap-1 w-32">
            {template.stampUrl && (
              <img
                src={template.stampUrl}
                alt="Stamp"
                className="h-16 w-16 object-contain"
              />
            )}
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">
              Official Seal
            </p>
          </div>

          {/* Signature */}
          <div className="flex flex-col items-center gap-1 w-40">
            {template.signatureUrl && (
              <img
                src={template.signatureUrl}
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
  )
}