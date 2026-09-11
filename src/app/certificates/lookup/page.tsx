'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Search, Loader2, Award, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import CertificatePreview from '@/components/certificates/CertificatePreview'
import CertificateDownload from '@/components/certificates/CertificateDownload'
import type { CertificateTemplateDoc } from '@/lib/types'

interface CertificateItem {
  id: string
  memberName: string
  certificateNumber: string
  issueDate: string
  webinarTitle?: string | null
  webinarDate?: string | null
  webinarSpeaker?: string | null
  webinarDuration?: string | null
  status?: string
  template?: CertificateTemplateDoc | null
}

export default function CertificateLookupPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const certRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' })
      return
    }

    setLoading(true)
    setSearched(true)
    setError(null)
    setCertificates([])
    try {
      const res = await fetch(`/api/certificates/lookup?email=${encodeURIComponent(trimmedEmail)}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to look up certificates')
      }
      const data = await res.json()
      setCertificates(data.certificates || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to look up certificates')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-upisha-teal/10 mb-4">
            <Award className="h-8 w-8 text-upisha-teal" />
          </div>
          <h1 className="text-3xl font-bold text-upisha-navy dark:text-white">
            Find My Certificate
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Enter the email address you used when registering for the webinar to view and download your participation certificate.
          </p>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
          </div>
        )}

        {!loading && searched && !error && certificates.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-upisha-navy dark:text-white mb-2">
              No Certificates Found
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              No webinar participation certificates were found for this email. Certificates are issued after the webinar has taken place. If you believe this is an error, please contact us.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={handleSearch} className="text-upisha-teal hover:underline">
              Try again
            </button>
          </div>
        )}

        {!loading && certificates.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-upisha-navy dark:text-white">
                  Your Certificates
                </h2>
                <p className="text-sm text-gray-500">
                  {certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'} found
                </p>
              </div>
            </div>

            {certificates.map((cert) => {
              const validCertificate = cert.template
                ? {
                    ...cert.template,
                    id: cert.template.id,
                  }
                : null

              return (
                <Card key={cert.id} className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-upisha-navy dark:text-white">
                          Certificate of Participation
                        </h3>
                        {cert.webinarTitle && (
                          <p className="text-sm text-gray-500">{cert.webinarTitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-upisha-teal/10 text-upisha-teal">Webinar</Badge>
                        <Badge variant={cert.status === 'revoked' ? 'destructive' : 'default'}>
                          {cert.status === 'revoked' ? 'Revoked' : 'Active'}
                        </Badge>
                      </div>
                    </div>

                    <CertificatePreview
                      template={validCertificate}
                      memberName={cert.memberName}
                      memberId=""
                      date={cert.issueDate}
                      certificateNumber={cert.certificateNumber}
                      verificationUrl={`${window.location.origin}/verify/${cert.id}`}
                      webinarTitle={cert.webinarTitle || undefined}
                      webinarDate={cert.webinarDate || undefined}
                      webinarSpeaker={cert.webinarSpeaker || undefined}
                      duration={cert.webinarDuration || undefined}
                      certificateRef={(el) => {
                        certRefs.current[cert.id] = el
                      }}
                    />

                    {cert.status !== 'revoked' && (
                      <div className="flex justify-end">
                        <CertificateDownload
                          certificateRef={() => certRefs.current[cert.id] ?? null}
                          fileName={`${cert.memberName.replace(/\s+/g, '-')}-${cert.certificateNumber}`}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-upisha-teal" />
                      <span>
                        This certificate can be verified publicly by scanning its QR code or visiting{' '}
                        <Link
                          href={`/verify/${cert.id}`}
                          className="text-upisha-teal hover:underline"
                        >
                          the verification page
                        </Link>
                        .
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}