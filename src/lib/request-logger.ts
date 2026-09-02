/**
 * Request logging and monitoring utility
 * Logs API requests to Firestore for security monitoring and audit trail
 */

import { getDb } from './firebase'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  limit,
  Timestamp 
} from 'firebase/firestore'

const API_LOGS_COLLECTION = 'api_logs'

// Lazy db accessor so module import during build does not fail
// when env vars are not yet available.
const db = () => getDb()

export interface ApiLogEntry {
  id?: string
  endpoint: string
  method: string
  ip: string
  userId?: string | null
  userAgent?: string | null
  status?: number
  error?: string
  timestamp: Date
  createdAt?: Date
}

/**
 * Log an API request to Firestore
 */
export async function logApiRequest(entry: Omit<ApiLogEntry, 'id' | 'createdAt'>): Promise<void> {
  try {
    await addDoc(collection(db(), API_LOGS_COLLECTION), {
      ...entry,
      timestamp: Timestamp.fromDate(entry.timestamp || new Date()),
      createdAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Failed to log API request:', error)
  }
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  endpoint: string,
  ip: string,
  reason: string,
  userId?: string | null
): Promise<void> {
  await logApiRequest({
    endpoint,
    method: 'UNKNOWN',
    ip,
    userId,
    userAgent: null,
    status: 403,
    error: `Suspicious activity: ${reason}`,
    timestamp: new Date(),
  })
}

/**
 * Detect and log rapid requests (potential DoS attack)
 */
export async function detectRapidRequests(endpoint: string, ip: string): Promise<boolean> {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const q = query(
      collection(db(), API_LOGS_COLLECTION),
      where('endpoint', '==', endpoint),
      where('ip', '==', ip),
      where('timestamp', '>=', Timestamp.fromDate(oneMinuteAgo)),
      // Only the count matters (threshold 10) — bound the read (N10)
      limit(11)
    )
    const snapshot = await getDocs(q)

    const requestCount = snapshot.size

    // Log if more than 10 requests in 1 minute
    if (requestCount > 10) {
      await logSuspiciousActivity(endpoint, ip, `Rapid requests: ${requestCount} in 1 minute`)
      return true
    }

    return false
  } catch (error) {
    console.error('Failed to detect rapid requests:', error)
    return false
  }
}

/**
 * Get recent API logs (for admin monitoring)
 */
export async function getRecentApiLogs(maxEntries: number = 100): Promise<ApiLogEntry[]> {
  try {
    const q = query(
      collection(db(), API_LOGS_COLLECTION),
      // Bound the read so we never pull the whole collection into memory
      // (N10). Without orderBy the newest-first sort happens in memory below.
      limit(Math.min(maxEntries, 500))
    )
    const snapshot = await getDocs(q)

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ApiLogEntry
    })

    // Sort by timestamp descending and limit
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxEntries)
  } catch (error) {
    console.error('Failed to get API logs:', error)
    return []
  }
}

/**
 * Clean up old API logs (older than 30 days)
 * Should be run periodically
 */
export async function cleanupOldApiLogs(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const q = query(
      collection(db(), API_LOGS_COLLECTION),
      where('timestamp', '<', Timestamp.fromDate(thirtyDaysAgo)),
      // Bound each cleanup run (N10); call periodically until it returns 0
      limit(1000)
    )
    const snapshot = await getDocs(q)

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    return snapshot.size
  } catch (error) {
    console.error('Failed to cleanup old API logs:', error)
    return 0
  }
}