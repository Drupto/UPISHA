'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, FileText, Loader2, AlertCircle, ExternalLink, Download, Calendar, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedSection } from '@/components/sections'

interface JournalIssue {
  id?: string
  title: string
  description: string
  type: 'Journal'
  author?: string | null
  fileUrl?: string | null
  link?: string | null
  isActive?: boolean
  createdAt?: Date
}

// Fallback static journal issues when API returns empty
const fallbackIssues: JournalIssue[] = [
  { id: 'current-issue', title: 'UP Journal of Speech & Hearing - Vol 12, Issue 1', description: 'Effectiveness of Tele-Audiology in Rural UP, Language Development in Hindi-Speaking Children, Cochlear Implant Outcomes: A 5-Year Review', type: 'Journal', isActive: true },
  { id: 'issue-11', title: 'UP Journal of Speech & Hearing - Vol 11, Issue 2', description: 'Auditory Processing Disorders in School-Aged Children, Voice Therapy Outcomes in Teachers, Stuttering Assessment in Bilingual Populations', type: 'Journal', isActive: true },
  { id: 'issue-10', title: 'UP Journal of Speech & Hearing - Vol 11, Issue 1', description: 'Newborn Hearing Screening in Uttar Pradesh, Language Intervention in Autism Spectrum Disorder, Hearing Aid Fitting in Elderly Populations', type: 'Journal', isActive: true },
  { id: 'issue-9', title: 'UP Journal of Speech & Hearing - Vol 10, Issue 2', description: 'Tinnitus Management: Evidence-Based Approaches, Craniofacial Anomalies and Speech, Early Childhood Aural Rehabilitation', type: 'Journal', isActive: true },
  { id: 'issue-8', title: 'UP Journal of Speech & Hearing - Vol 10, Issue 1', description: 'Cochlear Implant Rehabilitation Protocols, Dysphagia Management in Stroke Patients, Speech Therapy in Rural Communities', type: 'Journal', isActive: true },
]

export default function PublicationsPage() {
  const [issues, setIssues] = useState<JournalIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch('/api/publications')
        if (res.ok) {
          const data = await res.json()
          const journalIssues = (data.publications || []).filter((p: JournalIssue) => p.type === 'Journal' && p.isActive !== false)
          setIssues(journalIssues.length > 0 ? journalIssues : fallbackIssues)
        } else {
          setError('Failed to load publications')
        }
      } catch {
        setIssues(fallbackIssues)
      } finally {
        setLoading(false)
      }
    }
    fetchIssues()
  }, [])

  const currentIssue = issues[0]
  const previousIssues = issues.slice(1)

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-gold/10 text-upisha-gold mb-3">Research & Knowledge</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            UP Journal of Speech & Hearing
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            The official peer-reviewed publication of UP ISHA featuring original research, case studies,
            clinical reports, and review articles in audiology and speech-language pathology.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Current Issue */}
            {currentIssue && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-upisha-teal" />
                  <h2 className="text-xl font-bold text-upisha-navy dark:text-white">Current Issue</h2>
                  <Badge className="bg-upisha-teal/10 text-upisha-teal">Latest</Badge>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top card-gradient-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-upisha-navy dark:text-white text-lg mb-2">
                            {currentIssue.title}
                          </h3>
                          {currentIssue.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                              {currentIssue.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {currentIssue.fileUrl ? (
                              <a href={currentIssue.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                                  <Download className="h-4 w-4 mr-1" />
                                  Read Full Issue
                                </Button>
                              </a>
                            ) : (
                              <Button size="sm" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                                <BookOpen className="h-4 w-4 mr-1" />
                                Read Full Issue
                              </Button>
                            )}
                            {currentIssue.author && (
                              <Badge variant="outline" className="text-upisha-teal border-upisha-teal/30">
                                {currentIssue.author}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Previous Issues */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-upisha-teal" />
                <h2 className="text-xl font-bold text-upisha-navy dark:text-white">Previous Issues</h2>
              </div>
              {previousIssues.length === 0 ? (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-8 text-center text-gray-500">
                    <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    No previous issues available yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {previousIssues.map((issue, index) => (
                    <motion.div
                      key={issue.id || `prev-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="dark:bg-gray-800 dark:border-gray-700 hover:border-upisha-teal/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-upisha-navy dark:text-white text-sm mb-1">
                                {issue.title}
                              </h3>
                              {issue.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {issue.description}
                                </p>
                              )}
                            </div>
                            {issue.fileUrl ? (
                              <a href={issue.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="border-upisha-teal text-upisha-teal shrink-0">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  View
                                </Button>
                              </a>
                            ) : (
                              <Button variant="outline" size="sm" className="border-upisha-teal text-upisha-teal shrink-0">
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/#publications" className="text-sm text-gray-500 hover:text-upisha-teal transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Publications
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}