'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, Cookie, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCookieConsent } from '@/lib/hooks/useCookieConsent'

/**
 * Global cookie-consent UI.
 *
 * - The banner is shown until the visitor makes a choice. It never
 *   auto-dismisses: silence is not consent.
 * - "Reject non-essential" is exactly as easy as "Accept all".
 * - The preferences dialog exposes the optional analytics category (off by
 *   default). Strictly necessary storage is always on and cannot be toggled.
 */
export function CookieConsent() {
  const {
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
  } = useCookieConsent()

  // Local draft of the optional category while the dialog is open.
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    if (isPreferencesOpen) {
      setAnalytics(consent?.categories.analytics ?? false)
    }
  }, [isPreferencesOpen, consent])

  if (!isLoaded) return null

  const lastSaved = consent
    ? new Date(consent.decidedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <>
      <AnimatePresence>
        {isBannerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-6 sm:bottom-6"
            role="region"
            aria-label="Cookie consent"
          >
            <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:border-gray-700/90 dark:bg-gray-900/95 dark:ring-white/10">
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-upisha-teal/10 text-upisha-teal ring-1 ring-inset ring-upisha-teal/20 dark:bg-upisha-teal/15">
                    <Cookie className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold tracking-tight text-upisha-navy dark:text-white">
                      Your privacy choices
                    </p>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                      We use strictly necessary cookies to run this site. With your
                      permission, we also use Google Analytics cookies to understand
                      how the site is used. You can change or withdraw your choice at
                      any time.{' '}
                      <Link
                        href="/cookie-policy"
                        className="font-medium text-upisha-teal underline decoration-upisha-teal/40 underline-offset-2 transition-colors hover:text-upisha-teal-dark hover:decoration-upisha-teal dark:text-upisha-teal-light dark:hover:text-white"
                      >
                        Read our Cookie Policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-gray-200/80 pt-4 dark:border-gray-700/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="order-2 text-xs leading-5 text-gray-500 dark:text-gray-400 sm:order-1">
                    You can change this later via “Cookie settings” in the footer.
                  </p>
                  <div className="order-1 grid grid-cols-2 gap-2 sm:order-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={rejectNonEssential}
                      className="h-11 justify-center border-gray-300 bg-transparent px-3 text-sm font-medium text-gray-700 shadow-none hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white sm:h-10 sm:px-4"
                    >
                      <span className="sm:hidden">Reject optional</span>
                      <span className="hidden sm:inline">Reject non-essential</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openPreferences}
                      className="h-11 justify-center border-gray-300 bg-transparent px-3 text-sm font-medium text-gray-700 shadow-none hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white sm:h-10 sm:px-4"
                    >
                      Customize
                    </Button>
                    <Button
                      type="button"
                      onClick={acceptAll}
                      className="col-span-2 h-11 justify-center bg-upisha-teal px-5 text-sm font-semibold text-white shadow-sm hover:bg-upisha-teal-dark focus-visible:ring-2 focus-visible:ring-upisha-teal/40 sm:col-span-1 sm:h-10"
                    >
                      Accept all
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={isPreferencesOpen}
        onOpenChange={(open) => (open ? openPreferences() : closePreferences())}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-upisha-teal" />
              Cookie preferences
            </DialogTitle>
            <DialogDescription>
              Choose which optional cookies we may use. Strictly necessary storage
              is always active because the site cannot work without it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:p-5">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
                <div>
                  <Label
                    htmlFor="cookie-necessary"
                    className="text-sm font-semibold text-upisha-navy dark:text-white"
                  >
                    Strictly necessary
                  </Label>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Sign-in session, security (CSRF) token, your cookie choice, and
                    on-device display preferences. Always active.
                  </p>
                </div>
              </div>
              <Switch
                id="cookie-necessary"
                checked
                disabled
                aria-label="Strictly necessary cookies are always active"
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:p-5">
              <div className="flex items-start gap-3">
                <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-upisha-teal" />
                <div>
                  <Label
                    htmlFor="cookie-analytics"
                    className="text-sm font-semibold text-upisha-navy dark:text-white"
                  >
                    Analytics
                  </Label>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Google Analytics 4 — aggregate page views and usage. No
                    advertising, and IP addresses are anonymized. Off unless you opt
                    in.
                  </p>
                </div>
              </div>
              <Switch
                id="cookie-analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
                aria-label="Allow analytics cookies"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Read our{' '}
            <Link
              href="/cookie-policy"
              className="text-upisha-teal underline-offset-2 hover:underline"
            >
              Cookie Policy
            </Link>
            {lastSaved ? ` for details. Last saved: ${lastSaved}.` : ' for details.'}
          </p>

          <DialogFooter className="gap-2 [&>button]:h-11 [&>button]:w-full sm:[&>button]:h-10 sm:[&>button]:w-auto">
            <Button type="button" variant="outline" onClick={rejectNonEssential}>
              Reject non-essential
            </Button>
            <Button type="button" variant="outline" onClick={acceptAll}>
              Accept all
            </Button>
            <Button
              type="button"
              onClick={() => savePreferences({ analytics })}
              className="bg-upisha-teal text-white hover:bg-upisha-teal-dark"
            >
              Save preferences
            </Button>
          </DialogFooter>

          {consent && (
            <button
              type="button"
              onClick={resetConsent}
              className="mx-auto text-xs text-gray-500 underline underline-offset-2 transition-colors hover:text-upisha-teal dark:text-gray-400"
            >
              Withdraw consent and reset my choice
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
