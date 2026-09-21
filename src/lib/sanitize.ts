/**
 * Client-side input sanitization utilities
 * Provides basic sanitization before sending data to the server
 */

/**
 * Sanitize a string by trimming whitespace and removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  // Strip angle brackets only. Do NOT HTML-entity-escape here: these values
  // are rendered as React children (React escapes at render time) and the
  // server applies its own sanitization. Pre-escaping on the client caused
  // double-encoded HTML entities to accumulate in saved certificate fields
  // on every save.
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Sanitize a phone number (keep only digits, +, -, spaces, parentheses)
 */
export function sanitizePhone(phone: string): string {
  return phone.trim().replace(/[^+\d\s()-]/g, '')
}

/**
 * Sanitize a URL
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  // Basic URL validation
  try {
    // If it's a relative URL (starts with #), allow it
    if (trimmed.startsWith('#')) return trimmed
    // Try to parse as URL
    new URL(trimmed)
    return trimmed
  } catch {
    // If not a valid URL, prepend https://
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    return trimmed
  }
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Special handling for email, phone, and URL fields
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value)
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key] = sanitizePhone(value)
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        sanitized[key] = sanitizeUrl(value)
      } else {
        sanitized[key] = sanitizeString(value)
      }
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

/**
 * Validate file type for uploads
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Upload file to Firebase Storage (placeholder - implement with your storage solution)
 */
export async function uploadFile(
  file: File,
  path: string
): Promise<{ url: string; path: string }> {
  // This is a placeholder implementation
  // In a real app, you would upload to Firebase Storage, S3, or another service
  
  // For now, we'll create a local object URL (not suitable for production)
  const url = URL.createObjectURL(file)
  
  // TODO: Implement actual file upload to your storage service
  // Example Firebase Storage:
  // const storage = getStorage()
  // const ref = ref(storage, `${path}/${Date.now()}_${file.name}`)
  // await uploadBytes(resumable(ref), file)
  // const downloadURL = await getDownloadURL(ref)
  // return { url: downloadURL, path: ref.fullPath }
  
  console.warn('File upload not fully implemented. Using temporary object URL.')
  return { url, path }
}