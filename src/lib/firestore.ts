// ⚠️ SERVER-ONLY module — do not import from client components.
//
// All Firestore access runs through the Firebase Admin SDK
// (./firebase-server), behind the client-SDK-compatible facade in
// ./admin-firestore-compat so the CRUD helpers below keep their original
// call signatures. Admin SDK calls bypass the Firestore security rules —
// access control is enforced by the API layer (requireAuth / requireAdmin /
// requireVerifiedMember) before reaching this code.
import { getAdminDb } from './firebase-server'
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
  runTransaction,
  FieldValue,
} from './admin-firestore-compat'
import type { TestimonialDoc, GalleryImageDoc, PublicationDoc, PublicationSubmissionDoc, CertificateTemplateDoc, CertificateDoc, ReceiptDoc } from '@/lib/types'

const db = () => getAdminDb()

/**
 * Pick only the allowed fields from a partial update object.
 * Prevents mass assignment / arbitrary-field injection (H1).
 */
function pickFields<T extends object>(data: Partial<T>, allowed: readonly (keyof T)[]): Partial<T> {
  const result: Partial<T> = {}
  for (const key of allowed) {
    if (key in data && data[key] !== undefined) {
      ;(result as Record<string, unknown>)[key as string] = data[key]
    }
  }
  return result
}

const MEMBER_UPDATE_FIELDS = [
  'fullName', 'email', 'phone', 'qualification', 'rciNumber', 'membershipType',
  'course', 'currentYear', 'city', 'transactionNumber', 'message', 'address',
  'photoUrl', 'rciCertificateUrl', 'registrationDate', 'status',
] as const

const CERT_TEMPLATE_UPDATE_FIELDS = [
  'name', 'accountType', 'category', 'title', 'subtitle', 'titleFont', 'subtitleFont',
  'textBlocks', 'footerText', 'logoUrl', 'signatureUrl', 'stampUrl', 'backgroundUrl',
  'borderColor', 'accentColor', 'fontFamily', 'isActive', 'isDefault',
] as const

const CERT_UPDATE_FIELDS = [
  'templateId', 'type', 'memberId', 'memberUid', 'memberName', 'membershipType',
  'email', 'webinarId', 'webinarTitle', 'webinarDate', 'webinarSpeaker', 'webinarDuration',
  'registrationId', 'registrationNumber', 'qualification', 'certificateNumber', 'issueDate', 'status',
] as const

const RECEIPT_UPDATE_FIELDS = [
  'receiptNumber', 'memberId', 'memberUid', 'memberName', 'memberEmail', 'transactionType',
  'description', 'amount', 'currency', 'transactionNumber', 'paymentMethod', 'status', 'issuedAt',
] as const

const CONTACT_UPDATE_FIELDS = [
  'name', 'email', 'subject', 'message', 'isRead',
] as const

const ANNOUNCEMENT_UPDATE_FIELDS = [
  'title', 'date', 'type', 'content', 'isActive',
] as const

const EVENT_UPDATE_FIELDS = [
  'title', 'date', 'location', 'description',
  'isActive', 'countdownEnabled', 'countdownDate', 'badgeLabel', 'registrationLink', 'registrationLabel',
] as const

const CAMPAIGN_UPDATE_FIELDS = [
  'title', 'subject', 'content', 'status', 'sentAt',
] as const

const WEBINAR_UPDATE_FIELDS = [
  'title', 'date', 'time', 'speaker', 'duration', 'description', 'registrationLink',
  'meetingLink', 'type', 'price', 'isActive', 'maxAttendees',
] as const

const WEBINAR_REG_UPDATE_FIELDS = [
  'fullName', 'email', 'phone', 'qualification', 'city', 'webinarId', 'webinarTitle',
  'webinarType', 'transactionNumber', 'registrationNumber', 'message', 'status',
] as const

const TESTIMONIAL_UPDATE_FIELDS = [
  'name', 'role', 'content', 'rating', 'isActive',
] as const

const GALLERY_UPDATE_FIELDS = [
  'src', 'title', 'category', 'isActive',
] as const

const PUBLICATION_UPDATE_FIELDS = [
  'title', 'description', 'type', 'author', 'fileUrl', 'link', 'isActive',
] as const

