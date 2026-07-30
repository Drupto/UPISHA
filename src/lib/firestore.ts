import { getDb } from './firebase-admin'
import { FieldValue } from 'firebase/firestore'

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
  transactionNumber?: string | null
  message?: string | null
  address?: string | null
  photoUrl?: string | null
  rciCertificateUrl?: string | null
  registrationDate?: string | null
  declaration?: boolean | null
  status?: string
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

export interface ContactMessageDoc {
  id?: string
  name: string
  email: string
  subject: string
  message: string
  isRead?: boolean
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

export interface AnnouncementDoc {
  id?: string
  title: string
  date: string
  type: string
  content?: string | null
  isActive?: boolean
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

export interface EventDoc {
  id?: string
  title: string
  date: string
  location: string
  description?: string | null
  isActive?: boolean
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

export interface NewsletterSubscriberDoc {
  id?: string
  email: string
  isActive?: boolean
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

export interface WebinarDoc {
  id?: string
  title: string
  date: string
  time: string
  speaker: string
  duration: string
  description?: string | null
  registrationLink?: string
  isActive?: boolean
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

export interface WebinarRegistrationDoc {
  id?: string
  fullName: string
  email: string
  phone: string
  qualification?: string | null
  city: string
  webinarId: string
  webinarTitle: string
  transactionNumber?: string | null
  message?: string | null
  declaration: boolean
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore'

export async function createMember(data: MemberDoc) {
  const ref = await addDoc(collection(db(), 'members'), {
    ...data,
    status: data.status ?? 'pending',
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    rciNumber: data.rciNumber ?? null,
    transactionNumber: data.transactionNumber ?? null,
    message: data.message ?? null,
    address: data.address ?? null,
    photoUrl: data.photoUrl ?? null,
    rciCertificateUrl: data.rciCertificateUrl ?? null,
    registrationDate: data.registrationDate ?? null,
    declaration: data.declaration ?? null,
  })
  return { id: ref.id }
}

export async function getMembers() {
  const snapshot = await getDocs(query(collection(db(), 'members'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateMember(id: string, data: Partial<MemberDoc>) {
  const ref = doc(db(), 'members', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteMember(id: string) {
  const ref = doc(db(), 'members', id)
  await deleteDoc(ref)
  return { id }
}

export async function createContactMessage(data: ContactMessageDoc) {
  const ref = await addDoc(collection(db(), 'contactMessages'), {
    ...data,
    isRead: data.isRead ?? false,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: ref.id }
}

export async function getContactMessages() {
  const snapshot = await getDocs(query(collection(db(), 'contactMessages'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createAnnouncement(data: AnnouncementDoc) {
  const ref = await addDoc(collection(db(), 'announcements'), {
    ...data,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    content: data.content ?? null,
  })
  return { id: ref.id }
}

export async function getAnnouncements() {
  const snapshot = await getDocs(query(collection(db(), 'announcements'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateAnnouncement(id: string, data: Partial<AnnouncementDoc>) {
  const ref = doc(db(), 'announcements', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteAnnouncement(id: string) {
  const ref = doc(db(), 'announcements', id)
  await deleteDoc(ref)
  return { id }
}

export async function createEvent(data: EventDoc) {
  const ref = await addDoc(collection(db(), 'events'), {
    ...data,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    description: data.description ?? null,
  })
  return { id: ref.id }
}

export async function getEvents() {
  const snapshot = await getDocs(query(collection(db(), 'events'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateEvent(id: string, data: Partial<EventDoc>) {
  const ref = doc(db(), 'events', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteEvent(id: string) {
  const ref = doc(db(), 'events', id)
  await deleteDoc(ref)
  return { id }
}

export async function upsertNewsletterSubscriber(email: string) {
  const docRef = doc(db(), 'newsletterSubscribers', email.toLowerCase())
  await setDoc(
    docRef,
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
  const snapshot = await getDocs(
    query(collection(db(), 'newsletterSubscribers'), where('isActive', '==', true), orderBy('createdAt', 'desc'))
  )
  const subscribers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return { subscribers, count: subscribers.length }
}

// Webinar CRUD operations
export async function createWebinar(data: WebinarDoc) {
  const ref = await addDoc(collection(db(), 'webinars'), {
    ...data,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    description: data.description ?? null,
    registrationLink: data.registrationLink ?? null,
  })
  return { id: ref.id }
}

export async function getWebinars() {
  const snapshot = await getDocs(query(collection(db(), 'webinars'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateWebinar(id: string, data: Partial<WebinarDoc>) {
  const ref = doc(db(), 'webinars', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteWebinar(id: string) {
  const ref = doc(db(), 'webinars', id)
  await deleteDoc(ref)
  return { id }
}

// Webinar Registration CRUD operations
export async function createWebinarRegistration(data: WebinarRegistrationDoc) {
  const ref = await addDoc(collection(db(), 'webinarRegistrations'), {
    ...data,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    qualification: data.qualification ?? null,
    transactionNumber: data.transactionNumber ?? null,
    message: data.message ?? null,
  })
  return { id: ref.id }
}

export async function getWebinarRegistrations() {
  const snapshot = await getDocs(query(collection(db(), 'webinarRegistrations'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function deleteWebinarRegistration(id: string) {
  const ref = doc(db(), 'webinarRegistrations', id)
  await deleteDoc(ref)
  return { id }
}