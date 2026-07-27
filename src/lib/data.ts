import { announcements as staticAnnouncements, eventsTimeline as staticEvents, sampleProfessionals as staticProfessionals } from '@/lib/static-data'
import type { Announcement, TimelineEvent, Professional, MemberDoc, ContactMessageDoc, NewsletterSubscriberDoc } from '@/lib/types'

// Check if Firebase is configured
function isFirebaseConfigured(): boolean {
  return !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
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
