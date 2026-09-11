import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from '@/lib/admin-firestore-compat'
import { getAdminDb } from '@/lib/firebase-server'
import type { MemberDoc } from '@/lib/firestore'

/**
 * Get a member document from Firestore by its document ID.
 */
export async function getMemberById(id: string): Promise<MemberDoc | null> {
  const db = getAdminDb()
  const ref = doc(db, 'members', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as MemberDoc
}

/**
 * Get a member document by Firebase auth UID.
 */
export async function getMemberByUid(uid: string): Promise<MemberDoc | null> {
  const db = getAdminDb()
  const snapshot = await getDocs(query(collection(db, 'members'), where('uid', '==', uid)))
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as MemberDoc
}