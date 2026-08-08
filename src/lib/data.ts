import { announcements as staticAnnouncements, eventsTimeline as staticEvents, sampleProfessionals as staticProfessionals, upcomingWebinars as staticWebinars, testimonials as staticTestimonials, galleryImages as staticGalleryImages } from '@/lib/static-data'
import type { Announcement, TimelineEvent, Professional, MemberDoc, ContactMessageDoc, NewsletterSubscriberDoc, Webinar, WebinarRegistrationDoc, Testimonial, GalleryImage } from '@/lib/types'

// Check if Firebase is configured (using NEXT_PUBLIC_* env vars)
function isFirebaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
}

export async function getAnnouncements(): Promise<Announcement[]> {
  if (!isFirebaseConfigured()) return staticAnnouncements
  try {
    const { getAnnouncements: fbGetAnnouncements } = await import('@/lib/firestore')
    const docs = await fbGetAnnouncements()
    if (docs && docs.length > 0) return docs as Announcement[]
    return staticAnnouncements
  } catch {
    return staticAnnouncements
  }
}

export async function getEvents(): Promise<TimelineEvent[]> {
  if (!isFirebaseConfigured()) return staticEvents
  try {
    const { getEvents: fbGetEvents } = await import('@/lib/firestore')
    const docs = await fbGetEvents()
    if (docs && docs.length > 0) return docs as TimelineEvent[]
    return staticEvents
  } catch {
    return staticEvents
  }
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
  if (!isFirebaseConfigured()) return staticWebinars
  try {
    const { getWebinars: fbGetWebinars } = await import('@/lib/firestore')
    const docs = await fbGetWebinars()
    if (docs && docs.length > 0) return docs as Webinar[]
    return staticWebinars
  } catch {
    return staticWebinars
  }
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
  if (!isFirebaseConfigured()) return staticTestimonials
  try {
    const { getTestimonials: fbGetTestimonials } = await import('@/lib/firestore')
    const docs = await fbGetTestimonials()
    if (docs && docs.length > 0) return docs as unknown as Testimonial[]
    return staticTestimonials
  } catch {
    return staticTestimonials
  }
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!isFirebaseConfigured()) return staticGalleryImages
  try {
    const { getGalleryImages: fbGetGalleryImages } = await import('@/lib/firestore')
    const docs = await fbGetGalleryImages()
    if (docs && docs.length > 0) return docs as unknown as GalleryImage[]
    return staticGalleryImages
  } catch {
    return staticGalleryImages
  }
}
