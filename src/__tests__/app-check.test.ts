/**
 * @jest-environment node
 *
 * Tests for the Firebase App Check API-layer gate (APP_CHECK.md §5, §9):
 *   - getAppCheckMode() matrix (real implementation, env-driven)
 *   - verifyAppCheckToken() header/mode semantics (real implementation,
 *     Admin SDK verify mocked at the firebase-admin boundary)
 *   - withAppCheckProtection() allow/reject matrix (firebase-server +
 *     request-logger mocked; asserts monitor allows, enforce 403s)
 *
 * Node environment is required because the modules import next/server
 * (needs the global Request/Response classes).
 */

const ORIGINAL_ENV = { ...process.env }

// --- Mocks -----------------------------------------------------------------
const mockGetAppCheckMode = jest.fn()
const mockVerifyAppCheckToken = jest.fn()
const mockLogApiRequest = jest.fn()
const mockAdminVerifyToken = jest.fn()

jest.mock('@/lib/firebase-server', () => ({
  getAppCheckMode: (...args: unknown[]) => mockGetAppCheckMode(...args),
  verifyAppCheckToken: (...args: unknown[]) => mockVerifyAppCheckToken(...args),
}))

jest.mock('@/lib/request-logger', () => ({
  logApiRequest: (...args: unknown[]) => mockLogApiRequest(...args),
}))

jest.mock('firebase-admin/app-check', () => ({
  getAppCheck: jest.fn(() => ({ verifyToken: mockAdminVerifyToken })),
}))

// Lets the REAL getAdminApp() initialize under test (the real cert() would
// reject the dummy test key before the mocked verifyToken is ever reached).
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(() => ({ name: 'test-admin-app' })),
  getApps: jest.fn(() => []),
  cert: jest.fn(() => ({})),
}))

import { withAppCheckProtection } from '@/lib/security'

const req = (url: string, headers: Record<string, string> = {}, method = 'POST') =>
  new Request(url, { method, headers })

beforeEach(() => {
  jest.clearAllMocks()
  process.env = { ...ORIGINAL_ENV }
  // Dummy Admin SDK credential so getAdminApp() can initialize under the
  // mocked firebase-admin/app-check (verifyToken itself is mocked).
  process.env.FIREBASE_ADMIN_PROJECT_ID = 'test-project'
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
  process.env.FIREBASE_ADMIN_PRIVATE_KEY =
    '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgtest\\n-----END PRIVATE KEY-----\\n'
})

afterAll(() => {
  process.env = ORIGINAL_ENV
})

// --- getAppCheckMode (real implementation) ----------------------------------
describe('getAppCheckMode', () => {
  const { getAppCheckMode } = jest.requireActual('@/lib/firebase-server') as typeof import('@/lib/firebase-server')

  it.each([
    [undefined, 'off'],
    ['off', 'off'],
    ['monitor', 'monitor'],
    ['enforce', 'enforce'],
    ['MONITOR', 'monitor'],
    ['Enforce', 'enforce'],
    ['bogus', 'off'],
    ['', 'off'],
  ])('APP_CHECK_MODE=%s → %s', (env, expected) => {
    if (env === undefined) delete process.env.APP_CHECK_MODE
    else process.env.APP_CHECK_MODE = env
    expect(getAppCheckMode()).toBe(expected)
  })
})


