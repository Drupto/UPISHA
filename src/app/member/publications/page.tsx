'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Loader2, CheckCircle2, XCircle, Clock3, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface SubmissionItem {
  id: string
  title: string
  description: string
  type: 'Journal'
  authorName: string
  authorEmail: string
  abstract?: string | null
  fileUrl?: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: Date
}

const statusStyles: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock3 className="h-3 w-3" /> },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
}

// Safely parse a date from various formats (Date, ISO string, Firestore Timestamp object)
function formatSubmissionDate(value: unknown): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  // Firestore Timestamp serialized as { _seconds, _nanoseconds } or { seconds, nanoseconds }
  if (typeof value === 'object') {
    const ts = value as { _seconds?: number; seconds?: number; _nanoseconds?: number; nanoseconds?: number }
    const seconds = ts._seconds ?? ts.seconds
    if (typeof seconds === 'number') {
      const ms = seconds * 1000 + (ts._nanoseconds ?? ts.nanoseconds ?? 0) / 1_000_000
      const d = new Date(ms)
      return isNaN(d.getTime()) ? null : d
    }
  }

  const d = new Date(value as string | number)
  return isNaN(d.getTime()) ? null : d
}

export default function MemberPublicationsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch('/api/publications/submissions/mine')
        if (res.ok) {
          const data = await res.json()
          setSubmissions(data.submissions || [])
        } else {
          setError('Failed to load your submissions')
        }
      } catch {
        setError('Failed to load your submissions')
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6">My Publications</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {submissions.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-12 text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>You haven't submitted any publications yet.</p>
              <p className="text-sm mt-2">Visit the Publications section on the homepage to submit your work.</p>
              <Link href="/#publications" className="inline-block mt-4">
                <Button size="sm" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                  Go to Publications
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const st = statusStyles[sub.status]
              return (
                <Card key={sub.id} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-upisha-navy dark:text-white truncate">
                            {sub.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${st.className}`}>
                            {st.icon}
                            {st.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {sub.type}
                          </span>
                          <span>
                            Submitted: {formatSubmissionDate(sub.createdAt)?.toLocaleDateString() || '-'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {sub.description}
                        </p>
                        {sub.fileUrl && (
                          <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-upisha-teal mt-2 hover:underline">
                            <ExternalLink className="h-3 w-3" />
                            View PDF
                          </a>
                        )}
                      </div>
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