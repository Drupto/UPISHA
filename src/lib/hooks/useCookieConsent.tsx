'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  COOKIE_CONSENT_STORAGE_KEY,
  OPEN_COOKIE_SETTINGS_EVENT,
  clearConsent,
  clearLegacyConsent,
  createConsent,
  emitConsentChanged,
  readConsent,
  writeConsent,
} from '@/lib/cookie-consent'
import type { CookieConsentRecord } from '@/lib/cookie-consent'

export interface CookieConsentContextValue {
  /** Current stored choice, or null when the visitor has not decided yet. */
  consent: CookieConsentRecord | null
  /** False during the first client render (before localStorage is read). */
  isLoaded: boolean
  isBannerOpen: boolean
  isPreferencesOpen: boolean
  acceptAll: () => void
  rejectNonEssential: () => void
  savePreferences: (categories: { analytics: boolean }) => void
  openPreferences: () => void
  closePreferences: () => void
  resetConsent: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(
  undefined
)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isBannerOpen, setIsBannerOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  // Read the stored choice after mount (SSR must not touch localStorage).
  useEffect(() => {
    const stored = readConsent()
    setConsent(stored)
    setIsBannerOpen(stored === null)
    setIsLoaded(true)
    clearLegacyConsent()
  }, [])

  // Global entry points + multi-tab sync.
  useEffect(() => {
    const openSettings = () => setIsPreferencesOpen(true)

    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== COOKIE_CONSENT_STORAGE_KEY) return
      const stored = readConsent()
      setConsent(stored)
      setIsBannerOpen(stored === null)
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings)
    window.addEventListener('storage', syncFromStorage)
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings)
      window.removeEventListener('storage', syncFromStorage)
    }
  }, [])

  const persist = useCallback((analytics: boolean) => {
    const record = createConsent({ analytics })
    writeConsent(record)
    setConsent(record)
    setIsBannerOpen(false)
    setIsPreferencesOpen(false)
    emitConsentChanged(record)
  }, [])

  const acceptAll = useCallback(() => persist(true), [persist])
  const rejectNonEssential = useCallback(() => persist(false), [persist])

  const savePreferences = useCallback(
    (categories: { analytics: boolean }) => persist(categories.analytics === true),
    [persist]
  )

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), [])
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])

  const resetConsent = useCallback(() => {
    clearConsent()
    setConsent(null)
    setIsBannerOpen(true)
    setIsPreferencesOpen(false)
    emitConsentChanged(null)
  }, [])

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      isLoaded,
      isBannerOpen,
      isPreferencesOpen,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferences,
      closePreferences,
      resetConsent,
    }),
    [
      consent,
      isLoaded,
      isBannerOpen,
      isPreferencesOpen,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferences,
      closePreferences,
      resetConsent,
    ]
  )

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error(
      'useCookieConsent must be used within a CookieConsentProvider'
    )
  }
  return context
}