// --- verifyAppCheckToken (real implementation, Admin SDK mocked) ------------
describe('verifyAppCheckToken', () => {
  const { verifyAppCheckToken } = jest.requireActual('@/lib/firebase-server') as typeof import('@/lib/firebase-server')

  it('returns disabled without touching the network when mode is off', async () => {
    process.env.APP_CHECK_MODE = 'off'
    const result = await verifyAppCheckToken(req('https://x.test/api/join'))
    expect(result).toEqual({ valid: false, reason: 'disabled' })
    expect(mockAdminVerifyToken).not.toHaveBeenCalled()
  })

  it('returns missing-header when the token header is absent', async () => {
    process.env.APP_CHECK_MODE = 'monitor'
    const result = await verifyAppCheckToken(req('https://x.test/api/join'))
    expect(result).toEqual({ valid: false, reason: 'missing-header' })
    expect(mockAdminVerifyToken).not.toHaveBeenCalled()
  })

  it('returns valid with the appId for a good token', async () => {
    process.env.APP_CHECK_MODE = 'enforce'
    mockAdminVerifyToken.mockResolvedValueOnce({ appId: '1:123:web:abc' })
    const result = await verifyAppCheckToken(
      req('https://x.test/api/join', { 'x-firebase-appcheck': 'good-token' })
    )
    expect(result).toEqual({ valid: true, appId: '1:123:web:abc' })
  })

  it('returns invalid-token when the Admin SDK rejects (expired/tampered/wrong project)', async () => {
    process.env.APP_CHECK_MODE = 'enforce'
    mockAdminVerifyToken.mockRejectedValueOnce(new Error('app-check/token-expired'))
    const result = await verifyAppCheckToken(
      req('https://x.test/api/join', { 'x-firebase-appcheck': 'bad-token' })
    )
    expect(result).toEqual({ valid: false, reason: 'invalid-token' })
  })
})

// --- withAppCheckProtection gate (firebase-server mocked) -------------------
describe('withAppCheckProtection', () => {
  it('off → allows immediately without verifying', async () => {
    mockGetAppCheckMode.mockReturnValue('off')
    const result = await withAppCheckProtection(req('https://x.test/api/join'))
    expect(result).toBeNull()
    expect(mockVerifyAppCheckToken).not.toHaveBeenCalled()
  })

  it('monitor + failure → ALLOWS but logs to api_logs', async () => {
    mockGetAppCheckMode.mockReturnValue('monitor')
    mockVerifyAppCheckToken.mockResolvedValue({ valid: false, reason: 'missing-header' })
    const result = await withAppCheckProtection(req('https://x.test/api/join'))
    expect(result).toBeNull()
    expect(mockLogApiRequest).toHaveBeenCalledTimes(1)
    expect(mockLogApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/join',
        status: 403,
        error: 'App Check verification failed (monitor/missing-header)',
      })
    )
  })

  it('monitor + valid token → allows without logging', async () => {
    mockGetAppCheckMode.mockReturnValue('monitor')
    mockVerifyAppCheckToken.mockResolvedValue({ valid: true, appId: '1:1:web:a' })
    const result = await withAppCheckProtection(req('https://x.test/api/join'))
    expect(result).toBeNull()
    expect(mockLogApiRequest).not.toHaveBeenCalled()
  })

  it('enforce + failure → 403 with security headers, and logs', async () => {
    mockGetAppCheckMode.mockReturnValue('enforce')
    mockVerifyAppCheckToken.mockResolvedValue({ valid: false, reason: 'invalid-token' })
    const result = await withAppCheckProtection(req('https://x.test/api/join'))
    expect(result).not.toBeNull()
    expect(result!.status).toBe(403)
    expect(await result!.json()).toEqual({ error: 'App Check verification failed' })
    expect(result!.headers.get('x-content-type-options')).toBe('nosniff')
    expect(mockLogApiRequest).toHaveBeenCalledTimes(1)
    expect(mockLogApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'App Check verification failed (enforce/invalid-token)',
      })
    )
  })

  it('enforce + valid token → allows', async () => {
    mockGetAppCheckMode.mockReturnValue('enforce')
    mockVerifyAppCheckToken.mockResolvedValue({ valid: true, appId: '1:1:web:a' })
    const result = await withAppCheckProtection(req('https://x.test/api/join'))
    expect(result).toBeNull()
  })

  it('accepts a pre-verified result without calling verify again', async () => {
    mockGetAppCheckMode.mockReturnValue('enforce')
    const result = await withAppCheckProtection(req('https://x.test/api/join'), {
      valid: true,
      appId: '1:1:web:a',
    })
    expect(result).toBeNull()
    expect(mockVerifyAppCheckToken).not.toHaveBeenCalled()
  })
})

