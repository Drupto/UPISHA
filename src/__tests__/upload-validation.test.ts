import { validateDataUrl, MAX_IMAGE_BYTES, MAX_FILE_BYTES, IMAGE_MIME_TYPES, DOC_MIME_TYPES } from '@/lib/upload-validation'

const pngDataUrl = (payload = 'iVBORw0KGgo=') => `data:image/png;base64,${payload}`

describe('validateDataUrl', () => {
  it('accepts an allowed MIME type with a small payload', () => {
    const result = validateDataUrl(pngDataUrl(), { maxBytes: MAX_IMAGE_BYTES, allowedMimeTypes: IMAGE_MIME_TYPES })
    expect(result.valid).toBe(true)
    expect(result.contentType).toBe('image/png')
  })

  it('is case-insensitive on the MIME type', () => {
    const result = validateDataUrl('data:IMAGE/JPEG;base64,AAAA', { maxBytes: MAX_IMAGE_BYTES, allowedMimeTypes: IMAGE_MIME_TYPES })
    expect(result.valid).toBe(true)
    expect(result.contentType).toBe('image/jpeg')
  })

  it('rejects disallowed MIME types with a friendly message', () => {
    const result = validateDataUrl('data:text/html;base64,PGgxPg==', {
      maxBytes: MAX_FILE_BYTES,
      allowedMimeTypes: DOC_MIME_TYPES,
    })
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/only .* files are allowed/i)
  })

  it('rejects malformed data URLs and missing input', () => {
    expect(validateDataUrl(null, { maxBytes: 1000 }).valid).toBe(false)
    expect(validateDataUrl(undefined, { maxBytes: 1000 }).valid).toBe(false)
    expect(validateDataUrl('https://not-a-data-url.com/x.png', { maxBytes: 1000 }).valid).toBe(false)
    expect(validateDataUrl('data:image/png,raw-unencoded', { maxBytes: 1000 }).valid).toBe(false)
  })

  it('enforces the decoded-size ceiling (base64 4 chars → 3 bytes)', () => {
    // 20 base64 chars ≈ 15 decoded bytes → exceeds maxBytes: 10
    const result = validateDataUrl(`data:image/png;base64,${'A'.repeat(20)}`, { maxBytes: 10 })
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/size/i)
  })

  it('allows a payload just under the ceiling', () => {
    // 12 base64 chars ≈ 9 decoded bytes → under maxBytes: 10
    const result = validateDataUrl(`data:image/png;base64,${'A'.repeat(12)}`, { maxBytes: 10 })
    expect(result.valid).toBe(true)
  })

  it('rejects an image where a photo is expected (join photo is image-only)', () => {
    const result = validateDataUrl('data:application/pdf;base64,JVBERi0=', {
      maxBytes: MAX_IMAGE_BYTES,
      allowedMimeTypes: IMAGE_MIME_TYPES,
    })
    expect(result.valid).toBe(false)
  })

  it('accepts a PDF where documents are allowed (RCI certificate)', () => {
    const result = validateDataUrl('data:application/pdf;base64,JVBERi0=', {
      maxBytes: MAX_FILE_BYTES,
      allowedMimeTypes: DOC_MIME_TYPES,
    })
    expect(result.valid).toBe(true)
  })
})
