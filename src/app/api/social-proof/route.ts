import { NextRequest, NextResponse } from 'next/server'
import { createRateLimiter, SimpleCache } from '@/lib/rate-limit'
import { getMembers, getEvents, getWebinars, getWebinarRegistrations } from '@/lib/data'

// Rate limiter: 3 requests per 30 seconds per IP
// Increased from 1 to handle dev mode hot reloads and component remounts
const rateLimiter = createRateLimiter({
  windowMs: 30 * 1000,
  maxRequests: 3,
})

// Cache for 5 minutes to reduce database load
const cache = new SimpleCache<Array<{ icon: string; text: string; emoji: string }>>(5 * 60 * 1000)

export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = await rateLimiter(request)
  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': '1',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    )
  }

  // Check cache first
  const cacheKey = 'social-proof-notifications'
  const cachedData = cache.get(cacheKey)
  if (cachedData) {
    return NextResponse.json(cachedData, {
      headers: {
        'X-Cache': 'HIT',
        'X-RateLimit-Limit': '1',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    })
  }

  try {
    // Fetch data from Firestore
    const [members, events, webinars, registrations] = await Promise.all([
      getMembers(),
      getEvents(),
      getWebinars(),
      getWebinarRegistrations(),
    ])

    const notifications: Array<{ icon: string; text: string; emoji: string }> = []

    // New member notification (show most recent member)
    if (members.length > 0) {
      const recentMember = members[0]
      // Sanitize: don't expose full name, just city
      notifications.push({
        icon: 'users',
        text: `A professional from ${recentMember.city || 'India'} just joined UP ISHA`,
        emoji: '🎉',
      })
    }

    // Events notification
    if (events.length > 0) {
      const activeEvents = events.filter((e) => e.isActive !== false)
      notifications.push({
        icon: 'calendar',
        text: `${activeEvents.length} upcoming events available`,
        emoji: '📅',
      })
    }

    // Members count notification
    if (members.length > 0) {
      notifications.push({
        icon: 'user-plus',
        text: `${members.length} professionals registered`,
        emoji: '👥',
      })
    }

    // Webinar registration notification
    if (webinars.length > 0 && registrations.length > 0) {
      const recentWebinar = webinars[0]
      const regCount = registrations.filter((r) => r.webinarId === recentWebinar.id).length
      if (regCount > 0) {
        notifications.push({
          icon: 'sparkles',
          text: `${regCount} people registered for ${recentWebinar.title}`,
          emoji: '🏆',
        })
      }
    }

    // No real data available - return an empty list rather than fake notifications

    // Cache the results
    cache.set(cacheKey, notifications)

    return NextResponse.json(notifications, {
      headers: {
        'X-Cache': 'MISS',
        'X-RateLimit-Limit': '1',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    })
  } catch (error) {
    console.error('Social proof API error:', error)
    return NextResponse.json(
      [],
      {
        status: 200,
        headers: {
          'X-Cache': 'ERROR',
          'X-RateLimit-Limit': '1',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    )
  }
}