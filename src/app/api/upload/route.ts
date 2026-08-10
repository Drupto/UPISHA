import { NextRequest, NextResponse } from 'next/server'
import { uploadDataUrl } from '@/lib/storage'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimitStrict, getClientIp } from '@/lib/firestore-rate-limit'

// Allowed storage path prefixes — prevents path traversal / writing to arbitrary locations
const ALLOWED_PATH_PREFIXES = [
  'certificate-templates/',
  'gallery/',
  'publications/',
  'testimonials/',
  'members/',
  'webinars/',
]

// Max decoded image size (5MB)
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false
  // Reject path traversal
  if (path.includes('..') || path.includes('\\') || path.startsWith('/')) return false
  // Must start with an allowed prefix
  return ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}

function validateDataUrl(dataUrl: string): { valid: boolean; error?: string } {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return { valid: false, error: 'Missing dataUrl' }
  }

  // Must be a data URL with an allowed image MIME type
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return { valid: false, error: 'Invalid data URL format' }
  }

  const mimeType = match[1].toLowerCase()
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: 'Only PNG, JPEG, WebP, and GIF images are allowed' }
  }

  // Check decoded size
  const base64Data = match[2]
  const decodedBytes = Math.floor((base64Data.length * 3) / 4)
  if (decodedBytes > MAX_IMAGE_BYTES) {
    return { valid: false, error: 'Image size exceeds 5MB limit' }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
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

    const rate = await checkRateLimitStrict(`upload:${ip}:${admin.uid}`, 10, 60 * 1000)
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const body = await request.json()
    const { dataUrl, path } = body

    if (!dataUrl || !path) {
      return withSecurityHeaders(NextResponse.json({ error: 'Missing required fields: dataUrl and path' }, { status: 400 }))
    }

    // Validate storage path (prevents path traversal / arbitrary writes)
    if (!isValidPath(path)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid storage path' }, { status: 400 }))
    }

    // Validate data URL (MIME type + size)
    const urlCheck = validateDataUrl(dataUrl)
    if (!urlCheck.valid) {
      return withSecurityHeaders(NextResponse.json({ error: urlCheck.error || 'Invalid image data' }, { status: 400 }))
    }

    const downloadUrl = await uploadDataUrl(dataUrl, path)

    return withSecurityHeaders(NextResponse.json({ url: downloadUrl }))
  } catch (error) {
    console.error('Error uploading image:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to upload image' }, { status: 500 }))
  }
}