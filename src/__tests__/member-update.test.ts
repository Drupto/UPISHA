/**
 * @jest-environment node
 *
 * Pure-logic tests for src/lib/member-update.ts (Group D hardening).
 * No Firestore, no next/server beyond what security.ts already imports.
 */
import { parseMemberUpdateInput, isMemberStatus } from '@/lib/member-update'

describe('isMemberStatus', () => {
  it.each([['pending'], ['approved'], ['rejected']])('accepts %s', (status) => {
    expect(isMemberStatus(status)).toBe(true)
  })

  it.each([[''], ['hacked'], ['APPROVED'], [' approve '], ['deleted'], ['active']])(
    'rejects %s',
    (status) => {
      expect(isMemberStatus(status)).toBe(false)
    }
  )
})

describe('parseMemberUpdateInput', () => {
  it('collects whitelisted fields and sanitizes text', () => {
    const result = parseMemberUpdateInput({
      fullName: 'An <b>Admin</b>',
      email: 'USER@Example.COM',
      phone: '+91 999',
      membershipType: 'life',
      city: 'Lucknow',
      address: 'Line 1',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.updateData).toEqual({
      fullName: 'An &lt;b&gt;Admin&lt;/b&gt;',
      email: 'user@example.com',
      phone: '+91 999',
      membershipType: 'life',
      city: 'Lucknow',
      address: 'Line 1',
    })
    expect(result.approved).toBe(false)
  })

  it('flags an approving update', () => {
    const result = parseMemberUpdateInput({ status: 'approved' })
    expect(result).toEqual({ ok: true, updateData: { status: 'approved' }, approved: true })
  })

  it('rejects a non-whitelisted status', () => {
    const result = parseMemberUpdateInput({ status: 'hacked' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('Invalid status')
  })

  it('rejects an empty update (no fields to update)', () => {
    expect(parseMemberUpdateInput({})).toEqual({
      ok: false,
      error: 'No fields to update',
    })
    expect(parseMemberUpdateInput({ unknown: 'field' })).toEqual({
      ok: false,
      error: 'No fields to update',
    })
  })

  it('rejects a non-object body', () => {
    for (const body of [null, undefined, 'approved', 42, []]) {
      const result = parseMemberUpdateInput(body)
      expect(result.ok).toBe(false)
    }
  })

  it('accepts a valid membership ID and clears on blank', () => {
    const valid = parseMemberUpdateInput({ membershipId: 'up001' })
    expect(valid.ok).toBe(true)
    if (!valid.ok) return
    expect(valid.updateData).toEqual({ membershipId: 'UP001' })

    const cleared = parseMemberUpdateInput({ membershipId: '' })
    expect(cleared.ok).toBe(true)
    if (!cleared.ok) return
    expect(cleared.updateData).toEqual({ membershipId: null })
  })

  it('rejects a malformed membership ID', () => {
    const result = parseMemberUpdateInput({ membershipId: 'ABC12' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('Invalid membership ID')
  })

  it('normalizes address clearing to null', () => {
    const result = parseMemberUpdateInput({ address: '' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.updateData).toEqual({ address: null })
  })
})
