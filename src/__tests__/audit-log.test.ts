/**
 * @jest-environment node
 *
 * Pure-logic tests for the audit-log details sanitizer in
 * src/lib/audit-log.ts. Node environment is required because the module
 * transitively imports next/server (via ./security) and the Admin SDK.
 */
import { sanitizeDetails } from '@/lib/audit-log'

describe('sanitizeDetails (audit log payload hygiene)', () => {
  it('returns null for missing/empty details', () => {
    expect(sanitizeDetails(undefined)).toBeNull()
    expect(sanitizeDetails(null)).toBeNull()
    expect(sanitizeDetails({})).toBeNull()
  })

  it('keeps primitives as-is', () => {
    const out = sanitizeDetails({ status: 'approved', count: 3, flag: true, nothing: null })
    expect(out).toEqual({ status: 'approved', count: 3, flag: true, nothing: null })
  })

  it('redacts sensitive keys (case-insensitive)', () => {
    const out = sanitizeDetails({
      password: 'hunter2',
      authToken: 'abc123',
      Authorization: 'Bearer x',
      apiKey: 'xyz',
      title: 'safe value',
    })
    expect(out).toEqual({
      password: '[redacted]',
      authToken: '[redacted]',
      Authorization: '[redacted]',
      apiKey: '[redacted]',
      title: 'safe value',
    })
  })

  it('truncates long strings', () => {
    const long = 'x'.repeat(500)
    const out = sanitizeDetails({ note: long })
    expect((out?.note as string).length).toBeLessThanOrEqual(301)
    expect((out?.note as string).endsWith('…')).toBe(true)
  })

  it('compacts objects/arrays to truncated JSON strings', () => {
    const out = sanitizeDetails({ fields: ['a', 'b'], nested: { deep: true } })
    expect(out?.fields).toBe('["a","b"]')
    expect(out?.nested).toBe('{"deep":true}')
  })

  it('drops undefined values', () => {
    const out = sanitizeDetails({ a: undefined, b: 1 })
    expect(out).toEqual({ b: 1 })
    expect(Object.prototype.hasOwnProperty.call(out, 'a')).toBe(false)
  })

  it('truncates long keys', () => {
    const longKey = 'k'.repeat(100)
    const out = sanitizeDetails({ [longKey]: 'v' })
    expect(Object.keys(out!)).toHaveLength(1)
    expect(Object.keys(out!)[0].length).toBe(60)
  })
})