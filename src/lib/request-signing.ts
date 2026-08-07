/**
 * Request signing utility for sensitive operations
 * Uses HMAC to sign requests and prevent tampering
 */

import { createHmac, timingSafeEqual } from 'crypto'

const SIGNING_SECRET = process.env.REQUEST_SIGNING_SECRET || 'your-secret-key-change-in-production'
const TIMESTAMP_TOLERANCE = 5 * 60 * 1000 // 5 minutes

export interface SignedRequest {
  timestamp: number
  payload: Record<string, any>
  signature: string
}

/**
 * Sign a request payload with HMAC
 */
export function signRequest(payload: Record<string, any>): SignedRequest {
  const timestamp = Date.now()
  
  // Create signature from timestamp + payload
  const message = `${timestamp}:${JSON.stringify(payload)}`
  const signature = createHmac('sha256', SIGNING_SECRET)
    .update(message)
    .digest('hex')

  return {
    timestamp,
    payload,
    signature,
  }
}

/**
 * Verify a signed request
 */
export function verifySignedRequest(signedRequest: SignedRequest): { valid: boolean; error?: string } {
  // Check timestamp to prevent replay attacks
  const now = Date.now()
  const timestampAge = now - signedRequest.timestamp
  
  if (timestampAge > TIMESTAMP_TOLERANCE) {
    return { valid: false, error: 'Request expired' }
  }

  if (timestampAge < 0) {
    return { valid: false, error: 'Invalid timestamp' }
  }

  // Recreate signature
  const message = `${signedRequest.timestamp}:${JSON.stringify(signedRequest.payload)}`
  const expectedSignature = createHmac('sha256', SIGNING_SECRET)
    .update(message)
    .digest('hex')

  // Compare signatures using timing-safe comparison
  const signatureBuffer = Buffer.from(signedRequest.signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: 'Invalid signature' }
  }

  const isValid = timingSafeEqual(signatureBuffer, expectedBuffer)

  if (!isValid) {
    return { valid: false, error: 'Invalid signature' }
  }

  return { valid: true }
}

/**
 * Generate a request signing token for client-side use
 * This creates a token that can be used to sign requests
 */
export function generateRequestToken(action: string, resourceId?: string): string {
  const payload = {
    action,
    resourceId,
    nonce: Math.random().toString(36).substring(2, 15),
  }

  const signed = signRequest(payload)
  return `${signed.timestamp}:${signed.signature}:${Buffer.from(JSON.stringify(payload)).toString('base64')}`
}

/**
 * Verify a request token
 */
export function verifyRequestToken(token: string): { valid: boolean; payload?: Record<string, any>; error?: string } {
  try {
    const [timestampStr, signature, payloadBase64] = token.split(':')
    
    if (!timestampStr || !signature || !payloadBase64) {
      return { valid: false, error: 'Invalid token format' }
    }

    const timestamp = parseInt(timestampStr, 10)
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())

    const signedRequest: SignedRequest = {
      timestamp,
      payload,
      signature,
    }

    const result = verifySignedRequest(signedRequest)

    if (!result.valid) {
      return { valid: false, error: result.error }
    }

    return { valid: true, payload }
  } catch (error) {
    return { valid: false, error: 'Failed to parse token' }
  }
}