'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, CheckCircle2, XCircle, Clock3, Calendar, Clock, User, Monitor, FileText, ExternalLink, Receipt as ReceiptIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/components/sections'
import Link from 'next/link'
import ReceiptPrintable from '@/components/receipts/ReceiptPrintable'
import ReceiptDownload from '@/components/receipts/ReceiptDownload'
import type { ReceiptDoc } from '@/lib/types'

interface LookupResult {
  registration: {
    id: string
    fullName: string
    webinarTitle: string
    webinarType?: 'paid' | 'free'
    status?: 'pending' | 'confirmed' | 'rejected'
    registrationNumber?: string | null
    webinarDate?: string | null
    webinarTime?: string | null
    meetingLink?: string | null
    createdAt?: Date | string
  }
  certificates: Array<{
    id: string
    certificateNumber: string
    issueDate: string
    status?: 'issued' | 'revoked'
  }>
  receipt: {
    receiptNumber: string
    amount: number
    currency: string
    description: string
    paymentMethod?: string | null
    transactionNumber?: string | null
    status?: string
    issuedAt?: string | null
  } | null
}

const statusStyles: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock3 className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
}

export default function WebinarLookupPage() {
  const [regNumber, setRegNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  // Build a PII-safe ReceiptDoc for the printable component. Public lookup must
  // never expose email, phone, memberId, or any other private information, so we
  // omit memberEmail and use the already-public registration number as memberId.
  const receiptDoc: ReceiptDoc | null = result?.receipt
    ? {
        receiptNumber: result.receipt.receiptNumber,
        memberName: result.registration.fullName,
        memberEmail: '',
        memberUid: '',
        memberId: result.registration.registrationNumber || '',
        transactionType: 'webinar',
        description: result.receipt.description,
        amount: result.receipt.amount,
        currency: (result.receipt.currency as ReceiptDoc['currency']) || 'INR',
        transactionNumber: result.receipt.transactionNumber,
        paymentMethod: result.receipt.paymentMethod,
        status: (result.receipt.status as ReceiptDoc['status']) || 'paid',
        issuedAt: result.receipt.issuedAt ? new Date(result.receipt.issuedAt) : new Date(),
      }
    : null

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNumber.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/webinars/lookup?regNumber=${encodeURIComponent(regNumber.trim())}`)
      const text = await res.text()
      let data: LookupResult | null = null
      try {
        data = JSON.parse(text)
      } catch {
        // Not JSON - likely an error page; treat as not found
        setError('Registration not found. Please check the registration number and try again.')
        return
      }
      if (res.ok && data) {
        setResult(data)
      } else {
        const errData = data as unknown as { error?: string }
        setError(errData?.error || 'Registration not found')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Registration Lookup</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            Find Your Webinar Registration
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
            Enter your webinar registration number (e.g., UPISHA-WEB-AB12CD) to view your registration status and certificates.
          </p>
        </div>

        <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top">
          <CardHeader>
            <CardTitle className="text-upisha-navy dark:text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-upisha-teal" />
              Lookup Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="flex gap-3">
              <Input
                placeholder="UPISHA-WEB-XXXXXX"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
              <Button type="submit" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white shrink-0" disabled={loading || !regNumber.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="p-4 rounded-lg bg-upisha-teal/5 border border-upisha-teal/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="h-4 w-4 text-upisha-teal" />
                    <h3 className="font-semibold text-upisha-navy dark:text-white">{result.registration.webinarTitle}</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-upisha-teal" />
                      {result.registration.fullName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-upisha-teal" />
                      {result.registration.createdAt ? new Date(result.registration.createdAt.toString()).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-upisha-navy dark:text-white">
                      {result.registration.registrationNumber}
                    </span>
                    {result.registration.status && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[result.registration.status]?.className || ''}`}>
                        {statusStyles[result.registration.status]?.icon}
                        {statusStyles[result.registration.status]?.label || result.registration.status}
                      </span>
                    )}
                  </div>
                  {(result.registration.webinarDate || result.registration.webinarTime) && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-3.5 w-3.5 text-upisha-teal" />
                      {[result.registration.webinarDate, result.registration.webinarTime].filter(Boolean).join(' • ')}
                    </div>
                  )}
                  {result.registration.meetingLink ? (
                    <a
                      href={result.registration.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-upisha-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-upisha-teal-dark"
                    >
                      Join Now
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : result.registration.status === 'pending' ? (
                    <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                      The Join Now button will appear here once your registration is confirmed by the administrator.
                    </p>
                  ) : null}
                </div>

                {result.certificates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-upisha-navy dark:text-white mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-upisha-teal" />
                      Certificates
                    </h4>
                    <div className="space-y-2">
                      {result.certificates.map((cert) => (
                        <div key={cert.id} className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm text-upisha-navy dark:text-white">{cert.certificateNumber}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                          </div>
                          <Link href={`/verify/${cert.id}`}>
                            <Button size="sm" variant="outline" className="border-upisha-teal text-upisha-teal hover:bg-upisha-teal/10">
                              View Certificate
                            </Button>
                          </Link>
                        </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    {receiptDoc ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowReceipt((v) => !v)}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-upisha-teal/5 border border-upisha-teal/20 text-upisha-navy dark:text-white hover:bg-upisha-teal/10 transition-colors"
                        >
                          <span className="flex items-center gap-2 font-semibold">
                            <ReceiptIcon className="h-4 w-4 text-upisha-teal" />
                            Payment Receipt
                          </span>
                          <ChevronDown className={`h-4 w-4 text-upisha-teal transition-transform ${showReceipt ? 'rotate-180' : ''}`} />
                        </button>
                        {showReceipt && (
                          <div className="mt-3 space-y-3">
                            <ReceiptPrintable ref={receiptRef} receipt={receiptDoc} />
                            <div className="flex justify-center">
                              <ReceiptDownload
                                receiptRef={receiptRef}
                                fileName={`upisha-webinar-receipt-${receiptDoc.receiptNumber}`}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                        {result.registration.webinarType === 'free'
                          ? 'This is a free webinar — no payment receipt is required.'
                          : result.registration.status === 'confirmed'
                            ? 'Receipt has not been generated yet. Please contact the administrator.'
                            : 'Receipt will be generated after admin confirmation.'}
                      </div>
                    )}
                  </div>
                </motion.div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/webinars" className="text-sm text-gray-500 hover:text-upisha-teal">← View All Webinars</Link>
        </div>
      </div>
    </AnimatedSection>
  )
}