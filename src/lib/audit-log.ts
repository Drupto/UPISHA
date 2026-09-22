/**
 * Admin action audit log — append-only, server-only.
 *
 * Every state-changing admin action (create / update / delete / approve /
 * issue / upload) appends an immutable record to the Firestore
 * `admin_audit_logs` collection. The collection is closed to clients in
 * firestore.rules (allow read, write: if false) and the application exposes
 * no update/delete path for it — the trail can only grow, never be edited.
 *
 * Logging must never break the primary operation: logAdminAction() swallows
 * its own errors (server console only) and is always called AFTER the
 * underlying Firestore mutation has succeeded, so an entry always implies
 * the action actually happened.
 *
 * ⚠️ SERVER ONLY — imports the Admin SDK (Node-only APIs).
 */
import { Timestamp, type DocumentData, type Query } from 'firebase-admin/firestore'
import { getAdminDb } from './firebase-server'
import { getClientIp } from './security'

export const AUDIT_LOGS_COLLECTION = 'admin_audit_logs'
export const DEFAULT_PAGE_SIZE = 50
export const MAX_PAGE_SIZE = 200

/** The decoded admin identity returned by requireAdmin(). */
export interface AuditActor {
  uid: string
  email: string | null
}

export interface AuditLogInput {
  /** Dot-namespaced action, e.g. 'member.approve', 'certificate.issue'. */
  action: string
  /** Collection-ish resource type, e.g. 'member', 'receipt'. */
  resourceType: string
  /** Doc id acted on. */
  resourceId: string
  /** Verified admin performing the action (from requireAdmin). */
  actor: AuditActor
  /** Original request — used to derive IP and user agent when not given. */
  request?: Request
  ip?: string
  userAgent?: string | null
  /**
   * Small summary fields only (ids, statuses, titles, amounts). Never pass
   * full request bodies — values are truncated and sensitive keys are
   * redacted by sanitizeDetails().
   */
  details?: Record<string, unknown>
}

export type SanitizedDetailValue = string | number | boolean | null

export interface SerializedAuditLog {
  id: string
  action: string
  resourceType: string
  resourceId: string
  actorUid: string
  actorEmail: string | null
  ip: string
  userAgent: string | null
  details: Record<string, SanitizedDetailValue> | null
  /** ISO string for JSON transport. */
  timestamp: string
}

export interface AuditLogQuery {
  action?: string
  actorEmail?: string
  from?: Date
  to?: Date
  limit?: number
  /** Opaque cursor: doc id of the last entry on the previous page. */
  pageToken?: string | null
}

export interface AuditLogPage {
  logs: SerializedAuditLog[]
  nextPageToken: string | null
}

const MAX_DETAIL_STRING = 300
const MAX_DETAIL_KEY = 60
const SENSITIVE_KEY_PATTERN =
  /pass(word)?|secret|token|authorization|cookie|api[-_]?key|private[-_]?key/i

// ─── Details sanitization ────────────────────────────────────────────────────

/**
 * Keep audit details small and PII-light: keys are truncated, sensitive
 * keys are redacted, strings and nested values are compacted to at most
 * MAX_DETAIL_STRING chars. Exported for unit tests.
 */
export function sanitizeDetails(
  details: Record<string, unknown> | undefined | null
): Record<string, SanitizedDetailValue> | null {
  if (!details) return null
  const out: Record<string, SanitizedDetailValue> = {}
  for (const [rawKey, value] of Object.entries(details)) {
    const key = rawKey.slice(0, MAX_DETAIL_KEY)
    if (SENSITIVE_KEY_PATTERN.test(rawKey)) {
      out[key] = '[redacted]'
      continue
    }
    if (value === undefined) continue
    if (value === null) {
      out[key] = null
    } else if (typeof value === 'boolean') {
      out[key] = value
    } else if (typeof value === 'number') {
      out[key] = Number.isFinite(value) ? value : String(value)
    } else if (typeof value === 'string') {
      out[key] = value.length > MAX_DETAIL_STRING ? value.slice(0, MAX_DETAIL_STRING) + '…' : value
    } else {
      let json: string
      try {
        json = JSON.stringify(value) ?? String(value)
      } catch {
        json = String(value)
      }
      out[key] = json.length > MAX_DETAIL_STRING ? json.slice(0, MAX_DETAIL_STRING) + '…' : json
    }
  }
  return Object.keys(out).length > 0 ? out : null
}

