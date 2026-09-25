'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap, Globe2, BadgeCheck, Users, Presentation,
  Send, Loader2, CheckCircle2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AnimatedSection } from '@/components/sections'
import { csrfHeaders } from '@/lib/csrf'

/* ─── Teach on UP ISHA Section ─── */

const TEACH_FORMATS = [
  { value: 'webinar', label: 'Webinar (single online session)' },
  { value: 'workshop', label: 'Workshop (hands-on session)' },
  { value: 'course', label: 'Course (multi-session series)' },
  { value: 'other', label: 'Something else' },
] as const

type TeachFormat = (typeof TEACH_FORMATS)[number]['value']

const defaultFormData = {
  name: '',
  email: '',
  phone: '',
  qualification: '',
  expertise: '',
  topic: '',
  experience: '',
  format: '' as TeachFormat | '',
  city: '',
  links: '',
  message: '',
}

type FormData = typeof defaultFormData

const benefits = [
  {
    icon: Globe2,
    title: 'Reach a Wider Audience',
    description: 'Share your knowledge with speech & hearing professionals and students across Uttar Pradesh and beyond.',
  },
  {
    icon: BadgeCheck,
    title: 'Build Your Recognition',
    description: 'Get featured on the UP ISHA platform and strengthen your professional profile as a subject-matter expert.',
  },
  {
    icon: Users,
    title: 'Grow Your Professional Profile',
    description: 'Build your reputation as an educator and connect with peers across the field.',
  },
]

function validateField(field: keyof FormData, value: string): string | null {
  switch (field) {
    case 'name':
      if (value.trim().length < 2) return 'Name must be at least 2 characters'
      break
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
      break
    case 'phone':
      if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value)) return 'Please enter a valid phone number'
      break
    case 'qualification':
      if (value.trim().length < 2) return 'Qualification is required'
      break
    case 'expertise':
      if (value.trim().length < 2) return 'Area of expertise is required'
      break
    case 'topic':
      if (value.trim().length < 10) return 'Please describe what you would like to teach (at least 10 characters)'
      break
    case 'experience':
      if (value.trim().length < 2) return 'Please briefly describe your experience'
      break
    case 'format':
      if (!value) return 'Please choose a format'
      break
  }
  return null
}

function TeachRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors: Partial<Record<keyof FormData, string>> = {}
  ;(Object.keys(formData) as (keyof FormData)[]).forEach((key) => {
    if (touched[key]) {
      const err = validateField(key, formData[key])
      if (err) errors[key] = err
    }
  })

  const setField = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const markTouched = (field: keyof FormData) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate everything on submit
    const allErrors: Partial<Record<keyof FormData, string>> = {}
    ;(Object.keys(formData) as (keyof FormData)[]).forEach((key) => {
      const err = validateField(key, formData[key])
      if (err) allErrors[key] = err
    })
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    )
    if (Object.keys(allErrors).length > 0) {
      toast({
        title: 'Please check the form',
        description: Object.values(allErrors)[0],
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/teach-requests', {
        method: 'POST',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json().catch(() => null)
        toast({
          title: 'Submission failed',
          description: data?.error || 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Could not submit your request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const labelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block'
  const errCls = 'text-xs text-red-500 mt-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="teach-name" className={labelCls}>Full Name *</label>
          <Input
            id="teach-name"
            value={formData.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => markTouched('name')}
            placeholder="Dr. A. Kumar"
            className="input-focus-ring"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p role="alert" className={errCls}>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="teach-email" className={labelCls}>Email *</label>
          <Input
            id="teach-email"
            type="email"
            value={formData.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={() => markTouched('email')}
            placeholder="you@example.com"
            className="input-focus-ring"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p role="alert" className={errCls}>{errors.email}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="teach-phone" className={labelCls}>Phone *</label>
          <Input
            id="teach-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setField('phone', e.target.value)}
            onBlur={() => markTouched('phone')}
            placeholder="+91 98765 43210"
            className="input-focus-ring"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p role="alert" className={errCls}>{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="teach-city" className={labelCls}>City</label>
          <Input
            id="teach-city"
            value={formData.city}
            onChange={(e) => setField('city', e.target.value)}
            placeholder="Lucknow"
            className="input-focus-ring"
          />
        </div>
      </div>

      <div>
        <label htmlFor="teach-qualification" className={labelCls}>Qualification *</label>
        <Input
          id="teach-qualification"
          value={formData.qualification}
          onChange={(e) => setField('qualification', e.target.value)}
          onBlur={() => markTouched('qualification')}
          placeholder="BASLP / MASLP / Ph.D. ..."
          className="input-focus-ring"
          aria-invalid={!!errors.qualification}
        />
        {errors.qualification && <p role="alert" className={errCls}>{errors.qualification}</p>}
      </div>

      <div>
        <label htmlFor="teach-expertise" className={labelCls}>Area of Expertise *</label>
        <Input
          id="teach-expertise"
          value={formData.expertise}
          onChange={(e) => setField('expertise', e.target.value)}
          onBlur={() => markTouched('expertise')}
          placeholder="e.g. Pediatric audiology, dysphagia, AAC..."
          className="input-focus-ring"
          aria-invalid={!!errors.expertise}
        />
        {errors.expertise && <p role="alert" className={errCls}>{errors.expertise}</p>}
      </div>

      <div>
        <label htmlFor="teach-topic" className={labelCls}>What would you like to teach? *</label>
        <Textarea
          id="teach-topic"
          value={formData.topic}
          onChange={(e) => setField('topic', e.target.value)}
          onBlur={() => markTouched('topic')}
          placeholder="Describe the topic, session outline, and what attendees will learn..."
          rows={3}
          className="input-focus-ring"
          aria-invalid={!!errors.topic}
        />
        {errors.topic && <p role="alert" className={errCls}>{errors.topic}</p>}
      </div>

      <div>
        <label htmlFor="teach-experience" className={labelCls}>Relevant Experience *</label>
        <Textarea
          id="teach-experience"
          value={formData.experience}
          onChange={(e) => setField('experience', e.target.value)}
          onBlur={() => markTouched('experience')}
          placeholder="Years of practice, teaching experience, talks or publications..."
          rows={2}
          className="input-focus-ring"
          aria-invalid={!!errors.experience}
        />
        {errors.experience && <p role="alert" className={errCls}>{errors.experience}</p>}
      </div>

      <div>
        <label className={labelCls}>Preferred Format *</label>
        <Select
          value={formData.format}
          onValueChange={(value) => {
            setField('format', value)
            markTouched('format')
          }}
        >
          <SelectTrigger className="input-focus-ring w-full" aria-invalid={!!errors.format}>
            <SelectValue placeholder="Select a format" />
          </SelectTrigger>
          <SelectContent>
            {TEACH_FORMATS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.format && <p role="alert" className={errCls}>{errors.format}</p>}
      </div>

      <div>
        <label htmlFor="teach-links" className={labelCls}>Profile / Portfolio Links</label>
        <Input
          id="teach-links"
          value={formData.links}
          onChange={(e) => setField('links', e.target.value)}
          placeholder="LinkedIn, Google Scholar, personal website..."
          className="input-focus-ring"
        />
      </div>

      <div>
        <label htmlFor="teach-message" className={labelCls}>Additional Message</label>
        <Textarea
          id="teach-message"
          value={formData.message}
          onChange={(e) => setField('message', e.target.value)}
          placeholder="Anything else the team should know..."
          rows={2}
          className="input-focus-ring"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white glow-teal"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Application
          </>
        )}
      </Button>
      <p className="text-xs text-gray-400 text-center">
        Our team reviews every application and will reach out to you by email or phone.
      </p>
    </form>
  )
}

export function TeachSection() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSuccess = () => {
    setSubmitted(true)
    toast({
      title: 'Application submitted!',
      description: 'Thank you for your interest in teaching. Our team will contact you soon.',
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      // Reset after the close animation so the dialog opens fresh next time
      setTimeout(() => setSubmitted(false), 300)
    }
  }

  return (
    <AnimatedSection id="teach" className="py-16 md:py-20 bg-upisha-teal-light dark:bg-upisha-teal/10 border-t-2 border-t-upisha-gold/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-gold/10 text-upisha-gold mb-3">
            <GraduationCap className="h-3.5 w-3.5 mr-1" />
            For Professionals
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            Teach on UP ISHA
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Are you a speech &amp; hearing professional with expertise to share? Submit a request to
            teach — host webinars, workshops, or courses and inspire the next generation.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full card-gradient-top card-gradient-border card-lift border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-upisha-teal/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-upisha-teal" />
                  </div>
                  <h3 className="font-bold text-upisha-navy dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="bg-upisha-teal hover:bg-upisha-teal-dark text-white glow-teal px-8"
          >
            <Presentation className="h-5 w-5 mr-2" />
            Apply to Teach
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Fill out a short form — our team reviews every submission and contacts you directly.
          </p>
        </div>
      </div>

      {/* Application dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-upisha-navy dark:text-white">
              <GraduationCap className="h-5 w-5 text-upisha-teal" />
              Apply to Teach on UP ISHA
            </DialogTitle>
            <DialogDescription>
              Tell us about your expertise and what you would like to teach. The UP ISHA team will
              review your application and contact you.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-upisha-navy dark:text-white mb-2">
                Application Submitted!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Thank you for your interest in teaching with UP ISHA. Our team will review your
                application and reach out to you soon.
              </p>
              <Button onClick={() => handleOpenChange(false)} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <TeachRequestForm onSuccess={handleSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </AnimatedSection>
  )
}