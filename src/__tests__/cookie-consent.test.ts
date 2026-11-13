import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  LEGACY_COOKIE_CONSENT_KEY,
  clearConsent,
  clearLegacyConsent,
  createConsent,
  hasConsent,
  parseConsent,
  readConsent,
  writeConsent,
} from '@/lib/cookie-consent'
import type { ConsentStorage } from '@/lib/cookie-consent'

class MemoryStorage implements ConsentStorage {
  private readonly data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  has(key: string): boolean {
    return this.data.has(key)
  }
}

describe('cookie-consent', () => {
  it('creates a default record with analytics off and necessary always on', () => {
    const record = createConsent()
    expect(record.version).toBe(COOKIE_CONSENT_VERSION)
    expect(record.categories).toEqual({ necessary: true, analytics: false })
    expect(Number.isNaN(Date.parse(record.decidedAt))).toBe(false)
  })

  it('creates an opted-in record when analytics is requested', () => {
    const record = createConsent({ analytics: true })
    expect(record.categories.analytics).toBe(true)
  })

  it('round-trips a valid record through parseConsent', () => {
    const record = createConsent({ analytics: true })
    expect(parseConsent(JSON.stringify(record))).toEqual(record)
  })

  it('rejects missing, legacy, malformed and outdated values', () => {
    expect(parseConsent(null)).toBeNull()
    expect(parseConsent('')).toBeNull()
    expect(parseConsent('accepted')).toBeNull()
    expect(parseConsent('{"version":1')).toBeNull()
    expect(parseConsent(JSON.stringify({ version: 999, decidedAt: new Date().toISOString(), categories: { necessary: true, analytics: true } }))).toBeNull()
  })

  it('rejects records missing the mandatory category or a boolean analytics flag', () => {
    const base = createConsent({ analytics: true })

    expect(
      parseConsent(
        JSON.stringify({
          ...base,
          categories: { necessary: false, analytics: true },
        })
      )
    ).toBeNull()

    expect(
      parseConsent(
        JSON.stringify({
          ...base,
          categories: { necessary: true, analytics: 'yes' },
        })
      )
    ).toBeNull()
  })

  it('rejects an invalid decidedAt timestamp', () => {
    const record = createConsent()
    expect(
      parseConsent(JSON.stringify({ ...record, decidedAt: 'not-a-date' }))
    ).toBeNull()
  })

  it('reads and writes through a storage implementation', () => {
    const storage = new MemoryStorage()
    const record = createConsent({ analytics: true })

    expect(writeConsent(record, storage)).toBe(true)
    expect(storage.has(COOKIE_CONSENT_STORAGE_KEY)).toBe(true)
    expect(readConsent(storage)).toEqual(record)
  })

  it('returns null/false when storage is unavailable or throws', () => {
    const throwing: ConsentStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }

    expect(readConsent(null)).toBeNull()
    expect(writeConsent(createConsent(), null)).toBe(false)
    expect(readConsent(throwing)).toBeNull()
    expect(writeConsent(createConsent(), throwing)).toBe(false)
    expect(() => clearConsent(throwing)).not.toThrow()
    expect(() => clearLegacyConsent(throwing)).not.toThrow()
  })

  it('reports analytics consent only for explicit opt-in', () => {
    expect(hasConsent(null, 'analytics')).toBe(false)
    expect(hasConsent(createConsent(), 'analytics')).toBe(false)
    expect(hasConsent(createConsent({ analytics: true }), 'analytics')).toBe(true)
  })

  it('clears the current and legacy keys', () => {
    const storage = new MemoryStorage()
    storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(createConsent()))
    storage.setItem(LEGACY_COOKIE_CONSENT_KEY, 'accepted')

    clearConsent(storage)
    clearLegacyConsent(storage)

    expect(storage.has(COOKIE_CONSENT_STORAGE_KEY)).toBe(false)
    expect(storage.has(LEGACY_COOKIE_CONSENT_KEY)).toBe(false)
  })
})
