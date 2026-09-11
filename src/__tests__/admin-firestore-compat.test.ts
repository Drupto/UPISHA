/**
 * @jest-environment node
 *
 * Unit tests for the client-SDK-compatible facade over the Firebase Admin
 * SDK (admin-firestore-compat). The Admin DB singleton is mocked; these
 * tests verify the FACADE behavior: argument-shape compatibility with the
 * client SDK (doc 2-vs-3 args, query re-wrapping, exists() as a method,
 * transaction handle shape, increment()).
 */
import { collection, doc, query, where, orderBy, limit, getDoc, runTransaction, increment } from '@/lib/admin-firestore-compat'
import { getAdminDb } from '@/lib/firebase-server'
import { FieldValue } from 'firebase-admin/firestore'

jest.mock('@/lib/firebase-server', () => ({
  getAdminDb: jest.fn(),
}))

const mockGetAdminDb = getAdminDb as jest.Mock

beforeEach(() => {
  mockGetAdminDb.mockReset()
})

describe('collection() / doc() argument shapes', () => {
  it('collection(db, name) resolves via the Admin DB singleton', () => {
    const fakeCollection = { doc: jest.fn() }
    const fakeDb = { collection: jest.fn(() => fakeCollection) }
    mockGetAdminDb.mockReturnValue(fakeDb)

    const ref = collection(fakeDb, 'members')
    expect(fakeDb.collection).toHaveBeenCalledWith('members')
    expect(ref).toBe(fakeCollection)
  })

  it('doc(db, col, id) → db.collection(col).doc(id)', () => {
    const fakeDocRef = { id: 'm1' }
    const fakeCollection = { doc: jest.fn(() => fakeDocRef) }
    const fakeDb = { collection: jest.fn(() => fakeCollection) }
    mockGetAdminDb.mockReturnValue(fakeDb)

    const ref = doc(fakeDb, 'members', 'm1')
    expect(fakeDb.collection).toHaveBeenCalledWith('members')
    expect(fakeCollection.doc).toHaveBeenCalledWith('m1')
    expect(ref).toBe(fakeDocRef)
  })

  it('doc(collectionRef, id) → collectionRef.doc(id)', () => {
    const fakeDocRef = { id: 'm2' }
    const fakeCollection = { doc: jest.fn(() => fakeDocRef) }

    const ref = doc(fakeCollection, 'm2')
    expect(fakeCollection.doc).toHaveBeenCalledWith('m2')
    expect(ref).toBe(fakeDocRef)
  })
})

describe('query() constraint application', () => {
  const makeChainable = () => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  })

  it('applies where/orderBy/limit constraints in order to a CollectionReference', () => {
    const base = makeChainable()
    const q = query(
      base as never,
      where('email', '==', 'a@b.com'),
      orderBy('createdAt', 'desc'),
      limit(5)
    )
    expect(base.where).toHaveBeenCalledWith('email', '==', 'a@b.com')
    expect(base.orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    expect(base.limit).toHaveBeenCalledWith(5)
    expect(q).toBe(base)
  })

  it('supports re-wrapping an already-constrained query (client pattern)', () => {
    const base = makeChainable()
    const once = query(base as never, where('type', '==', 'webinar'))
    expect(once).toBe(base)

    // Re-wrap the query result — the facade accepts either form
    const twice = query(once as never, where('accountType', 'in', ['all']))
    expect(base.where).toHaveBeenCalledWith('accountType', 'in', ['all'])
    expect(twice).toBe(base)
  })

  it('passes the `in` operator through untouched', () => {
    const base = makeChainable()
    query(base as never, where('status', 'in', ['draft', 'sent']))
    expect(base.where).toHaveBeenCalledWith('status', 'in', ['draft', 'sent'])
  })
})

describe('getDoc() snapshot normalization', () => {
  it('exposes exists() as a METHOD over the Admin boolean property', async () => {
    const fakeRef = {
      get: jest.fn().mockResolvedValue({ exists: true, id: 'd1', data: () => ({ a: 1 }) }),
    }
    const snap = await getDoc(fakeRef as never)
    expect(snap.exists()).toBe(true)
    expect(snap.id).toBe('d1')
    expect(snap.data().a).toBe(1)
  })

  it('maps Admin exists:false to exists() === false', async () => {
    const fakeRef = {
      get: jest.fn().mockResolvedValue({ exists: false, id: 'd2', data: () => undefined }),
    }
    const snap = await getDoc(fakeRef as never)
    expect(snap.exists()).toBe(false)
  })
})

describe('runTransaction() compat handle', () => {
  it('wraps Admin transaction ops with client-style snapshot shape', async () => {
    const rawSnap = { exists: true, id: 'r1', data: () => ({ count: 2 }) }
    const tx = {
      get: jest.fn().mockResolvedValue(rawSnap),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    }
    const fakeDb = { runTransaction: jest.fn((fn: (t: unknown) => Promise<string>) => fn(tx)) }
    mockGetAdminDb.mockReturnValue(fakeDb)
    const fakeRef = { id: 'r1' }

    const result = await runTransaction(fakeDb, async (t) => {
      const s = await t.get(fakeRef as never)
      expect(s.exists()).toBe(true) // boolean → method normalization
      expect(s.data().count).toBe(2)
      await t.set(fakeRef as never, { a: 1 }, { merge: true })
      await t.update(fakeRef as never, { b: 2 })
      return 'ok'
    })

    expect(result).toBe('ok')
    expect(tx.set).toHaveBeenCalledWith(fakeRef, { a: 1 }, { merge: true })
    expect(tx.update).toHaveBeenCalledWith(fakeRef, { b: 2 })
  })
})

describe('increment()', () => {
  it('produces an Admin FieldValue equivalent to FieldValue.increment(n)', () => {
    const produced = increment(5) as unknown as { isEqual(other: unknown): boolean }
    expect(produced.isEqual(FieldValue.increment(5))).toBe(true)
  })
})