// ─── Write path ──────────────────────────────────────────────────────────────

/**
 * Append an admin-action audit record. Fire-and-forget by contract: a
 * logging failure is reported to the server console but never propagates,
 * so it can never break the primary operation it follows.
 */
export async function logAdminAction(input: AuditLogInput): Promise<void> {
  try {
    const ip = input.ip ?? (input.request ? getClientIp(input.request) : 'unknown')
    const userAgent = input.userAgent ?? input.request?.headers.get('user-agent') ?? null
    await getAdminDb().collection(AUDIT_LOGS_COLLECTION).add({
      action: input.action,
      resourceType: input.resourceType,
      resourceId: String(input.resourceId ?? ''),
      actorUid: input.actor?.uid ?? 'unknown',
      actorEmail: input.actor?.email ?? null,
      ip,
      userAgent,
      details: sanitizeDetails(input.details),
      timestamp: Timestamp.now(),
    })
  } catch (error) {
    console.error(`Failed to write admin audit log (${input.action}):`, error)
  }
}

// ─── Read path (admin viewer) ────────────────────────────────────────────────

/**
 * Paginated, filtered audit trail for the admin viewer. Always orders by
 * timestamp descending; the optional filters map to the composite indexes
 * declared for the admin_audit_logs collection group in
 * firestore.indexes.json.
 */
export async function getAuditLogs(queryOptions: AuditLogQuery = {}): Promise<AuditLogPage> {
  const pageSize = Math.min(Math.max(queryOptions.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)

  let q: Query<DocumentData> = getAdminDb().collection(AUDIT_LOGS_COLLECTION)
  if (queryOptions.action) q = q.where('action', '==', queryOptions.action)
  if (queryOptions.actorEmail) {
    q = q.where('actorEmail', '==', queryOptions.actorEmail.toLowerCase())
  }
  if (queryOptions.from) q = q.where('timestamp', '>=', Timestamp.fromDate(queryOptions.from))
  if (queryOptions.to) q = q.where('timestamp', '<=', Timestamp.fromDate(queryOptions.to))
  q = q.orderBy('timestamp', 'desc').limit(pageSize + 1) // +1 to detect a next page

  if (queryOptions.pageToken) {
    const cursor = await getAdminDb().collection(AUDIT_LOGS_COLLECTION).doc(queryOptions.pageToken).get()
    if (cursor.exists) q = q.startAfter(cursor)
  }

  const snapshot = await q.get()
  const docs = snapshot.docs
  const hasMore = docs.length > pageSize
  const page = hasMore ? docs.slice(0, pageSize) : docs

  return {
    logs: page.map((d) => serializeAuditDoc(d.id, d.data())),
    nextPageToken: hasMore && page.length > 0 ? page[page.length - 1].id : null,
  }
}

function serializeAuditDoc(id: string, data: DocumentData): SerializedAuditLog {
  const ts = data.timestamp as { toDate?: () => Date } | undefined
  return {
    id,
    action: typeof data.action === 'string' ? data.action : 'unknown',
    resourceType: typeof data.resourceType === 'string' ? data.resourceType : 'unknown',
    resourceId: typeof data.resourceId === 'string' ? data.resourceId : '',
    actorUid: typeof data.actorUid === 'string' ? data.actorUid : '',
    actorEmail: typeof data.actorEmail === 'string' ? data.actorEmail : null,
    ip: typeof data.ip === 'string' ? data.ip : '',
    userAgent: typeof data.userAgent === 'string' ? data.userAgent : null,
    details:
      data.details && typeof data.details === 'object'
        ? (data.details as Record<string, SanitizedDetailValue>)
        : null,
    timestamp: ts?.toDate ? ts.toDate().toISOString() : new Date(0).toISOString(),
  }
}