const PUB_SUBMISSION_UPDATE_FIELDS = [
  'title', 'description', 'type', 'authorName', 'authorEmail', 'abstract', 'fileUrl', 'status',
] as const

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
  price?: number | null
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
  registrationNumber?: string | null
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

// Client-SDK import removed — server-side access is Admin-SDK-only now
// (see header comment at the top of this file).

// Certificate Template CRUD operations
export async function createCertificateTemplate(data: CertificateTemplateDoc) {
  const ref = await addDoc(collection(db(), 'certificateTemplates'), {
    ...data,
    isActive: data.isActive ?? true,
    isDefault: data.isDefault ?? false,
    logoUrl: data.logoUrl ?? null,
    signatureUrl: data.signatureUrl ?? null,
    stampUrl: data.stampUrl ?? null,
    backgroundUrl: data.backgroundUrl ?? null,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: ref.id }
}

export async function getCertificateTemplates(): Promise<CertificateTemplateDoc[]> {
  const snapshot = await getDocs(query(collection(db(), 'certificateTemplates'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CertificateTemplateDoc)
}

export async function getCertificateTemplateById(id: string): Promise<CertificateTemplateDoc | null> {
  const ref = doc(db(), 'certificateTemplates', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as CertificateTemplateDoc
}

export async function getActiveCertificateTemplateByType(accountType: string): Promise<CertificateTemplateDoc | null> {
  return getActiveCertificateTemplate({ accountType })
}

/**
 * Get the active certificate template matching a category and/or account type.
 * Webinar templates are matched by category; membership templates by account type.
 */
export async function getActiveCertificateTemplate(
  opts: { accountType?: string; category?: string } = {}
): Promise<CertificateTemplateDoc | null> {
  const { accountType, category } = opts
  try {
    let q = query(
      collection(db(), 'certificateTemplates'),
      where('isActive', '==', true)
    )
    if (category) {
      q = query(q, where('category', '==', category))
    }
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      // Fall back to category-less 'all' membership templates for webinar
      if (category === 'webinar') {
        const allSnap = await getDocs(
          query(
            collection(db(), 'certificateTemplates'),
            where('accountType', 'in', ['all']),
            where('isActive', '==', true)
          )
        )
        if (allSnap.empty) return null
        const first = allSnap.docs[0]
        return { id: first.id, ...first.data() } as CertificateTemplateDoc
      }
      return null
    }

    let candidates = snapshot.docs
    if (accountType) {
      const exact = candidates.find((d) => d.data().accountType === accountType)
      if (exact) return { id: exact.id, ...exact.data() } as CertificateTemplateDoc
      const fallback = candidates.find((d) => d.data().accountType === 'all')
      candidates = fallback ? [fallback] : candidates
    }
    const selected = candidates[0]
    return { id: selected.id, ...selected.data() } as CertificateTemplateDoc
  } catch (error) {
    // Fallback: fetch all templates and filter in memory (avoids composite index requirement)
    console.error('getActiveCertificateTemplate query failed, falling back to in-memory filter:', error)
    try {
      const allTemplates = await getCertificateTemplates()
      let active = allTemplates.filter((t) => t.isActive !== false)
      if (category) active = active.filter((t) => (t.category || 'membership') === category)
      let selected = active[0] || null
      if (selected && accountType) {
        const exact = active.find((t) => t.accountType === accountType)
        const fallback = active.find((t) => t.accountType === 'all')
        selected = exact || fallback || selected
      }
      return selected
    } catch (fallbackError) {
      console.error('Fallback template lookup also failed:', fallbackError)
      return null
    }
  }
}

export async function updateCertificateTemplate(id: string, data: Partial<CertificateTemplateDoc>) {
  const ref = doc(db(), 'certificateTemplates', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    throw new Error('Template not found')
  }
  await updateDoc(ref, {
    ...pickFields(data, CERT_TEMPLATE_UPDATE_FIELDS),
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteCertificateTemplate(id: string) {
  const ref = doc(db(), 'certificateTemplates', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    throw new Error('Template not found')
  }
  await deleteDoc(ref)
  return { id }
}

/**
 * Set a template as the default, ensuring only one default exists.
 * Uses a transaction so concurrent updates cannot create multiple defaults.
 */
export async function setDefaultCertificateTemplate(id: string, adminUid?: string) {
  const dbInstance = db()
  const templatesRef = collection(dbInstance, 'certificateTemplates')
  const targetRef = doc(templatesRef, id)

  // Fetch current default template IDs outside the transaction
  // (client SDK transactions only support DocumentReference reads)
  const allSnap = await getDocs(templatesRef)
  const otherDefaultIds = allSnap.docs
    .filter((d) => d.id !== id && d.data().isDefault === true)
    .map((d) => d.id)

  await runTransaction(dbInstance, async (transaction) => {
    const targetSnap = await transaction.get(targetRef)
    if (!targetSnap.exists()) {
      throw new Error('Template not found')
    }

    // Unset isDefault on all other templates
    for (const otherId of otherDefaultIds) {
      transaction.update(doc(templatesRef, otherId), { isDefault: false })
    }

    transaction.update(targetRef, {
      isDefault: true,
      updatedAt: new Date(),
      ...(adminUid ? { updatedBy: adminUid } : {}),
    })
  })

  return { id }
}

// Certificate CRUD operations
export async function createCertificate(data: CertificateDoc) {
  const ref = await addDoc(collection(db(), 'certificates'), {
    ...data,
    status: data.status ?? 'issued',
    qualification: data.qualification ?? null,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: ref.id }
}

/**
 * Idempotent certificate creation.
 *
 * Writes to a deterministic document ID derived from the certificate number
 * so concurrent issuance attempts (admin approval, member backfill, manual
 * admin issue, retries, double-clicks) converge on a single document instead
 * of duplicating certificates. Used for both membership certificates
 * (`UPISHA-<memberId>`) and webinar certificates (`UPISHA-WEB-<registrationId>`).
 */
export async function upsertCertificate(data: CertificateDoc) {
  if (!data.certificateNumber) throw new Error('upsertMembershipCertificate requires a certificateNumber')
  const ref = doc(db(), 'certificates', data.certificateNumber)
  await setDoc(ref, {
    ...data,
    status: data.status ?? 'issued',
    qualification: data.qualification ?? null,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: data.certificateNumber }
}

export async function getCertificates(): Promise<CertificateDoc[]> {
  const snapshot = await getDocs(query(collection(db(), 'certificates'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
    } as CertificateDoc
  })
}

export async function getCertificatesByMemberUid(memberUid: string): Promise<CertificateDoc[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'certificates'), where('memberUid', '==', memberUid), orderBy('createdAt', 'desc'))
    )
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
      } as CertificateDoc
    })
  } catch (error) {
    // Fallback: fetch all certificates and filter in memory (avoids composite index requirement)
    console.error('getCertificatesByMemberUid query failed, falling back to in-memory filter:', error)
    try {
      const allCerts = await getCertificates()
      return allCerts
        .filter((c) => c.memberUid === memberUid)
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })
    } catch (fallbackError) {
      console.error('Fallback certificate lookup also failed:', fallbackError)
      return []
    }
  }
}

