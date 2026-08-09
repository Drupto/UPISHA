'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Award, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import CertificatePreview from '@/components/certificates/CertificatePreview'
import CertificateDownload from '@/components/certificates/CertificateDownload'
import type { CertificateTemplateDoc } from '@/lib/types'

interface CertificateItem {
  id: string
  templateId: string
  memberId: string
  memberName: string
  membershipType: string
  qualification?: string | null
  certificateNumber: string
  issueDate: string
  status?: string
  template?: CertificateTemplateDoc | null
}

export default function MemberCertificates() {
  const { toast } = useToast()
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const certRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates/mine')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to load certificates')
      }
      const data = await res.json()
      setCertificates(data.certificates || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certificates')
      toast({ title: 'Error', description: 'Failed to load certificates', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchCertificates} className="text-upisha-teal hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-upisha-navy dark:text-white mb-2">
          No Certificates Issued Yet
        </h2>
        <p className="text-gray-500">
          Your membership certificate will appear here once issued.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-upisha-navy dark:text-white">My Certificates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Download or print your official UP ISHA certificates
          </p>
        </div>
        <Badge className="bg-upisha-teal/10 text-upisha-teal">
          {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'}
        </Badge>
      </div>

      {certificates.map((cert) => {
        const validCertificate = cert.template
          ? {
              ...cert.template,
              id: cert.templateId || cert.template.id,
            }
          : null

        return (
          <div key={cert.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-upisha-teal/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-upisha-teal" />
                </div>
                <div>
                  <h2 className="font-semibold text-upisha-navy dark:text-white">
                    {validCertificate?.name || 'Certificate'}
                  </h2>
                  <p className="text-sm text-gray-500">{cert.certificateNumber}</p>
                </div>
              </div>
              <Badge variant={cert.status === 'revoked' ? 'destructive' : 'default'}>
                {cert.status === 'revoked' ? 'Revoked' : 'Active'}
              </Badge>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-4">
                <div
                  ref={(el) => {
                    certRefs.current[cert.id] = el
                  }}
                >
                  <CertificatePreview
                    template={validCertificate}
                    memberName={cert.memberName}
                    membershipType={cert.membershipType}
                    memberId={cert.memberId}
                    date={cert.issueDate}
                    qualification={cert.qualification || undefined}
                    certificateNumber={cert.certificateNumber}
                  />
                </div>
                {cert.status !== 'revoked' && (
                  <div className="mt-4 flex justify-end">
                    <CertificateDownload
                      certificateRef={{ current: certRefs.current[cert.id] }}
                      fileName={`${cert.memberName.replace(/\s+/g, '-')}-${cert.certificateNumber}`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}