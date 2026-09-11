/**
 * Server-side Firebase Storage uploads — Admin SDK implementation.
 *
 * Previously this used the client/Web SDK (`uploadString` + `getDownloadURL`),
 * which cannot authenticate a server-side call — so the storage rules
 * (isAdmin()/role checks) denied every upload. The Admin SDK bypasses
 * storage.rules; authorization is enforced by the API layer
 * (/api/upload: requireAdmin / requireVerifiedMember, path allowlist,
 * MIME + size validation) before reaching this code.
 *
 * The generated URL keeps the same `?alt=media&token=…` shape the client
 * SDK's getDownloadURL produced (via the firebaseStorageDownloadTokens
 * metadata field), so existing <img>/download links and Firestore-stored
 * URLs remain compatible. For public buckets (gallery/, publications/, …)
 * the token URL is world-readable — same semantics as before. For
 * members/{uid} files the URL must be treated as a bearer secret.
 *
 * ⚠️ SERVER ONLY — never import from client components.
 */
import { randomUUID } from 'crypto'
import { getAdminStorage } from './firebase-server'

const DOWNLOAD_URL_BASE = 'https://firebasestorage.googleapis.com/v0/b'

/**
 * Resolve the Storage bucket explicitly. The Admin SDK does not infer a
 * default bucket from the project ID (unlike the client SDK), so we pass
 * the name explicitly; if no env var is set we fall back to the app's
 * `storageBucket` init option (see firebase-server.ts).
 */
function getBucket() {
  const bucketName =
    process.env.FIREBASE_ADMIN_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const storage = getAdminStorage()
  return bucketName ? storage.bucket(bucketName) : storage.bucket()
}

/**
 * Upload a base64 data URL to Firebase Storage and return a durable
 * download URL. Replaces the previous client-SDK `uploadString` +
 * `getDownloadURL` implementation.
 */
export async function uploadDataUrl(
  dataUrl: string,
  path: string
): Promise<string> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/)
  if (!match) {
    throw new Error('Invalid data URL format')
  }
  const contentType = match[1]
  const buffer = Buffer.from(match[2], 'base64')

  const bucket = getBucket()
  const file = bucket.file(path)
  const token = randomUUID()

  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: {
      contentType,
      // Classic download-token: makes the ?alt=media&token=… URL work the
      // same way getDownloadURL() URLs did under the client SDK.
      firebaseStorageDownloadTokens: token,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  })

  const encodedPath = encodeURIComponent(path)
  return `${DOWNLOAD_URL_BASE}/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`
}

/**
 * Delete a file from Firebase Storage by its path (404 tolerated).
 */
export async function deleteStorageObject(path: string): Promise<void> {
  try {
    await getBucket().file(path).delete()
  } catch (err) {
    if ((err as { code?: number }).code !== 404) throw err
  }
}
