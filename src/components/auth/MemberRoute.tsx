'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { Loader2, MailCheck, MailWarning, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Route guard for the member panel.
 * Allows access for users with role 'member' or 'admin' whose email is verified.
 * Redirects unauthenticated users to /login and unknown roles to /.
 * Unverified members see a verification-required screen with a resend option.
 */
export default function MemberRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, role, loading, sendVerificationEmail } = useAuth()
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const isMember = role === 'member' || role === 'admin'
  const isVerified = user?.emailVerified === true

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && !isMember) {
      router.push('/')
    }
  }, [user, role, loading, isMember, router])

  const handleResendVerification = async () => {
    setResending(true)
    setResendMessage(null)
    try {
      await sendVerificationEmail()
      setResendMessage('Verification email sent! Please check your inbox.')
    } catch {
      setResendMessage('Failed to send verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  if (!user || !isMember) return null

  // Email verification required for member dashboard access
  if (!isVerified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MailWarning className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-upisha-navy dark:text-white mb-2">
            Email Verification Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Please verify your email address to access the member dashboard.
            We've sent a verification link to <span className="font-medium">{user.email}</span>.
            Check your inbox and click the link to verify your account.
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white"
            >
              {resending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
            {resendMessage && (
              <p className="text-sm text-upisha-teal dark:text-upisha-teal-light flex items-center justify-center gap-1">
                <MailCheck className="h-4 w-4" />
                {resendMessage}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              After verifying, refresh this page to continue.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}