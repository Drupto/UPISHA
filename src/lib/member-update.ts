/**
 * Member update input parsing for PUT /api/members/[id] (Group D hardening).
 *
 * Pure, testable, zero Firestore: whitelists the mutable fields, enforces
 * the status enum, validates the admin-assigned membership ID format, and
 * rejects empty updates. The membership-ID *uniqueness* check needs a
 * Firestore read and stays in the route handler.
 */
import { sanitizeHtml } from './security'
import { normalizeMembershipId, isValidMembershipId } from './firestore'

/** The only statuses the admin UI and the approval workflow recognize. */
export const ALLOWED_MEMBER_STATUSES = ['pending', 'approved', 'rejected'] as const

export type MemberStatus = (typeof ALLOWED_MEMBER_STATUSES)[number]

export type MemberUpdateResult =
  | { ok: true; updateData: Record<string, unknown>; approved: boolean }
  | { ok: false; error: string }

/**
 * Build the Firestore update payload from an admin-submitted body.
 * Returns an error result (caller maps to 400) when:
 *   - the body is not an object,
 *   - `status` is present but not a whitelisted value,
 *   - `membershipId` is present but not blank and not UP###-shaped,
 *   - nothing updatable was provided (empty update).
 */
export function parseMemberUpdateInput(body: unknown): MemberUpdateResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body' }
  }
  const input = body as Record<string, unknown>
  const updateData: Record<string, unknown> = {}

  // Status enum whitelist — never a free-form string (approval triggers
  // cascading certificate/receipt issuance, so junk here has money
  // consequences).
  if (input.status) {
    if (typeof input.status !== 'string' || !isMemberStatus(input.status)) {
      return {
        ok: false,
        error: 'Invalid status. Allowed values: pending, approved, rejected.',
      }
    }
    updateData.status = input.status
  }
  if (input.fullName) updateData.fullName = sanitizeHtml(String(input.fullName))
  if (input.email) updateData.email = String(input.email).toLowerCase()
  if (input.phone) updateData.phone = sanitizeHtml(String(input.phone))
  if (input.membershipType) updateData.membershipType = sanitizeHtml(String(input.membershipType))
  if (input.city) updateData.city = sanitizeHtml(String(input.city))
  if (input.address !== undefined) {
    updateData.address = input.address ? sanitizeHtml(String(input.address)) : null
  }

  // Admin-assigned membership ID (e.g. "UP001"). Optional: blank clears it.
  // Never touched by /api/join, so applications stay admin-assignable only.
  if (input.membershipId !== undefined) {
    const normalized = normalizeMembershipId(input.membershipId)
    if (normalized && !isValidMembershipId(normalized)) {
      return {
        ok: false,
        error: 'Invalid membership ID. Use the format UP001 (UP followed by at least 3 digits).',
      }
    }
    updateData.membershipId = normalized || null
  }

  if (Object.keys(updateData).length === 0) {
    return { ok: false, error: 'No fields to update' }
  }

  return {
    ok: true,
    updateData,
    approved: updateData.status === 'approved',
  }
}

export function isMemberStatus(value: string): value is MemberStatus {
  return (ALLOWED_MEMBER_STATUSES as readonly string[]).includes(value)
}
