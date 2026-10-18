/**
 * @jest-environment node
 *
 * CSRF coverage regression guard (SECURITY_AUDIT_REPORT roadmap item 1d):
 * every mutating API handler must call withCsrfProtection(), so CSRF
 * coverage can never silently regress when new routes are added.
 *
 * Documented exceptions (asserted, not skipped — any change to this list
 * must be a conscious, reviewed decision):
 *   - auth/verify POST — token-bearing: requires a valid Firebase ID token
 *     in the body and only 401s without one (decision in route file +
 *     re-audit Group B). CSRF would add no protection.
 *   - newsletter POST — public, unauthenticated form with no session to
 *     protect (decision in route file). Mail-bombing is bounded by rate
 *     limiting + App Check; re-introducing CSRF here means also updating
 *     the public NewsletterSection client.
 */
import * as fs from 'fs'
import * as path from 'path'

const API_DIR = path.resolve(__dirname, '..', 'app', 'api')

/** Route-relative file + method pairs deliberately exempt from CSRF. */
const CSRF_EXEMPTIONS = new Set(['auth/verify/route.ts POST', 'newsletter/route.ts POST'])

function collectRouteFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectRouteFiles(full))
    else if (entry.isFile() && entry.name === 'route.ts') out.push(full)
  }
  return out
}

function mutatingHandlersWithoutCsrf(file: string): string[] {
  const source = fs.readFileSync(file, 'utf8')
  const rel = path.relative(API_DIR, file).replace(/\\/g, '/')
  const parts = source.split(/(?=export async function (?:GET|POST|PUT|PATCH|DELETE|OPTIONS))/)
  const missing: string[] = []
  for (const part of parts) {
    const match = part.match(/^export async function (GET|POST|PUT|PATCH|DELETE|OPTIONS)/)
    if (!match) continue
    const method = match[1]
    if (method === 'GET' || method === 'OPTIONS') continue // read-only / preflight
    if (part.includes('withCsrfProtection(')) continue
    const key = `${rel} ${method}`
    if (CSRF_EXEMPTIONS.has(key)) continue
    missing.push(key)
  }
  return missing
}

describe('CSRF coverage guard', () => {
  it('every mutating API handler calls withCsrfProtection (or is an approved exception)', () => {
    const files = collectRouteFiles(API_DIR)
    expect(files.length).toBeGreaterThan(0)
    const missing = files.flatMap(mutatingHandlersWithoutCsrf)
    expect(missing).toEqual([])
  })

  it('the exemption list still matches reality (no silently-removed CSRF)', () => {
    // Guard against the exemption list drifting: each exemption must still
    // exist and still be CSRF-free — if a route gains CSRF later, the
    // exemption must be deleted, not left stale.
    for (const key of CSRF_EXEMPTIONS) {
      const [rel, method] = key.split(' ')
      const source = fs.readFileSync(path.join(API_DIR, rel), 'utf8')
      const segment = source.split(
        new RegExp(`(?=export async function ${method})`)
      )[1]
      expect(segment).toBeDefined()
      expect(segment.includes('withCsrfProtection(')).toBe(false)
    }
  })
})