export async function getCertificatesByEmail(email: string): Promise<CertificateDoc[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'certificates'), where('email', '==', email.toLowerCase()), orderBy('createdAt', 'desc'))
    )
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
      } as CertificateDoc
    })
  } catch (error) {
    // Fallback: fetch all certificates and filter in memory (avoids composite index requirement)
    console.error('getCertificatesByEmail query failed, falling back to in-memory filter:', error)
    try {
      const allCerts = await getCertificates()
      return allCerts
        .filter((c) => (c.email || '').toLowerCase() === email.toLowerCase())
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })
    } catch (fallbackError) {
      console.error('Fallback certificate email lookup also failed:', fallbackError)
      return []
    }
  }
}

export async function getCertificatesByMemberId(memberId: string): Promise<CertificateDoc[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'certificates'), where('memberId', '==', memberId), orderBy('createdAt', 'desc'))
    )
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
      } as CertificateDoc
    })
  } catch (error) {
    // Fallback: fetch all certificates and filter in memory (avoids composite index requirement)
    console.error('getCertificatesByMemberId query failed, falling back to in-memory filter:', error)
    try {
      const allCerts = await getCertificates()
      return allCerts
        .filter((c) => c.memberId === memberId)
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })
    } catch (fallbackError) {
      console.error('Fallback certificate lookup also failed:', fallbackError)
      return []
    }
  }
}

