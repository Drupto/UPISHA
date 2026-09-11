/**
 * Shared data-URL upload validation (MIME allowlist + decoded size limit).
 *
 * Used by BOTH upload entry points:
 *   - /api/upload (authenticated admin/member uploads)
 *   - /api/join   (UNAUTHENTICATED join form — photo + RCI certificate)
 *
 * The join check must run BEFORE the Firebase Auth account is created so
 * an invalid payload fails fast with a field-level error and never leaves
 * an orphaned auth user behind.
 */

export const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const

export const DOC_MIME_TYPES = [...IMAGE_MIME_TYPES, 'application/pdf'] as const

// Max decoded sizes — keep in sync with storage.rules (5MB admin images,
// 10MB member files)
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_FILE_BYTES = 10 * 1024 * 1024

export interface ValidateDataUrlOptions {
  maxBytes: number
  /** Defaults to DOC_MIME_TYPES (images + pdf) when omitted. */
  allowedMimeTypes?: readonly string[]
}

export interface DataUrlCheck {
  valid: boolean
  error?: string
  contentType?: string
}

/**
 * Validate a `data:<mime>;base64,<payload>` string against an allowed MIME
 * list and a decoded-size ceiling.
 */
export function validateDataUrl(
  dataUrl: unknown,
  options: ValidateDataUrlOptions
): DataUrlCheck {
  const { maxBytes, allowedMimeTypes = DOC_MIME_TYPES } = options

  if (!dataUrl || typeof dataUrl !== 'string') {
    return { valid: false, error: 'Missing file data' }
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return { valid: false, error: 'Invalid file format' }
  }

  const contentType = match[1].toLowerCase()
  if (!allowedMimeTypes.includes(contentType)) {
    const friendly = allowedMimeTypes
      .map((m) => (m === 'application/pdf' ? 'PDF' : m.replace('image/', '').toUpperCase()))
      .join(', ')
    return { valid: false, error: `Only ${friendly} files are allowed` }
  }

  // Decoded byte size from base64 length (4 chars → 3 bytes)
  const decodedBytes = Math.floor((match[2].length * 3) / 4)
  if (decodedBytes > maxBytes) {
    const maxMB = Math.floor(maxBytes / (1024 * 1024))
    return { valid: false, error: `File size exceeds ${maxMB}MB limit` }
  }

  return { valid: true, contentType }
}
