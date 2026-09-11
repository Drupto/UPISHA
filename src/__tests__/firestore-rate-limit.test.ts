/**
 * @jest-environment node
 *
 * Unit tests for the Firestore-backed distributed rate limiter. The Admin
 * DB singleton and the firestore compat facade are mocked; the transaction
 * handle passed to the limiter's update function is compat-shaped
 * (exists() as a method), mirroring what runTransaction() provides.
 */
jest.mock('@/lib/firebase-server', () => ({
  getAdminDb: jest.fn(),
}))

jest.mock('@/lib/admin-firestore-compat', () => ({
  collection: jest.fn(() => 'FAKE_COLLECTION'),
  doc: jest.fn(() => 'FAKE_DOC_REF'),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  runTransaction: jest.fn(),
  increment: jest.fn((n: number) => ({ __increment: n })),
  Timestamp: { now: () => new Date() },
  FieldValue: {},
}))

import { checkRateLimit, checkRateLimitStrict, resetRateLimit } from '@/lib/firestore-rate-limit'
import { runTransaction, deleteDoc, increment } from '@/lib/admin-firestore-compat'

const mockRunTransaction = runTransaction as jest.Mock
const mockDeleteDoc = deleteDoc as jest.Mock

const WINDOW_MS = 60_000

/**
 * compat-shaped snapshot: in production, runTransaction() normalizes the
 * Admin snapshot (exists: boolean) into this method form — since the compat
 * module is mocked here, the fake tx must return this shape directly.
 */
const snap = (data: Record<string, unknown> | null) => ({
  exists: () => data !== null,
  id: 'rate-ref',
  data: () => data ?? undefined,
})

const makeTx = (data: Record<string, unknown> | null) => ({
  get: jest.fn().mockResolvedValue(snap(data)),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
})

beforeEach(() => {
  mockRunTransaction.mockReset()
  mockDeleteDoc.mockReset()
})

describe('checkRateLimitStrict', () => {
  it('allows and initializes the counter for a first-time identifier', async () => {
    const tx = makeTx(null)
    mockRunTransaction.mockImplementation((_db, fn) => fn(tx))

    const result = await checkRateLimitStrict('id-a', 3, WINDOW_MS)

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
    expect(tx.set).toHaveBeenCalledWith(
      'FAKE_DOC_REF',
      expect.objectContaining({ count: 1 })
    )
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('increments atomically while under the limit', async () => {
    const tx = makeTx({ count: 1, resetTime: Date.now() + WINDOW_MS })
    mockRunTransaction.mockImplementation((_db, fn) => fn(tx))

    const result = await checkRateLimitStrict('id-b', 3, WINDOW_MS)

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(1)
    expect(tx.update).toHaveBeenCalledWith('FAKE_DOC_REF', {
      count: increment(1),
    })
  })

  it('blocks when the limit is exhausted (fail-closed path)', async () => {
    const tx = makeTx({ count: 3, resetTime: Date.now() + WINDOW_MS })
    mockRunTransaction.mockImplementation((_db, fn) => fn(tx))

    const result = await checkRateLimitStrict('id-c', 3, WINDOW_MS)

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(tx.set).not.toHaveBeenCalled()
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('resets the counter when the window has expired', async () => {
    const tx = makeTx({ count: 10, resetTime: Date.now() - 1_000 })
    mockRunTransaction.mockImplementation((_db, fn) => fn(tx))

    const result = await checkRateLimitStrict('id-d', 3, WINDOW_MS)

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
    expect(tx.set).toHaveBeenCalledWith(
      'FAKE_DOC_REF',
      expect.objectContaining({ count: 1 })
    )
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('throws when Firestore is unavailable (fail-closed contract)', async () => {
    mockRunTransaction.mockImplementation(() => Promise.reject(new Error('firestore down')))
    await expect(checkRateLimitStrict('id-e', 3, WINDOW_MS)).rejects.toThrow('firestore down')
  })
})

describe('checkRateLimit (fail-open variant)', () => {
  it('fails OPEN when Firestore is unavailable', async () => {
    mockRunTransaction.mockImplementation(() => Promise.reject(new Error('firestore down')))
    const result = await checkRateLimit('id-f', 3, WINDOW_MS)
    expect(result.allowed).toBe(true)
  })
})

describe('resetRateLimit', () => {
  it('deletes the rate-limit document', async () => {
    await resetRateLimit('id-g')
    expect(mockDeleteDoc).toHaveBeenCalledWith('FAKE_DOC_REF')
  })
})