export async function getCertificateById(id: string): Promise<CertificateDoc | null> {
  const ref = doc(db(), 'certificates', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as CertificateDoc
}

export async function updateCertificate(id: string, data: Partial<CertificateDoc>) {
  const ref = doc(db(), 'certificates', id)
  await updateDoc(ref, {
    ...pickFields(data, CERT_UPDATE_FIELDS),
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteCertificate(id: string) {
  const ref = doc(db(), 'certificates', id)
  await deleteDoc(ref)
  return { id }
}

// Receipt CRUD operations
export async function createReceipt(data: ReceiptDoc) {
  const ref = await addDoc(collection(db(), 'receipts'), {
    ...data,
    status: data.status ?? 'paid',
    currency: data.currency ?? 'INR',
    transactionNumber: data.transactionNumber ?? null,
    paymentMethod: data.paymentMethod ?? null,
    issuedAt: data.issuedAt ?? new Date(),
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: ref.id }
}

/**
 * Idempotent membership receipt creation.
 *
 * Writes to a deterministic document ID derived from the receipt number
 * (`UPISHA-RCPT-<memberId>`) so that concurrent creation attempts — admin
 * approval, the /api/receipts/mine lazy backfill, retries, double-clicks —
 * all converge on the SAME document instead of inserting duplicates.
 * Last write wins; the data written is identical in every path.
 */
export async function upsertMembershipReceipt(data: ReceiptDoc) {
  if (!data.receiptNumber) throw new Error('upsertMembershipReceipt requires a receiptNumber')
  const ref = doc(db(), 'receipts', data.receiptNumber)
  await setDoc(ref, {
    ...data,
    status: data.status ?? 'paid',
    currency: data.currency ?? 'INR',
    transactionNumber: data.transactionNumber ?? null,
    paymentMethod: data.paymentMethod ?? null,
    issuedAt: data.issuedAt ?? new Date(),
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  })
  return { id: data.receiptNumber }
}

export async function getReceipts() {
  const snapshot = await getDocs(query(collection(db(), 'receipts'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      issuedAt: data.issuedAt?.toDate ? data.issuedAt.toDate() : (data.issuedAt ? new Date(data.issuedAt) : null),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
    } as ReceiptDoc
  })
}

export async function getReceiptsByMemberUid(memberUid: string): Promise<ReceiptDoc[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'receipts'), where('memberUid', '==', memberUid), orderBy('createdAt', 'desc'))
    )
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        issuedAt: data.issuedAt?.toDate ? data.issuedAt.toDate() : (data.issuedAt ? new Date(data.issuedAt) : null),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
      } as ReceiptDoc
    })
  } catch (error) {
    // Fallback: fetch all receipts and filter in memory (avoids composite index requirement)
    console.error('getReceiptsByMemberUid query failed, falling back to in-memory filter:', error)
    try {
      const allReceipts = await getReceipts()
      return allReceipts
        .filter((r) => r.memberUid === memberUid)
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })
    } catch (fallbackError) {
      console.error('Fallback receipt lookup also failed:', fallbackError)
      return []
    }
  }
}

export async function getReceiptsByMemberId(memberId: string): Promise<ReceiptDoc[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'receipts'), where('memberId', '==', memberId), orderBy('createdAt', 'desc'))
    )
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        issuedAt: data.issuedAt?.toDate ? data.issuedAt.toDate() : (data.issuedAt ? new Date(data.issuedAt) : null),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
      } as ReceiptDoc
    })
  } catch (error) {
    // Fallback: fetch all receipts and filter in memory (avoids composite index requirement)
    console.error('getReceiptsByMemberId query failed, falling back to in-memory filter:', error)
    try {
      const allReceipts = await getReceipts()
      return allReceipts
        .filter((r) => r.memberId === memberId)
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })
    } catch (fallbackError) {
      console.error('Fallback receipt lookup also failed:', fallbackError)
      return []
    }
  }
}

/**
 * Receipts for webinar registrations are keyed by the registration email
 * (memberEmail), since registrations happen pre-login on the public site.
 * This lookup lets members see those receipts in their profile - mirroring
 * getCertificatesByEmail which covers the same situation for certificates.
 */
