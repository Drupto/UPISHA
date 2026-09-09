import { sampleProfessionals as staticProfessionals } from '@/lib/static-data'
import type { Announcement, TimelineEvent, Professional, MemberDoc, ContactMessageDoc, NewsletterSubscriberDoc, Webinar, WebinarRegistrationDoc, Testimonial, GalleryImage, Publication } from '@/lib/types'

// Check if Firebase is configured (using NEXT_PUBLIC_* env vars)
function isFirebaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
}

const PUBLIC_CACHE_TTL_MS = 60 * 1000
const publicDataCache = new Map<string, { value: unknown; expiresAt: number }>()

// In-process TTL cache for public collections. Portable safety net on top of
// CDN Cache-Control headers: on warm instances this skips the Firestore
// round-trip entirely (works the same on Netlify and Firebase Hosting).
async function withPublicDataCache<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const cached = publicDataCache.get(key)
  if (cached && cached.expiresAt > now) return cached.value as T
  const value = await loader()
  publicDataCache.set(key, { value, expiresAt: now + PUBLIC_CACHE_TTL_MS })
  return value
}

export async function getAnnouncements(): Promise<Announcement[]> {
  if (!isFirebaseConfigured()) return []
  return withPublicDataCache('announcements', async () => {
    try {
      const { getAnnouncements: fbGetAnnouncements } = await import('@/lib/firestore')
      const docs = await fbGetAnnouncements()
      if (docs && docs.length > 0) return docs as Announcement[]
      return []
    } catch {
      return []
    }
  })
}

export async function getEvents(): Promise<TimelineEvent[]> {
  if (!isFirebaseConfigured()) return []
  return withPublicDataCache('events', async () => {
    try {
      const { getEvents: fbGetEvents } = await import('@/lib/firestore')
      const docs = await fbGetEvents()
      if (docs && docs.length > 0) return docs as TimelineEvent[]
      return []
    } catch {
      return []
    }
  })
}

export async function getProfessionals(): Promise<Professional[]> {
  return staticProfessionals
}

export async function getMembers(): Promise<MemberDoc[]> {
  if (!isFirebaseConfigured()) return []
  try {
    const { getMembers: fbGetMembers } = await import('@/lib/firestore')
    return await fbGetMembers() as MemberDoc[]
  } catch {
    return []
  }
}

export async function getContactMessages(): Promise<ContactMessageDoc[]> {
  if (!isFirebaseConfigured()) return []
  try {
    const { getContactMessages: fbGetMessages } = await import('@/lib/firestore')
    return await fbGetMessages() as ContactMessageDoc[]
  } catch {
    return []
  }
}

export async function getNewsletterSubscribers(): Promise<{ subscribers: NewsletterSubscriberDoc[]; count: number }> {
  if (!isFirebaseConfigured()) return { subscribers: [], count: 0 }
  try {
    const { getNewsletterSubscribers: fbGetSubs } = await import('@/lib/firestore')
    return await fbGetSubs() as { subscribers: NewsletterSubscriberDoc[]; count: number }
  } catch {
    return { subscribers: [], count: 0 }
  }
}

export async function getWebinars(): Promise<Webinar[]> {
  if (!isFirebaseConfigured()) return []
  return withPublicDataCache('webinars', async () => {
    try {
      const { getWebinars: fbGetWebinars } = await import('@/lib/firestore')
      const docs = await fbGetWebinars()
      if (docs && docs.length > 0) return docs as Webinar[]
      return []
    } catch {
      return []
    }
  })
}

export async function getWebinarRegistrations(): Promise<WebinarRegistrationDoc[]> {
  if (!isFirebaseConfigured()) return []
  try {
    const { getWebinarRegistrations: fbGetRegistrations } = await import('@/lib/firestore')
    return await fbGetRegistrations() as WebinarRegistrationDoc[]
  } catch {
    return []
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isFirebaseConfigured()) return []
  return withPublicDataCache('testimonials', async () => {
    try {
      const { getTestimonials: fbGetTestimonials } = await import('@/lib/firestore')
      const docs = await fbGetTestimonials()
      return (docs || []) as unknown as Testimonial[]
    } catch (error) {
      console.error('Failed to fetch testimonials from Firestore:', error)
      return []
    }
  })
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!isFirebaseConfigured()) return []
  return withPublicDataCache('galleryImages', async () => {
    try {
      const { getGalleryImages: fbGetGalleryImages } = await import('@/lib/firestore')
      const docs = await fbGetGalleryImages()
      if (docs && docs.length > 0) return docs as unknown as GalleryImage[]
      return []
    } catch {
      return []
    }
  })
}

export async function getPublications(): Promise<Publication[]> {
  if (!isFirebaseConfigured()) return []
  return withPublicDataCache('publications', async () => {
    try {
      const { getPublications: fbGetPublications } = await import('@/lib/firestore')
      const docs = await fbGetPublications()
      if (docs && docs.length > 0) return docs as unknown as Publication[]
      return []
    } catch {
      return []
    }
  })
}
