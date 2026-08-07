/**
 * Firestore-based rate limiter for distributed systems
 * Uses Firestore client SDK to persist rate limit data across serverless instances
 */

import { getDb } from './firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore'

interface RateLimitEntry {
  id: string
  identifier: string
  count: number
  resetTime: number
  createdAt: Date
}

const db = getDb()
const RATE_LIMITS_COLLECTION = 'rate_limits'

/**
 * Check if request is rate limited using Firestore
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  if (!db) {
    // Fallback to allowing if Firestore not configured
    return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs }
  }

  const now = Date.now()
  const resetTime = now + windowMs
  const rateLimitRef = doc(collection(db, RATE_LIMITS_COLLECTION), identifier)

  try {
    const docSnap = await getDoc(rateLimitRef)
    
    if (!docSnap.exists()) {
      // First request in window - create new entry
      await setDoc(rateLimitRef, {
        identifier,
        count: 1,
        resetTime,
        createdAt: new Date(),
      })
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }

    const data = docSnap.data() as RateLimitEntry
    const currentResetTime = data.resetTime

    // Check if window has expired
    if (now > currentResetTime) {
      // Reset the counter
      await setDoc(rateLimitRef, {
        identifier,
        count: 1,
        resetTime,
        createdAt: new Date(),
      })
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }

    // Check if limit exceeded
    if (data.count >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: data.resetTime 
      }
    }

    // Increment counter
    await updateDoc(rateLimitRef, {
      count: data.count + 1,
    })

    return {
      allowed: true,
      remaining: maxRequests - (data.count + 1),
      resetTime: data.resetTime,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Allow request on error to prevent blocking legitimate users
    return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs }
  }
}

/**
 * Reset rate limit for a specific identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  if (!db) return
  
  try {
    const rateLimitRef = doc(collection(db, RATE_LIMITS_COLLECTION), identifier)
    await deleteDoc(rateLimitRef)
  } catch (error) {
    console.error('Failed to reset rate limit:', error)
  }
}

/**
 * Clean up expired rate limit entries
 * Should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  if (!db) return 0

  try {
    const now = Date.now()
    const q = query(
      collection(db, RATE_LIMITS_COLLECTION),
      where('resetTime', '<', now)
    )
    const snapshot = await getDocs(q)

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    return snapshot.size
  } catch (error) {
    console.error('Failed to cleanup rate limits:', error)
    return 0
  }
}