export async function getReceiptsByEmail(email: string): Promise<ReceiptDoc[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'receipts'), where('memberEmail', '==', email.toLowerCase()), orderBy('createdAt', 'desc'))
    )
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        issuedAt: data.issuedAt?.toDate ? data.issuedAt.toDate() : (data.issuedAt ? new Date(data.issuedAt) : null),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
      } as ReceiptDoc
    })
  } catch (error) {
    // Fallback: fetch all receipts and filter in memory (avoids composite index requirement)
    console.error('getReceiptsByEmail query failed, falling back to in-memory filter:', error)
    try {
      const allReceipts = await getReceipts()
      return allReceipts
        .filter((r) => (r.memberEmail || '').toLowerCase() === email.toLowerCase())
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })
    } catch (fallbackError) {
      console.error('Fallback receipt email lookup also failed:', fallbackError)
      return []
    }
  }
}

export async function getReceiptById(id: string): Promise<ReceiptDoc | null> {
  const ref = doc(db(), 'receipts', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    issuedAt: data.issuedAt?.toDate ? data.issuedAt.toDate() : (data.issuedAt ? new Date(data.issuedAt) : null),
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
  } as ReceiptDoc
}

export async function getReceiptByReceiptNumber(receiptNumber: string): Promise<ReceiptDoc | null> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'receipts'), where('receiptNumber', '==', receiptNumber))
    )
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      issuedAt: data.issuedAt?.toDate ? data.issuedAt.toDate() : (data.issuedAt ? new Date(data.issuedAt) : null),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
    } as ReceiptDoc
  } catch (error) {
    // Fallback: fetch all receipts and filter in memory (avoids composite index requirement)
    console.error('getReceiptByReceiptNumber query failed, falling back to in-memory filter:', error)
    try {
      const allReceipts = await getReceipts()
      return allReceipts.find((r) => r.receiptNumber === receiptNumber) || null
    } catch (fallbackError) {
      console.error('Fallback receipt lookup also failed:', fallbackError)
      return null
    }
  }
}

/**
 * Find the payment receipt linked to a webinar registration.
 *
 * Webinar receipts are stored with receiptNumber `UPISHA-RCPT-WEB-<registrationId>`
 * where <registrationId> is the Firestore document id of the registration. This
 * resolves the public-facing registration number (e.g. `UPISHA-WEB-AB12CD`) to its
 * document id and returns the matching receipt, or null when none exists (e.g.
 * registration not yet confirmed by an admin).
 */
export async function getReceiptByRegistrationNumber(regNumber: string): Promise<ReceiptDoc | null> {
  const registration = await getWebinarRegistrationByRegistrationNumber(regNumber)
  if (!registration || !registration.id) return null
  return getReceiptByReceiptNumber(`UPISHA-RCPT-WEB-${registration.id}`)
}

export async function updateReceipt(id: string, data: Partial<ReceiptDoc>) {
  const ref = doc(db(), 'receipts', id)
  await updateDoc(ref, {
    ...pickFields(data, RECEIPT_UPDATE_FIELDS),
    updatedAt: new Date(),
  })
  return { id }
}

export async function deleteReceipt(id: string) {
  const ref = doc(db(), 'receipts', id)
  await deleteDoc(ref)
  return { id }
}

