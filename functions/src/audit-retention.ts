/**
 * Scheduled retention cleanup for the admin action audit trail
 * (admin_audit_logs — see src/lib/audit-log.ts in the Next.js app).
 *
 * Runs daily, deletes entries whose `timestamp` is older than the retention
 * window (default 180 days; override with AUDIT_RETENTION_DAYS in the
 * functions .env / environment configuration).
 *
 * The audit collection is server-only (firestore.rules: allow read, write:
 * if false) and append-only from the application surface — this scheduled
 * function is the ONLY writer that removes entries.
 *
 * Deletion runs in page-sized batches so a backlog never exceeds the
 * function timeout; the next daily run resumes automatically.
 */
import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

const db = admin.firestore()

const AUDIT_COLLECTION = 'admin_audit_logs'
const DEFAULT_RETENTION_DAYS = 180
const BATCH_SIZE = 450 // Firestore hard cap is 500 writes per batch

export const auditLogRetention = onSchedule(
  {
    schedule: 'every day 03:15',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',
    // Deletion backlog can take longer than the 120s global default.
    timeoutSeconds: 540,
    memory: '256MiB',
  },
  async () => {
    const parsed = Number.parseInt(process.env.AUDIT_RETENTION_DAYS ?? '', 10)
    const retentionDays = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RETENTION_DAYS
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

    functions.logger.info('Audit log retention run started', {
      retentionDays,
      cutoff: cutoff.toISOString(),
    })

    let deleted = 0

    for (;;) {
      const snapshot = await db
        .collection(AUDIT_COLLECTION)
        .where('timestamp', '<', admin.firestore.Timestamp.fromDate(cutoff))
        .orderBy('timestamp', 'asc')
        .limit(BATCH_SIZE)
        .get()

      if (snapshot.empty) break

      const batch = db.batch()
      snapshot.docs.forEach((doc) => batch.delete(doc.ref))
      await batch.commit()
      deleted += snapshot.size

      // Fewer than a full page means nothing older is left.
      if (snapshot.size < BATCH_SIZE) break
    }

    functions.logger.info('Audit log retention run finished', {
      deleted,
      retentionDays,
      cutoff: cutoff.toISOString(),
    })
  }
)