/**
 * Simple in-memory rate limiter for API routes
 * Prevents abuse by limiting requests per IP address
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: Request) => string // Custom key generator
}

/**
 * Rate limit middleware factory
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return async (request: Request): Promise<{ success: boolean; remaining: number; resetTime: number }> => {
    // Get IP from request (works with Vercel, Netlify, and standard headers)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'

    const key = keyGenerator ? keyGenerator(request) : ip

    const now = Date.now()
    const entry = rateLimitStore.get(key)

    // Clean up expired entries periodically
    if (entry && now > entry.resetTime) {
      rateLimitStore.delete(key)
    }

    const currentEntry = rateLimitStore.get(key)

    if (!currentEntry) {
      // First request in window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return {
        success: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      }
    }

    if (currentEntry.count >= maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: currentEntry.resetTime,
      }
    }

    // Increment count
    currentEntry.count++
    return {
      success: true,
      remaining: maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime,
    }
  }
}

/**
 * Simple cache interface for API responses
 */
export interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class SimpleCache<T> {
  private store = new Map<string, CacheEntry<T>>()

  constructor(private defaultTtl: number = 5 * 60 * 1000) {}

  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    return entry.data
  }

  set(key: string, data: T, ttl?: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttl || this.defaultTtl),
    })
  }

  clear(): void {
    this.store.clear()
  }
}