// Default certificate template seeds
export const DEFAULT_CERTIFICATE_TEMPLATES: Omit<CertificateTemplateDoc, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Life Member Certificate',
    accountType: 'life',
    title: 'Certificate of Life Membership',
    subtitle: 'UP ISHA — Uttar Pradesh Indian Speech & Hearing Association',
    titleFont: {
      fontSize: 32,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#b45309',
      letterSpacing: 0.02,
    },
    subtitleFont: {
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#6b7280',
      letterSpacing: 0.05,
    },
    textBlocks: [
      {
        id: 'intro',
        content: 'This is to certify that',
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#374151',
        marginTop: 12,
        marginBottom: 0,
      },
      {
        id: 'name',
        content: '{name}',
        fontSize: 48,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#0f172a',
        marginTop: 12,
        marginBottom: 8,
      },
      {
        id: 'body',
        content: 'has been enrolled as a Life Member of the Uttar Pradesh Indian Speech & Hearing Association (UP ISHA) bearing Membership ID {memberId}. We commend their dedication to the field of Audiology and Speech-Language Pathology and welcome them to our professional community.',
        fontSize: 18,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
      },
      {
        id: 'date',
        content: 'Issued on {date}',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 0,
      },
    ],
    footerText: 'President, UP ISHA',
    logoUrl: '/images/mainlogo.jpeg',
    signatureUrl: null,
    stampUrl: null,
    backgroundUrl: null,
    borderColor: '#b45309',
    accentColor: '#0d9488',
    fontFamily: 'serif',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Annual Member Certificate',
    accountType: 'annual',
    title: 'Certificate of Annual Membership',
    subtitle: 'UP ISHA — Uttar Pradesh Indian Speech & Hearing Association',
    titleFont: {
      fontSize: 32,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#0f766e',
      letterSpacing: 0.02,
    },
    subtitleFont: {
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#6b7280',
      letterSpacing: 0.05,
    },
    textBlocks: [
      {
        id: 'intro',
        content: 'This is to certify that',
        fontSize: 22,
        fontWeight: 'normal',
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#374151',
        marginTop: 12,
        marginBottom: 0,
      },
      {
        id: 'name',
        content: '{name}',
        fontSize: 44,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#0f172a',
        marginTop: 12,
        marginBottom: 8,
      },
      {
        id: 'body',
        content: 'has been enrolled as an Annual Member of the Uttar Pradesh Indian Speech & Hearing Association (UP ISHA) bearing Membership ID {memberId}. We appreciate their commitment to the advancement of Audiology and Speech-Language Pathology and welcome them to our professional community.',
        fontSize: 17,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
      },
      {
        id: 'date',
        content: 'Issued on {date}',
        fontSize: 15,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 0,
      },
    ],
    footerText: 'President, UP ISHA',
    logoUrl: '/images/mainlogo.jpeg',
    signatureUrl: null,
    stampUrl: null,
    backgroundUrl: null,
    borderColor: '#0d9488',
    accentColor: '#0f766e',
    fontFamily: 'sans-serif',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Webinar Participation Certificate',
    accountType: 'all',
    category: 'webinar',
    title: 'Certificate of Participation',
    subtitle: 'UP ISHA — Uttar Pradesh Indian Speech & Hearing Association',
    titleFont: {
      fontSize: 32,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#0d9488',
      letterSpacing: 0.02,
    },
    subtitleFont: {
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#6b7280',
      letterSpacing: 0.05,
    },
    textBlocks: [
      {
        id: 'intro',
        content: 'This is to certify that',
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#374151',
        marginTop: 12,
        marginBottom: 0,
      },
      {
        id: 'name',
        content: '{name}',
        fontSize: 46,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#0f172a',
        marginTop: 12,
        marginBottom: 8,
      },
      {
        id: 'body',
        content: 'has successfully participated in the UP ISHA webinar',
        fontSize: 20,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#374151',
        marginTop: 16,
        marginBottom: 4,
      },
      {
        id: 'webinar',
        content: '"{webinarTitle}"',
        fontSize: 26,
        fontWeight: 'bold',
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#0d9488',
        marginTop: 4,
        marginBottom: 8,
      },
      {
        id: 'speaker',
        content: 'Speaker: {webinarSpeaker}',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 8,
        marginBottom: 8,
      },
      {
        id: 'date',
        content: 'Held on {webinarDate} · Duration: {duration}',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 8,
        marginBottom: 0,
      },
    ],
    footerText: 'President, UP ISHA',
    logoUrl: '/images/mainlogo.jpeg',
    signatureUrl: null,
    stampUrl: null,
    backgroundUrl: null,
    borderColor: '#0d9488',
    accentColor: '#0d9488',
    fontFamily: 'serif',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Student Member Certificate',
    accountType: 'student',
    title: 'Certificate of Student Membership',
    subtitle: 'UP ISHA — Uttar Pradesh Indian Speech & Hearing Association',
    titleFont: {
      fontSize: 32,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#1d4ed8',
      letterSpacing: 0.02,
    },
    subtitleFont: {
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#6b7280',
      letterSpacing: 0.05,
    },
    textBlocks: [
      {
        id: 'intro',
        content: 'This is to certify that',
        fontSize: 22,
        fontWeight: 'normal',
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#374151',
        marginTop: 12,
        marginBottom: 0,
      },
      {
        id: 'name',
        content: '{name}',
        fontSize: 44,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#0f172a',
        marginTop: 12,
        marginBottom: 8,
      },
      {
        id: 'body',
        content: 'has been enrolled as a Student Member of the Uttar Pradesh Indian Speech & Hearing Association (UP ISHA) bearing Membership ID {memberId}. We appreciate their dedication to pursuing a career in Audiology and Speech-Language Pathology and welcome them to our student community.',
        fontSize: 17,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
      },
      {
        id: 'date',
        content: 'Issued on {date}',
        fontSize: 15,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 0,
      },
    ],
    footerText: 'President, UP ISHA',
    logoUrl: '/images/mainlogo.jpeg',
    signatureUrl: null,
    stampUrl: null,
    backgroundUrl: null,
    borderColor: '#2563eb',
    accentColor: '#1d4ed8',
    fontFamily: 'sans-serif',
    isActive: true,
    isDefault: true,
  },
]

