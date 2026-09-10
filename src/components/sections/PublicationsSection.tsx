'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Menu, X, Phone, Mail, MapPin, ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Users, BookOpen, FileText, Award, Camera, UserPlus, Ear, MessageSquare,
  Heart, Stethoscope, GraduationCap, Globe, Facebook, Twitter, Instagram,
  Linkedin, Youtube, Send, Clock, Calendar, ArrowRight, CheckCircle2,
  Star, Briefcase, Shield, ExternalLink, Download, Eye, Quote,
  Activity, Microscope, HandHeart, TrendingUp, Building2, Newspaper,
  PlayCircle, Sun, Moon, Bell, Timer, Sparkles, Search, AlertCircle,
  Megaphone, Lightbulb, Trophy, MapPinned, Command, Share2, Printer,
  PhoneCall, Building, Mailbox, Zap, Loader2, Upload, Lock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AnimatedSection } from '@/components/sections'
import { useAuth } from '@/lib/hooks/useAuth'
import { csrfHeaders } from '@/lib/csrf'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export interface PublicationItem {
  id?: string
  title: string
  description: string
  type: 'Journal'
  author?: string | null
  fileUrl?: string | null
  link?: string | null
  isActive?: boolean
}

/* ─── Publications Section ─── */
interface PublicationsSectionProps {
  initialPublications?: PublicationItem[]
}

