import { getDb } from './firebase-admin'
import { Firestore } from 'firebase-admin/firestore'

const db = () => getDb()

export interface MemberDoc {
  id?: string
  fullName: string
  email: string
  phone: string
  qualification: string
  rciNumber?: string | null
  membershipType: string
  city: string
  message?: string | null
  status?: string
  createdAt?: Firestore.FieldValue | Date
  updatedAt?: Firestore.FieldValue | Date
}

export interface ContactMessageDoc {
  id?: string
  name: string
  email: string
  subject: string
  message: string
  isRead?: boolean
  createdAt?: Firestore.FieldValue | Date
  updatedAt?: Firestore.FieldValue | Date
}

export interface AnnouncementDoc {
  id?: string
  title: string
  date: string
  type: string
  content?: string | null
  isActive?: boolean
  createdAt?: Firestore.FieldValue | Date
  updatedAt?: Firestore.FieldValue | Date
}

export interface EventDoc {
  id?: string
  title: string
  date: string
  location: string
  description?: string | null
  isActive?: boolean
  createdAt?: Firestore.FieldValue | Date
  updatedAt?: Firestore.FieldValue | Date
}

export interface NewsletterSubscriberDoc {
  id?: string
  email: string
  isActive?: boolean
  createdAt?: Firestore.FieldValue | Date
  updatedAt?: Firestore.FieldValue | Date
}

export async function createMember(data: MemberDoc) {
  const ref = await db().collection('members').add({
    ...data,
    status: data.status ?? 'pending',
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    rciNumber: data.rciNumber ?? null,
    message: data.message ?? null,
  })
  return { id: ref.id }
}

export async function getMembers() {
  const snapshot = await db().collection('members').orderBy('createdAt', 'desc').get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createContactMessage(data: ContactMessageDoc) {
  const ref = await db().collection('contactMessages').add({
    ...data,
    isRead: data.isRead ?? false,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: ref.id }
}

export async function getContactMessages() {
  const snapshot = await db().collection('contactMessages').orderBy('createdAt', 'desc').get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createAnnouncement(data: AnnouncementDoc) {
  const ref = await db().collection('announcements').add({
    ...data,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    content: data.content ?? null,
  })
  return { id: ref.id }
}

export async function getAnnouncements() {
  const snapshot = await db().collection('announcements').orderBy('createdAt', 'desc').get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createEvent(data: EventDoc) {
  const ref = await db().collection('events').add({
    ...data,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    description: data.description ?? null,
  })
  return { id: ref.id }
}

export async function getEvents() {
  const snapshot = await db().collection('events').orderBy('createdAt', 'desc').get()
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function upsertNewsletterSubscriber(email: string) {
  const docRef = db().collection('newsletterSubscribers').doc(email.toLowerCase())
  await docRef.set(
    {
      email: email.toLowerCase(),
      isActive: true,
      updatedAt: new Date(),
    },
    { merge: true }
  )
  return { id: docRef.id }
}

export async function getNewsletterSubscribers() {
  const snapshot = await db().collection('newsletterSubscribers').where('isActive', '==', true).orderBy('createdAt', 'desc').get()
  const subscribers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return { subscribers, count: subscribers.length }
}
