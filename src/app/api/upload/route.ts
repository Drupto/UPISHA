import { NextRequest, NextResponse } from 'next/server'
import { uploadDataUrl } from '@/lib/storage'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { requireVerifiedMember, requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimitStrict, getClientIp } from '@/lib/firestore-rate-limit'
import { logAdminAction } from '@/lib/audit-log'
import { validateDataUrl, MAX_IMAGE_BYTES, MAX_FILE_BYTES, DOC_MIME_TYPES } from '@/lib/upload-validation'

// Allowed storage path prefixes — prevents path traversal / writing to arbitrary locations
const ALLOWED_PATH_PREFIXES = [
  'certificate-templates/',
  'gallery/',
  'publications/',
  'testimonials/',
  'members/',
  'webinars/',
]

// Paths that require admin role (images for admin-managed content)
const ADMIN_ONLY_PATHS = [
  'certificate-templates/',
  'gallery/',
  'testimonials/',
  'members/',
  'webinars/',
]

// Paths that any authenticated user can upload to (member submissions)
const MEMBER_PATHS = [
  'publications/',
]

function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false
  // Reject path traversal
  if (path.includes('..') || path.includes('\\') || path.startsWith('/')) return false
  // Must start with an allowed prefix
  return ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataUrl, path } = body

    if (!dataUrl || !path) {
      return withSecurityHeaders(NextResponse.json({ error: 'Missing required fields: dataUrl and path' }, { status: 400 }))
    }

    // Validate storage path (prevents path traversal / arbitrary writes)
    if (!isValidPath(path)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid storage path' }, { status: 400 }))
    }

    // Determine if this is a member-accessible path (e.g. publications/) or admin-only
    const isMemberPath = MEMBER_PATHS.some((prefix) => path.startsWith(prefix))
    
    // Member paths: requireVerifiedMember enforces role 'member'/'admin' +
    // email verification + admin approval — parity with the storage.rules
    // requirement that publications/ writers have a member/admin role.
    // (requireAuth alone would let ANY signed-in user upload.)
    const auth = await (isMemberPath ? requireVerifiedMember(request) : requireAdmin(request))
    if (auth instanceof NextResponse) {
      return withSecurityHeaders(auth)
    }
    const user = auth as { uid: string; email: string | null }

    // CSRF protection for mutating requests
    const csrfError = withCsrfProtection(request)
    if (csrfError) {
      return withSecurityHeaders(csrfError)
    }

    const ip = getClientIp(request.headers)

    const rate = await checkRateLimitStrict(`upload:${ip}:${user.uid}`, 10, 60 * 1000)
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    // Validate data URL (MIME type + size)
    const maxAllowedBytes = isMemberPath ? MAX_FILE_BYTES : MAX_IMAGE_BYTES
    const urlCheck = validateDataUrl(dataUrl, {
      maxBytes: maxAllowedBytes,
      allowedMimeTypes: DOC_MIME_TYPES,
    })
    if (!urlCheck.valid) {
      return withSecurityHeaders(NextResponse.json({ error: urlCheck.error || 'Invalid file data' }, { status: 400 }))
    }

    const downloadUrl = await uploadDataUrl(dataUrl, path)

    // Audit-log ADMIN-path uploads only. Member uploads (publications/) are
    // self-service actions, not admin actions — they stay unlogged here.
    if (!isMemberPath) {
      await logAdminAction({
        action: 'storage.upload',
        resourceType: 'storageObject',
        resourceId: path,
        actor: user,
        ip,
        request,
        details: { byteSize: dataUrl.length },
      })
    }

    return withSecurityHeaders(NextResponse.json({ url: downloadUrl }))
  } catch (error) {
    console.error('Error uploading file:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to upload file' }, { status: 500 }))
  }
}