export function PublicationsSection({ initialPublications }: PublicationsSectionProps = {}) {
  const [publications, setPublications] = useState<PublicationItem[]>(() =>
    (initialPublications ?? []).filter((p) => p.isActive !== false)
  )
  const [loading, setLoading] = useState(!initialPublications)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitType, setSubmitType] = useState<'Journal'>('Journal')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    abstract: '',
    fileUrl: '',
  })

  useEffect(() => {
    if (initialPublications) return
    async function loadPublications() {
      try {
        const response = await fetch('/api/publications')
        const data = await response.json()
        if (data.publications && data.publications.length > 0) {
          setPublications(data.publications.filter((p: PublicationItem) => p.isActive !== false))
        }
      } catch (error) {
        console.error('Failed to load publications:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPublications()
  }, [])

  const journalItems = publications.filter((p) => p.type === 'Journal')

  const handleSubmitClick = (type: 'Journal') => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please login as a member to submit your work.' })
      router.push('/login')
      return
    }
    setSubmitType(type)
    setFormData({ title: '', description: '', abstract: '', fileUrl: '' })
    setSubmitOpen(true)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({ title: 'Error', description: 'Please select a PDF file', variant: 'destructive' })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'PDF size should be less than 10MB', variant: 'destructive' })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string
        const timestamp = Date.now()
        const filename = `publications/${timestamp}-${file.name.replace(/\s+/g, '-')}`
        
        setUploadProgress(50)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: csrfHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ dataUrl, path: filename }),
        })

        if (!response.ok) throw new Error('Upload failed')

        const data = await response.json()
        setUploadProgress(100)
        
        setFormData({ ...formData, fileUrl: data.url })
        toast({ title: 'Success', description: 'PDF uploaded successfully' })
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to upload PDF', variant: 'destructive' })
      } finally {
        setUploading(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.onerror = () => {
      toast({ title: 'Error', description: 'Failed to read file', variant: 'destructive' })
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.email) {
      toast({ title: 'Error', description: 'Please login to submit', variant: 'destructive' })
      return
    }
    if (!formData.title || formData.title.trim().length < 2) {
      toast({ title: 'Validation error', description: 'Title must be at least 2 characters', variant: 'destructive' })
      return
    }
    if (!formData.description || formData.description.trim().length < 10) {
      toast({ title: 'Validation error', description: 'Description must be at least 10 characters', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch('/api/publications/submissions', {
        method: 'POST',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: submitType,
          authorName: user.displayName || user.email,
          authorEmail: user.email,
          abstract: formData.abstract || null,
          fileUrl: formData.fileUrl || null,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to submit')
      }

      toast({ title: 'Submission received!', description: 'Your work is pending admin review. You will be notified once approved.' })
      setSubmitOpen(false)
      setFormData({ title: '', description: '', abstract: '', fileUrl: '' })
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to submit', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatedSection id="publications" className="py-16 md:py-20 bg-white dark:bg-gray-900 border-t-2 border-t-upisha-teal/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-gold/10 text-upisha-gold mb-3">Research & Knowledge</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Publications</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Explore our journal contributions that advance the field of
            speech and hearing sciences.
          </p>
        </div>

        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="mx-auto flex w-fit bg-upisha-teal-light dark:bg-gray-800">
            <TabsTrigger
              value="journal"
              className="data-[state=active]:bg-upisha-teal data-[state=active]:text-white"
            >
              Journal
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
            </div>
          ) : (
            <>
              <TabsContent value="journal" className="mt-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top card-gradient-border">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="h-8 w-8 text-upisha-teal" />
                        <div>
                          <h3 className="font-bold text-upisha-navy dark:text-white text-lg">
                            UP Journal of Speech & Hearing
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Official Peer-Reviewed Journal</p>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        The UP Journal of Speech & Hearing is the official peer-reviewed publication of
                        UP ISHA, featuring original research, case studies, clinical reports, and review
                        articles in audiology and speech-language pathology.
                      </p>
                      {journalItems.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-semibold text-upisha-navy dark:text-white text-sm">Current Issue Highlights:</h4>
                          <ul className="space-y-1.5">
                            {journalItems.map((item, i) => (
                              <li key={item.id || i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-upisha-teal shrink-0 mt-0.5" />
                                <span>
                                  {item.title}
                                  {item.author && <span className="text-gray-400"> — {item.author}</span>}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <Link href="/publications">
                          <Button size="sm" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                            <Eye className="h-4 w-4 mr-1" />
                            Current Issue
                          </Button>
                        </Link>
                        <Link href="/publications">
                          <Button size="sm" variant="outline" className="border-upisha-teal text-upisha-teal">
                            <FileText className="h-4 w-4 mr-1" />
                            Previous Issues
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="border-upisha-gold text-upisha-gold" onClick={() => handleSubmitClick('Journal')}>
                          <Upload className="h-4 w-4 mr-1" />
                          Submit Paper
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-upisha-gold/20 bg-upisha-gold-light/30 dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-upisha-navy dark:text-white mb-4">Call for Papers</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        We invite researchers, clinicians, and academicians to submit original research
                        articles, case studies, and reviews for publication in the UP Journal of Speech
                        & Hearing.
                      </p>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="h-4 w-4 text-upisha-gold" />
                          Submission Deadline: June 30, 2026
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <FileText className="h-4 w-4 text-upisha-gold" />
                          Follow APA 7th Edition formatting
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Send className="h-4 w-4 text-upisha-gold" />
                          Submit to: office@upisha.org
                        </div>
                      </div>
                      <Button size="sm" className="bg-upisha-gold hover:bg-upisha-gold/90 text-white">
                        <Download className="h-4 w-4 mr-1" />
                        Author Guidelines
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Submission Dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Paper</DialogTitle>
            <DialogDescription>
              Fill in the details below to submit your work for review. Your submission will be reviewed by our editorial team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pubTitle">Title *</Label>
              <Input
                id="pubTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter the title of your work"
                required
              />
            </div>
            <div>
              <Label htmlFor="pubDesc">Description *</Label>
              <Textarea
                id="pubDesc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your work"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="pubAbstract">Abstract</Label>
              <Textarea
                id="pubAbstract"
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                placeholder="Abstract or summary (optional)"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="pubFile">Upload PDF</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  ref={fileInputRef}
                  id="pubFile"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {uploading && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Supported format: PDF (max 10MB)</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              Submitting as: {user?.email}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white" disabled={submitting || uploading}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AnimatedSection>
  )
}