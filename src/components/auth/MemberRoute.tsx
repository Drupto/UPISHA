'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { Loader2, MailCheck, MailWarning, RefreshCw, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
/**
 * Route guard for the member panel with 2-layer security:
 *   Layer 1: Email verification
 *   Layer 2: Admin approval (member status must be 'approved')
 * Admins bypass Layer 2 (they always have access).
 * Redirects unauthenticated users to /login and unknown roles to /.
 */
export default function MemberRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, role, memberStatus, loading, sendVerificationEmail, recheckEmailVerification } = useAuth()
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [rechecking, setRechecking] = useState(false)
  const [recheckMessage, setRecheckMessage] = useState<string | null>(null)

  const isMember = role === 'member' || role === 'admin'
  const isVerified = user?.emailVerified === true
  // Layer 2: Admin approval — member status must be 'approved'
  // Admins bypass this check entirely
  const isApproved = role === 'admin' || memberStatus === 'approved'

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

  /**
   * Force-refresh the account from Firebase (reload + getIdToken(true)),
   * re-establish the session cookie with the fresh claims, and re-run the
   * role/status fetch. Avoids the old "refresh this page" advice, which
   * just re-read the same cached token.
   */
  const handleRecheck = async () => {
    setRechecking(true)
    setRecheckMessage(null)
    const verified = await recheckEmailVerification()
    setRechecking(false)
    if (verified) {
      setRecheckMessage('Verified! Updating your session...')
      // The emailVerified gate re-renders automatically once the refreshed
      // user object lands in the auth context.
    } else {
      setRecheckMessage(
        'Still pending — open the verification email and click the link, then press recheck again.'
      )
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

  // ── Layer 1: Email verification required for member dashboard access ──
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
            <Button
              onClick={handleRecheck}
              disabled={rechecking}
              variant="outline"
              className="w-full"
            >
              {rechecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <MailCheck className="h-4 w-4 mr-2" />
                  I&apos;ve Verified — Recheck Now
                </>
              )}
            </Button>
            {recheckMessage && (
              <p className={`text-sm flex items-center justify-center gap-1 ${
                recheckMessage.startsWith('Verified')
                  ? 'text-upisha-teal dark:text-upisha-teal-light'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <MailCheck className="h-4 w-4" />
                {recheckMessage}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Just clicked the verification link? Press recheck — no page reload needed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Layer 2: Admin approval required for member dashboard access ──
  if (!isApproved) {
    const isRejected = memberStatus === 'rejected'
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            isRejected
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
            {isRejected ? (
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            ) : (
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <h2 className="text-xl font-bold text-upisha-navy dark:text-white mb-2">
            {isRejected ? 'Membership Application Rejected' : 'Pending Admin Approval'}
          </h2>
          {isRejected ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Your membership application has been reviewed and was not approved at this time.
              Please contact UP ISHA for assistance or clarification.
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Your email is verified. Your membership application is currently
              <span className="font-medium"> pending admin approval</span>.
              Once an admin approves your membership, you'll be able to access the member portal
              to review your profile and benefits.
            </p>
          )}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white"
            >
              Back to Website
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isRejected
                ? 'If you believe this is an error, please reach out to UP ISHA.'
                : 'Please check back later. You will be able to access the portal once approved.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}