import { getDb } from './firebase-admin'
import { FieldValue } from 'firebase/firestore'
import type { TestimonialDoc, GalleryImageDoc, PublicationDoc, PublicationSubmissionDoc } from '@/lib/types'

const db = () => getDb()

export interface MemberDoc {
  id?: string
  uid?: string | null
  fullName: string
  email: string
  phone: string
  qualification: string
  rciNumber?: string | null
  membershipType: string
  course?: string | null
  currentYear?: string | null
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
  countdownEnabled?: boolean
  countdownDate?: string | null
  badgeLabel?: string | null
  registrationLink?: string | null
  registrationLabel?: string | null
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

export interface NewsletterCampaignDoc {
  id?: string
  title: string
  subject: string
  content: string
  status: 'draft' | 'sent'
  sentAt?: FieldValue | Date | null
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
  registrationLink?: string | null
  meetingLink?: string | null
  type?: 'paid' | 'free'
  isActive?: boolean
  maxAttendees?: number | null
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
  webinarType?: 'paid' | 'free'
  transactionNumber?: string | null
  message?: string | null
  declaration: boolean
  status?: 'pending' | 'confirmed' | 'rejected'
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

export type UserRole = 'admin' | 'member' | 'user'

export interface UserDoc {
  id?: string
  uid: string
  email: string
  displayName?: string | null
  role: UserRole
  createdAt?: FieldValue | Date
  updatedAt?: FieldValue | Date
}

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore'

// User role management (role-based access control)
export async function createUserRecord(data: UserDoc) {
  const ref = doc(db(), 'users', data.uid)
  await setDoc(
    ref,
    {
      uid: data.uid,
      email: data.email.toLowerCase(),
      displayName: data.displayName ?? null,
      role: data.role ?? 'user',
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    },
    { merge: true }
  )
  return { id: ref.id }
}

export async function getUserByUid(uid: string): Promise<UserDoc | null> {
  const ref = doc(db(), 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as UserDoc
}

export async function createMember(data: MemberDoc) {
  const ref = await addDoc(collection(db(), 'members'), {
    ...data,
    uid: data.uid ?? null,
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

export async function getMemberByUid(uid: string): Promise<MemberDoc | null> {
  const snapshot = await getDocs(query(collection(db(), 'members'), where('uid', '==', uid)))
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as MemberDoc
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

export async function updateContactMessage(id: string, data: Partial<ContactMessageDoc>) {
  const ref = doc(db(), 'contactMessages', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteContactMessage(id: string) {
  const ref = doc(db(), 'contactMessages', id)
  await deleteDoc(ref)
  return { id }
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
    countdownEnabled: data.countdownEnabled ?? false,
    countdownDate: data.countdownDate ?? null,
    badgeLabel: data.badgeLabel ?? null,
    registrationLink: data.registrationLink ?? null,
    registrationLabel: data.registrationLabel ?? null,
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
      createdAt: new Date(),
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
  const subscribers = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      email: data.email,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
    }
  })
  return { subscribers, count: subscribers.length }
}

export async function deleteNewsletterSubscriber(id: string) {
  const ref = doc(db(), 'newsletterSubscribers', id)
  await deleteDoc(ref)
  return { id }
}

// Newsletter Campaign CRUD operations
export async function createNewsletterCampaign(data: NewsletterCampaignDoc) {
  const ref = await addDoc(collection(db(), 'newsletterCampaigns'), {
    ...data,
    status: data.status ?? 'draft',
    sentAt: data.sentAt ?? null,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: ref.id }
}

export async function getNewsletterCampaigns() {
  const snapshot = await getDocs(query(collection(db(), 'newsletterCampaigns'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateNewsletterCampaign(id: string, data: Partial<NewsletterCampaignDoc>) {
  const ref = doc(db(), 'newsletterCampaigns', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteNewsletterCampaign(id: string) {
  const ref = doc(db(), 'newsletterCampaigns', id)
  await deleteDoc(ref)
  return { id }
}

// Webinar CRUD operations
export async function createWebinar(data: WebinarDoc) {
  const ref = await addDoc(collection(db(), 'webinars'), {
    ...data,
    type: data.type ?? 'paid',
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    description: data.description ?? null,
    registrationLink: data.registrationLink ?? null,
    meetingLink: data.meetingLink ?? null,
    maxAttendees: data.maxAttendees ?? null,
  })
  return { id: ref.id }
}

export async function getWebinars() {
  const snapshot = await getDocs(query(collection(db(), 'webinars'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getWebinarById(id: string) {
  const ref = doc(db(), 'webinars', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as WebinarDoc
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
    webinarType: data.webinarType ?? 'paid',
    status: data.status ?? 'pending',
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
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
    }
  })
}

export async function getWebinarRegistrationsByEmail(email: string): Promise<WebinarRegistrationDoc[]> {
  const snapshot = await getDocs(
    query(collection(db(), 'webinarRegistrations'), where('email', '==', email.toLowerCase()), orderBy('createdAt', 'desc'))
  )
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
    } as WebinarRegistrationDoc
  })
}

export async function getWebinarRegistrationCount(webinarId: string) {
  const snapshot = await getDocs(
    query(collection(db(), 'webinarRegistrations'), where('webinarId', '==', webinarId))
  )
  return snapshot.size
}

export async function updateWebinarRegistration(id: string, data: Partial<WebinarRegistrationDoc>) {
  const ref = doc(db(), 'webinarRegistrations', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteWebinarRegistration(id: string) {
  const ref = doc(db(), 'webinarRegistrations', id)
  await deleteDoc(ref)
  return { id }
}

// Testimonial CRUD operations
export async function createTestimonial(data: TestimonialDoc) {
  const ref = await addDoc(collection(db(), 'testimonials'), {
    ...data,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: ref.id }
}

export async function getTestimonials() {
  const snapshot = await getDocs(query(collection(db(), 'testimonials'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateTestimonial(id: string, data: Partial<TestimonialDoc>) {
  const ref = doc(db(), 'testimonials', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteTestimonial(id: string) {
  const ref = doc(db(), 'testimonials', id)
  await deleteDoc(ref)
  return { id }
}

// Gallery CRUD operations
export async function createGalleryImage(data: GalleryImageDoc) {
  const ref = await addDoc(collection(db(), 'galleryImages'), {
    ...data,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: ref.id }
}

export async function getGalleryImages() {
  const snapshot = await getDocs(query(collection(db(), 'galleryImages'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateGalleryImage(id: string, data: Partial<GalleryImageDoc>) {
  const ref = doc(db(), 'galleryImages', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteGalleryImage(id: string) {
  const ref = doc(db(), 'galleryImages', id)
  await deleteDoc(ref)
  return { id }
}

// Publication CRUD operations
export async function createPublication(data: PublicationDoc) {
  const ref = await addDoc(collection(db(), 'publications'), {
    ...data,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    author: data.author ?? null,
    fileUrl: data.fileUrl ?? null,
    link: data.link ?? null,
  })
  return { id: ref.id }
}

export async function getPublications() {
  const snapshot = await getDocs(query(collection(db(), 'publications'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updatePublication(id: string, data: Partial<PublicationDoc>) {
  const ref = doc(db(), 'publications', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deletePublication(id: string) {
  const ref = doc(db(), 'publications', id)
  await deleteDoc(ref)
  return { id }
}

// Publication Submission CRUD operations
export async function createPublicationSubmission(data: PublicationSubmissionDoc) {
  const ref = await addDoc(collection(db(), 'publicationSubmissions'), {
    ...data,
    status: data.status ?? 'pending',
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    abstract: data.abstract ?? null,
    fileUrl: data.fileUrl ?? null,
  })
  return { id: ref.id }
}

export async function getPublicationSubmissions() {
  const snapshot = await getDocs(query(collection(db(), 'publicationSubmissions'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getPublicationSubmissionsByEmail(email: string): Promise<PublicationSubmissionDoc[]> {
  const snapshot = await getDocs(
    query(collection(db(), 'publicationSubmissions'), where('authorEmail', '==', email.toLowerCase()), orderBy('createdAt', 'desc'))
  )
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PublicationSubmissionDoc[]
}

export async function updatePublicationSubmission(id: string, data: Partial<PublicationSubmissionDoc>) {
  const ref = doc(db(), 'publicationSubmissions', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  })
  return { id }
}

export async function deletePublicationSubmission(id: string) {
  const ref = doc(db(), 'publicationSubmissions', id)
  await deleteDoc(ref)
  return { id }
}
