/**
 * Firestore-based rate limiter for distributed systems
 * Uses atomic transactions to prevent race-condition bypasses
 * and works across serverless instances.
 */

import { getDb } from './firebase-admin'
import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  query,
  runTransaction,
  where,
  increment,
  Timestamp,
} from 'firebase/firestore'

interface RateLimitEntry {
  identifier: string
  count: number
  resetTime: number
  createdAt: Date
}

const RATE_LIMITS_COLLECTION = 'rate_limits'

// Lazy db accessor (matches firestore.ts pattern) so module import
// during build does not fail when env vars are unavailable.
const db = () => getDb()

/**
 * Get the client IP from a request, taking forwarded headers into account.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  return forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'
}

/**
 * Check if a request is rate limited using Firestore with atomic transactions.
 *
 * Uses `runTransaction` + `increment()` so concurrent requests cannot
 * both pass the limit check (no read-then-write race).
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const dbInstance = db()
  const now = Date.now()

  try {
    const rateLimitRef = doc(collection(dbInstance, RATE_LIMITS_COLLECTION), identifier)

    // Atomic transaction: read + decide + write are serializable.
    const result = await runTransaction(dbInstance, async (transaction) => {
      const docSnap = await transaction.get(rateLimitRef)

      if (!docSnap.exists()) {
        const resetTime = now + windowMs
        transaction.set(rateLimitRef, {
          identifier,
          count: 1,
          resetTime,
          createdAt: Timestamp.now(),
        })
        return { allowed: true, remaining: maxRequests - 1, resetTime }
      }

      const data = docSnap.data() as RateLimitEntry
      const currentResetTime = typeof data.resetTime === 'number' ? data.resetTime : now + windowMs

      // Window expired — reset the counter atomically.
      if (now > currentResetTime) {
        const resetTime = now + windowMs
        transaction.set(rateLimitRef, {
          identifier,
          count: 1,
          resetTime,
          createdAt: Timestamp.now(),
        })
        return { allowed: true, remaining: maxRequests - 1, resetTime }
      }

      // Limit exceeded — deny.
      if (data.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: currentResetTime,
        }
      }

      // Within limit — atomic increment.
      transaction.update(rateLimitRef, {
        count: increment(1),
      })

      return {
        allowed: true,
        remaining: maxRequests - (data.count + 1),
        resetTime: currentResetTime,
      }
    })

    return result
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail-open for reads/verification, but callers can choose fail-closed
    // for admin mutations by handling the thrown error themselves.
    return { allowed: true, remaining: maxRequests, resetTime: now + windowMs }
  }
}

/**
 * Fail-closed variant: rejects the request when Firestore is unavailable.
 * Recommended for admin-only mutation endpoints where abuse protection
 * matters more than availability.
 */
export async function checkRateLimitStrict(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const dbInstance = db()
  const now = Date.now()

  const rateLimitRef = doc(collection(dbInstance, RATE_LIMITS_COLLECTION), identifier)

  const result = await runTransaction(dbInstance, async (transaction) => {
    const docSnap = await transaction.get(rateLimitRef)

    if (!docSnap.exists()) {
      const resetTime = now + windowMs
      transaction.set(rateLimitRef, {
        identifier,
        count: 1,
        resetTime,
        createdAt: Timestamp.now(),
      })
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }

    const data = docSnap.data() as RateLimitEntry
    const currentResetTime = typeof data.resetTime === 'number' ? data.resetTime : now + windowMs

    if (now > currentResetTime) {
      const resetTime = now + windowMs
      transaction.set(rateLimitRef, {
        identifier,
        count: 1,
        resetTime,
        createdAt: Timestamp.now(),
      })
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }

    if (data.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentResetTime,
      }
    }

    transaction.update(rateLimitRef, {
      count: increment(1),
    })

    return {
      allowed: true,
      remaining: maxRequests - (data.count + 1),
      resetTime: currentResetTime,
    }
  })

  return result
}

/**
 * Reset the rate limit for a specific identifier.
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const dbInstance = db()
  try {
    const rateLimitRef = doc(collection(dbInstance, RATE_LIMITS_COLLECTION), identifier)
    await deleteDoc(rateLimitRef)
  } catch (error) {
    console.error('Failed to reset rate limit:', error)
  }
}

/**
 * Clean up expired rate limit entries.
 * Should be run periodically (e.g., via a scheduled function or admin route).
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  const dbInstance = db()
  const now = Date.now()

  try {
    const q = query(
      collection(dbInstance, RATE_LIMITS_COLLECTION),
      where('resetTime', '<', now)
    )
    const snapshot = await getDocs(q)

    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    return snapshot.size
  } catch (error) {
    console.error('Failed to cleanup rate limits:', error)
    return 0
  }
}