export async function seedDefaultCertificateTemplates() {
  try {
    const existing = await getCertificateTemplates()
    const hasDefaults = existing.some((t) => t.isDefault === true)

    // Ensure the webinar participation template always exists even after initial seeding
    const webinarTemplate = DEFAULT_CERTIFICATE_TEMPLATES.find((t) => t.category === 'webinar')
    if (webinarTemplate && !existing.some((t) => t.name === webinarTemplate.name)) {
      await createCertificateTemplate({ ...webinarTemplate, category: 'webinar' })
      return { seeded: true }
    }

    if (hasDefaults) return { seeded: false }

    for (const template of DEFAULT_CERTIFICATE_TEMPLATES) {
      await createCertificateTemplate(template)
    }
    return { seeded: true }
  } catch (error) {
    console.error('Error seeding default certificate templates:', error)
    return { seeded: false, error }
  }
}

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

/**
 * Look up a member by email (case-insensitive). Used to link webinar
 * registrations/receipts (which only carry the registrant's email) back to
 * the member account when one exists.
 */
export async function getMemberByEmail(email: string): Promise<(MemberDoc & { uid?: string | null }) | null> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null
  try {
    const snapshot = await getDocs(query(collection(db(), 'members'), where('email', '==', normalized)))
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as MemberDoc & { uid?: string | null }
    }
  } catch (error) {
    console.error('getMemberByEmail query failed, falling back to in-memory filter:', error)
  }
  // Fallback: fetch all members and filter in memory (avoids composite index requirement)
  try {
    const all = await getMembers()
    const found = all.find((m) => ((m as { email?: string }).email || '').toLowerCase() === normalized)
    return found ? (found as MemberDoc & { uid?: string | null }) : null
  } catch (fallbackError) {
    console.error('Fallback member email lookup also failed:', fallbackError)
    return null
  }
}

