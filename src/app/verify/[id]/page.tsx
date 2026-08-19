'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { BadgeCheck, ShieldX, FileQuestion, Loader2, ShieldCheck } from 'lucide-react'
import { siteConfig } from '@/lib/seo'
import CertificatePreview from '@/components/certificates/CertificatePreview'
import CertificateDownload from '@/components/certificates/CertificateDownload'
import type { CertificateTemplateDoc } from '@/lib/types'

interface VerificationResult {
  id: string
  type?: string
  memberName: string
  certificateNumber: string
  membershipType: string
  issueDate: string
  status: string
  webinarTitle?: string | null
  webinarDate?: string | null
  webinarSpeaker?: string | null
  webinarDuration?: string | null
  template?: CertificateTemplateDoc
}

type VerifyState =
  | { type: 'loading' }
  | { type: 'valid'; data: VerificationResult }
  | { type: 'revoked'; data: VerificationResult }
  | { type: 'notfound' }
  | { type: 'error'; message: string }

function formatMembershipType(type: string): string {
  const map: Record<string, string> = {
    life: 'Life Member',
    annual: 'Annual Member',
    student: 'Student Member',
  }
  return map[type] || type
}

function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  try {
    return new Date(isoDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}

export default function VerifyCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const [state, setState] = useState<VerifyState>({ type: 'loading' })
  const certRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    const verify = async () => {
      const { id } = await params
      try {
        const res = await fetch('/api/certificates/verify/' + id)
        if (res.status === 404) {
          if (!cancelled) setState({ type: 'notfound' })
          return
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          if (!cancelled) setState({ type: 'error', message: err.error || 'Failed to verify certificate' })
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setState(
            data.status === 'revoked'
              ? { type: 'revoked', data }
              : { type: 'valid', data }
          )
        }
      } catch {
        if (!cancelled) setState({ type: 'error', message: 'Network error. Please try again.' })
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [params])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 py-12">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-upisha-teal/10 mb-4">
            <ShieldCheck className="h-8 w-8 text-upisha-teal" />
          </div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">
            Certificate Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {siteConfig.shortName} — Official Certificate Authenticity Check
          </p>
        </div>

        {state.type === 'loading' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
              <p className="text-sm text-gray-500 mt-3">Verifying certificate...</p>
            </div>
          </div>
        )}

        {state.type === 'valid' && (
          <div className="space-y-6">
            {/* Verdict banner */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-6 py-4 text-center">
              <BadgeCheck className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-green-700 dark:text-green-400">
                Valid Certificate
              </h2>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                This certificate is genuine and issued by {siteConfig.shortName}.
              </p>
            </div>

            {/* Actual rendered certificate */}
            <div ref={cardRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
              {state.data.template ? (
                <>
                  <CertificatePreview
                    template={state.data.template}
                    memberName={state.data.memberName}
                    membershipType={state.data.membershipType || 'all'}
                    certificateNumber={state.data.certificateNumber}
                    verificationUrl={typeof window !== 'undefined' ? `${window.location.origin}/verify/${state.data.id}` : ''}
                    certificateRef={certRef}
                    date={state.data.issueDate}
                    webinarTitle={state.data.webinarTitle || undefined}
                    webinarDate={state.data.webinarDate || undefined}
                    webinarSpeaker={state.data.webinarSpeaker || undefined}
                    duration={state.data.webinarDuration || undefined}
                  />
                  <div className="mt-6 flex justify-center">
                    <CertificateDownload
                      certificateRef={certRef}
                      fileName={`upisha-${state.data.type || 'membership'}-certificate-${state.data.certificateNumber}`}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-4">Certificate template unavailable.</p>
                  {/* Still show the verification details */}
                  <div className="max-w-md mx-auto text-left space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">Issued To</p>
                      <p className="text-lg font-semibold text-upisha-navy dark:text-white">{state.data.memberName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">Certificate No.</p>
                      <p className="font-mono text-sm text-upisha-navy dark:text-white">{state.data.certificateNumber}</p>
                    </div>
                    {state.data.type === 'webinar' && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400">Webinar</p>
                        <p className="text-sm text-upisha-navy dark:text-white">{state.data.webinarTitle || '-'}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">Issue Date</p>
                      <p className="text-sm text-upisha-navy dark:text-white">{formatDate(state.data.issueDate)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Verification details card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b dark:border-gray-700 px-6 py-3">
                <h3 className="font-semibold text-upisha-navy dark:text-white">Verification Details</h3>
              </div>
              <div className="px-6 py-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Issued To</p>
                  <p className="text-base font-semibold text-upisha-navy dark:text-white">{state.data.memberName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Certificate No.</p>
                  <p className="font-mono text-sm text-upisha-navy dark:text-white">{state.data.certificateNumber}</p>
                </div>
                {state.data.type === 'webinar' ? (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">Certificate Type</p>
                      <p className="text-sm text-upisha-navy dark:text-white">Webinar Participation</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">Webinar</p>
                      <p className="text-sm font-medium text-upisha-navy dark:text-white">{state.data.webinarTitle || '-'}</p>
                    </div>
                    {state.data.webinarSpeaker && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400">Speaker</p>
                        <p className="text-sm text-upisha-navy dark:text-white">{state.data.webinarSpeaker}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">Webinar Date</p>
                      <p className="text-sm text-upisha-navy dark:text-white">{state.data.webinarDate ? formatDate(state.data.webinarDate) : '-'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">Certificate Type</p>
                      <p className="text-sm text-upisha-navy dark:text-white">{formatMembershipType(state.data.membershipType)}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Issue Date</p>
                  <p className="text-sm text-upisha-navy dark:text-white">{formatDate(state.data.issueDate)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {state.type === 'revoked' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-5 text-center">
              <ShieldX className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                Certificate Revoked
              </h2>
              <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                This certificate has been revoked by {siteConfig.shortName} and is no longer valid.
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Issued To</p>
                <p className="text-lg font-semibold text-upisha-navy dark:text-white">{state.data.memberName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Certificate No.</p>
                  <p className="font-mono text-sm text-upisha-navy dark:text-white">{state.data.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Certificate Type</p>
                  <p className="text-sm text-upisha-navy dark:text-white">{formatMembershipType(state.data.membershipType)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Issue Date</p>
                <p className="text-sm text-upisha-navy dark:text-white">{formatDate(state.data.issueDate)}</p>
              </div>
            </div>
          </div>
        )}

        {state.type === 'notfound' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-16 text-center">
              <FileQuestion className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-upisha-navy dark:text-white">
                Certificate Not Found
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                No certificate matching this verification code was found in our records.
                This certificate may be fraudulent or the link may be incorrect.
              </p>
            </div>
          </div>
        )}

        {state.type === 'error' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-16 text-center">
              <ShieldX className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-upisha-navy dark:text-white">
                Verification Failed
              </h2>
              <p className="text-sm text-gray-500 mt-2">{state.message}</p>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <Link href="/" className="text-upisha-teal hover:underline font-medium">
              {siteConfig.shortName}
            </Link>{' '}
            — Uttar Pradesh Speech & Hearing Association
          </p>
        </div>
      </div>
    </div>
  )
}