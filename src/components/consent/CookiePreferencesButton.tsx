'use client'

import { Button } from '@/components/ui/button'
import { requestOpenCookieSettings } from '@/lib/cookie-consent'

/**
 * Small client-side entry points into the global cookie preferences dialog.
 * They dispatch a window event handled by CookieConsentProvider, so they work
 * from any page (including server-rendered policy pages) without prop drilling.
 */

interface CookiePreferencesButtonProps {
  className?: string
  label?: string
}

export function CookiePreferencesButton({
  className,
  label = 'Manage cookie preferences',
}: CookiePreferencesButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={requestOpenCookieSettings}
      className={className}
    >
      {label}
    </Button>
  )
}

interface CookieSettingsLinkProps {
  className?: string
  children?: React.ReactNode
}

export function CookieSettingsLink({
  className,
  children = 'Cookie settings',
}: CookieSettingsLinkProps) {
  return (
    <button type="button" onClick={requestOpenCookieSettings} className={className}>
      {children}
    </button>
  )
}
