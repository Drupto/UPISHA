/**
 * Firestore client-SDK-compatible API on top of the Firebase Admin SDK.
 *
 * WHY THIS EXISTS
 * The data layer (src/lib/firestore.ts, firestore-rate-limit.ts,
 * request-logger.ts, api/certificates/helpers.ts) was written against the
 * Firebase *client* SDK (firebase/firestore). Server-side client-SDK calls
 * carry no `request.auth`, so every rules-guarded read/write (isAdmin(),
 * isOwner()) is denied once hardened security rules are deployed — and
 * collections like `rate_limits`/`api_logs` have no client-facing rules at
 * all. All server-side Firestore access must therefore run through the
 * Admin SDK (src/lib/firebase-server.ts), which bypasses security rules;
 * authorization is enforced by the API layer (requireAuth / requireAdmin /
 * requireVerifiedMember) before this code is reached.
 *
 * Rather than rewriting ~40 CRUD functions, this module re-exports the same
 * client-SDK function names implemented over the Admin SDK, so the data
 * layer keeps its original call signatures.
 *
 * ⚠️ SERVER ONLY — never import from client components. The module
 * transitively pulls in the Admin SDK (Node-only APIs).
 */
import {
  FieldValue,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type FieldPath,
  type OrderByDirection,
  type Query as AdminQuery,
  type UpdateData,
  type WhereFilterOp,
} from 'firebase-admin/firestore'
import { getAdminDb } from './firebase-server'

export { FieldValue, Timestamp }

// ─── Collection / doc refs ───────────────────────────────────────────────

/**
 * Client signature: collection(db(), 'name'). The db argument is ignored —
 * the Admin SDK singleton is always the database.
 */
export function collection(_parent: unknown, name: string): CollectionReference<DocumentData> {
  return getAdminDb().collection(name)
}

/**
 * Client signatures used in this codebase:
 *   doc(db(), 'col', id)            → 3 args
 *   doc(collection(db(), 'c'), id)  → 2 args (collection-ref form)
 */
export function doc(
  parent: unknown,
  a: string,
  b?: string
): DocumentReference<DocumentData> {
  if (b === undefined) {
    return (parent as CollectionReference<DocumentData>).doc(a)
  }
  return getAdminDb().collection(a).doc(b)
}

// ─── Query constraints ───────────────────────────────────────────────────

/**
 * Client-SDK constraints are inert descriptors combined by query().
 * Here they carry the Admin query they should be applied to.
 */
interface QueryConstraint {
  apply(q: AdminQuery<DocumentData>): AdminQuery<DocumentData>
}

export function where(
  field: string | FieldPath,
  op: WhereFilterOp,
  value: unknown
): QueryConstraint {
  return { apply: (q) => q.where(field, op, value as never) }
}

export function orderBy(
  field: string | FieldPath,
  directionStr?: OrderByDirection
): QueryConstraint {
  return { apply: (q) => q.orderBy(field, directionStr) }
}

export function limit(n: number): QueryConstraint {
  return { apply: (q) => q.limit(n) }
}

/** Client signature: query(baseRef, ...constraints) → runnable query.
 *  The base may be a CollectionReference OR an already-constrained query
 *  (client code re-wraps queries, e.g. conditional filters). */
export function query(
  base: CollectionReference<DocumentData> | AdminQuery<DocumentData>,
  ...constraints: QueryConstraint[]
): AdminQuery<DocumentData> {
  return constraints.reduce(
    (q, c) => c.apply(q),
    base as AdminQuery<DocumentData>
  )
}

// ─── Reads ───────────────────────────────────────────────────────────────

/** Admin QuerySnapshot already matches the client shape (.empty/.docs/.size). */
export async function getDocs(
  q: AdminQuery<DocumentData>
): Promise<Awaited<ReturnType<AdminQuery<DocumentData>['get']>>> {
  return q.get()
}

/**
 * Client-SDK-shaped document snapshot: `exists` is a METHOD on the client
 * but a plain boolean on the Admin SDK — this wrapper normalizes it so
 * `if (!snap.exists())` keeps working.
 */
export interface CompatDocumentSnapshot {
  exists(): boolean
  id: string
  data(): DocumentData
}

export async function getDoc(
  ref: DocumentReference<DocumentData>
): Promise<CompatDocumentSnapshot> {
  const snap = await ref.get()
  return {
    exists: () => snap.exists,
    id: snap.id,
    data: () => snap.data() as DocumentData,
  }
}

// ─── Writes ──────────────────────────────────────────────────────────────

export async function addDoc(
  coll: CollectionReference<DocumentData>,
  data: DocumentData
): Promise<DocumentReference<DocumentData>> {
  return coll.add(data)
}

export async function setDoc(
  ref: DocumentReference<DocumentData>,
  data: DocumentData,
  options?: { merge?: boolean }
): Promise<void> {
  if (options) {
    await ref.set(data, options)
  } else {
    await ref.set(data)
  }
}

export async function updateDoc(
  ref: DocumentReference<DocumentData>,
  data: UpdateData<DocumentData>
): Promise<void> {
  await ref.update(data)
}

export async function deleteDoc(
  ref: DocumentReference<DocumentData>
): Promise<void> {
  await ref.delete()
}

// ─── Transactions ────────────────────────────────────────────────────────

/** Client-SDK-shaped transaction handle (exists() as a method on snapshots). */
export interface CompatTransaction {
  get(ref: DocumentReference<DocumentData>): Promise<CompatDocumentSnapshot>
  set(
    ref: DocumentReference<DocumentData>,
    data: DocumentData,
    options?: { merge?: boolean }
  ): Promise<void>
  update(ref: DocumentReference<DocumentData>, data: UpdateData<DocumentData>): Promise<void>
  delete(ref: DocumentReference<DocumentData>): Promise<void>
}

/**
 * Client signature: runTransaction(db(), async (transaction) => {...}).
 * The db argument is ignored — Admin transactions always run on the
 * Admin Firestore singleton.
 */
export async function runTransaction<T>(
  _db: unknown,
  updateFn: (transaction: CompatTransaction) => Promise<T>
): Promise<T> {
  return getAdminDb().runTransaction(async (tx) =>
    updateFn({
      get: async (ref) => {
        const snap = await tx.get(ref)
        return {
          exists: () => snap.exists,
          id: snap.id,
          data: () => snap.data() as DocumentData,
        }
      },
      set: async (ref, data, options) => {
        if (options) {
          await tx.set(ref, data, options)
        } else {
          await tx.set(ref, data)
        }
      },
      update: async (ref, data) => {
        await tx.update(ref, data)
      },
      delete: async (ref) => {
        await tx.delete(ref)
      },
    })
  )
}

// ─── Field values ────────────────────────────────────────────────────────

/** Client signature: increment(n) → server-side atomic increment. */
export function increment(n: number): FieldValue {
  return FieldValue.increment(n)
}