export async function getMemberById(id: string): Promise<MemberDoc | null> {
  const ref = doc(db(), 'members', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as MemberDoc
}

export async function getMembers() {
  const snapshot = await getDocs(query(collection(db(), 'members'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateMember(id: string, data: Partial<MemberDoc>) {
  const ref = doc(db(), 'members', id)
  await updateDoc(ref, {
    ...pickFields(data, MEMBER_UPDATE_FIELDS),
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

export async function updateContactMessage(id: string, data: Partial<ContactMessageDoc>) {
  const ref = doc(db(), 'contactMessages', id)
  await updateDoc(ref, {
    ...pickFields(data, CONTACT_UPDATE_FIELDS),
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
    ...pickFields(data, ANNOUNCEMENT_UPDATE_FIELDS),
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
    ...pickFields(data, EVENT_UPDATE_FIELDS),
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
    ...pickFields(data, CAMPAIGN_UPDATE_FIELDS),
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
    price: data.price ?? null,
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
    ...pickFields(data, WEBINAR_UPDATE_FIELDS),
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
const REG_NUM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRegistrationNumber(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += REG_NUM_CHARS[Math.floor(Math.random() * REG_NUM_CHARS.length)]
  }
  return `UPISHA-WEB-${code}`
}

export async function createWebinarRegistration(data: WebinarRegistrationDoc) {
  const registrationNumber = data.registrationNumber || generateRegistrationNumber()
  const ref = await addDoc(collection(db(), 'webinarRegistrations'), {
    ...data,
    registrationNumber,
    webinarType: data.webinarType ?? 'paid',
    status: data.status ?? 'pending',
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
    qualification: data.qualification ?? null,
    transactionNumber: data.transactionNumber ?? null,
    message: data.message ?? null,
  })
  return { id: ref.id, registrationNumber }
}

export async function getWebinarRegistrations(): Promise<WebinarRegistrationDoc[]> {
  const snapshot = await getDocs(query(collection(db(), 'webinarRegistrations'), orderBy('createdAt', 'desc')))
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

export async function getWebinarRegistrationById(id: string): Promise<(WebinarRegistrationDoc & { id: string }) | null> {
  try {
    const ref = doc(db(), 'webinarRegistrations', id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
    } as (WebinarRegistrationDoc & { id: string })
  } catch (error) {
    console.error('getWebinarRegistrationById query failed:', error)
    return null
  }
}

export async function getWebinarRegistrationByRegistrationNumber(regNumber: string): Promise<WebinarRegistrationDoc | null> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'webinarRegistrations'), where('registrationNumber', '==', regNumber))
    )
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
    } as WebinarRegistrationDoc
  } catch (error) {
    console.error('getWebinarRegistrationByRegistrationNumber query failed, falling back to in-memory filter:', error)
    try {
      const all = await getWebinarRegistrations()
      const found = all.find((r) => r.registrationNumber === regNumber) as (WebinarRegistrationDoc & { id?: string }) | undefined
      return found || null
    } catch (fallbackError) {
      console.error('Fallback webinar registration lookup also failed:', fallbackError)
      return null
    }
  }
}

export async function getCertificatesByRegistrationId(regNumber: string): Promise<CertificateDoc[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'certificates'), where('registrationNumber', '==', regNumber), orderBy('createdAt', 'desc'))
    )
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
      } as CertificateDoc
    })
  } catch (error) {
    console.error('getCertificatesByRegistrationId query failed, falling back to in-memory filter:', error)
    try {
      const all = await getCertificates()
      return all.filter((c) => c.registrationNumber === regNumber)
    } catch (fallbackError) {
      console.error('Fallback certificate lookup also failed:', fallbackError)
      return []
    }
  }
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
    ...pickFields(data, WEBINAR_REG_UPDATE_FIELDS),
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
  try {
    const snapshot = await getDocs(query(collection(db(), 'testimonials'), orderBy('createdAt', 'desc')))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch {
    // Fallback: query without ordering in case createdAt is missing on some docs
    const snapshot = await getDocs(collection(db(), 'testimonials'))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }
}

export async function updateTestimonial(id: string, data: Partial<TestimonialDoc>) {
  const ref = doc(db(), 'testimonials', id)
  await updateDoc(ref, {
    ...pickFields(data, TESTIMONIAL_UPDATE_FIELDS),
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
    ...pickFields(data, GALLERY_UPDATE_FIELDS),
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
    ...pickFields(data, PUBLICATION_UPDATE_FIELDS),
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

export async function getPublicationSubmissionsByEmail(email: string): Promise<PublicationSubmissionDoc[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db(), 'publicationSubmissions'), where('authorEmail', '==', email.toLowerCase()), orderBy('createdAt', 'desc'))
    )
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
      } as PublicationSubmissionDoc
    })
  } catch (error) {
    // Fallback: fetch all submissions and filter in memory (avoids composite index requirement)
    console.error('getPublicationSubmissionsByEmail query failed, falling back to in-memory filter:', error)
    try {
      const allSubmissions = (await getPublicationSubmissions()) as PublicationSubmissionDoc[]
      return allSubmissions
        .filter((s) => s.authorEmail?.toLowerCase() === email.toLowerCase())
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })
    } catch (fallbackError) {
      console.error('Fallback publication submission lookup also failed:', fallbackError)
      return []
    }
  }
}

export async function updatePublicationSubmission(id: string, data: Partial<PublicationSubmissionDoc>) {
  const ref = doc(db(), 'publicationSubmissions', id)
  await updateDoc(ref, {
    ...pickFields(data, PUB_SUBMISSION_UPDATE_FIELDS),
    updatedAt: new Date(),
  })
  return { id }
}

export async function deletePublicationSubmission(id: string) {
  const ref = doc(db(), 'publicationSubmissions', id)
  await deleteDoc(ref)
  return { id }
}
