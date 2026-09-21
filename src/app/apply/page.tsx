'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Sparkles, Send, AlertCircle, CheckCircle2, Upload, Camera, FileText, MapPin, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToastAction } from '@/components/ui/toast'
import { membershipTypes } from '@/lib/static-data'
import { joinSchema, JOIN_FIELD_LABELS } from '@/lib/validations'
import { AnimatedSection } from '@/components/sections'
import { csrfHeaders } from '@/lib/csrf'

const JOIN_FIELD_IDS: Record<string, string> = {
  fullName: 'join-fullname',
  email: 'join-email',
  password: 'join-password',
  phone: 'join-phone',
  qualification: 'join-qualification',
  rciNumber: 'join-rci-number',
  membershipType: 'join-membership-type',
  course: 'join-course',
  currentYear: 'join-current-year',
  city: 'join-city',
  transactionNumber: 'join-transaction-number',
  message: 'join-message',
  address: 'join-address',
  photoUrl: 'join-photo',
  rciCertificateUrl: 'join-rci-certificate',
  registrationDate: 'join-registration-date',
  declaration: 'join-declaration',
}

type JoinServerError = { field: string; message: string }

const defaultFormData = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  qualification: '',
  rciNumber: '',
  membershipType: '',
  course: '',
  currentYear: '',
  city: '',
  transactionNumber: '',
  message: '',
  address: '',
  photoUrl: '',
  rciCertificateUrl: '',
  registrationDate: '',
  declaration: false,
}

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState(defaultFormData)
  const [joinTouched, setJoinTouched] = useState<Record<string, boolean>>({})
  const [joinServerErrors, setJoinServerErrors] = useState<Record<string, string>>({})
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null)
  const [rciUploadError, setRciUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showRestored, setShowRestored] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [rciPreview, setRciPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const rciInputRef = useRef<HTMLInputElement>(null)

  const joinErrors: Record<string, string> = {}
  if (joinTouched.fullName && formData.fullName.trim().length < 2) joinErrors.fullName = 'Name must be at least 2 characters'
  if (joinTouched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) joinErrors.email = 'Please enter a valid email address'
  if (joinTouched.password && formData.password.length < 8) joinErrors.password = 'Password must be at least 8 characters'
  else if (joinTouched.password && formData.password.length >= 8 && !/[A-Z]/.test(formData.password)) joinErrors.password = 'Password must contain at least one uppercase letter (A–Z)'
  else if (joinTouched.password && formData.password.length >= 8 && !/[a-z]/.test(formData.password)) joinErrors.password = 'Password must contain at least one lowercase letter (a–z)'
  else if (joinTouched.password && formData.password.length >= 8 && !/[0-9]/.test(formData.password)) joinErrors.password = 'Password must contain at least one number (0–9)'
  if (joinTouched.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) joinErrors.phone = 'Please enter a valid 10-digit phone number'
  if (joinTouched.city && formData.city.trim().length === 0) joinErrors.city = 'City is required'
  if (joinTouched.transactionNumber && formData.transactionNumber.trim().length < 2) joinErrors.transactionNumber = 'Transaction number is required'
  if (joinTouched.membershipType && !formData.membershipType) joinErrors.membershipType = 'Please select a membership type'
  if (joinTouched.address && formData.address.trim().length < 5) joinErrors.address = 'Address must be at least 5 characters'
  if (joinTouched.qualification && formData.qualification.trim().length < 2) joinErrors.qualification = 'Qualification is required'
  if (joinTouched.course && formData.course.trim().length < 2) joinErrors.course = 'Course is required for student members'
  if (joinTouched.currentYear && !formData.currentYear) joinErrors.currentYear = 'Please select your current year of study'
  if (joinTouched.declaration && !formData.declaration) joinErrors.declaration = 'You must accept the declaration to submit'
  if (joinTouched.photoUrl && !formData.photoUrl) joinErrors.photoUrl = 'Please upload your photo'

  // Server-side errors (from the last submit attempt) merge with the live
  // client-side checks so the exact failing field stays highlighted.
  const allJoinErrors: Record<string, string> = { ...joinServerErrors, ...joinErrors }

  const scrollToJoinField = (field: string) => {
    const id = JOIN_FIELD_IDS[field]
    if (!id) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const focusable = el.querySelector('input, textarea, button')
      if (focusable instanceof HTMLElement) focusable.focus({ preventScroll: true })
      else if (el instanceof HTMLElement) el.focus({ preventScroll: true })
    }
  }

  const joinValid: Record<string, boolean> = {
    fullName: formData.fullName.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    password: formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) && /[0-9]/.test(formData.password),
    phone: /^\d{10}$/.test(formData.phone.replace(/\D/g, '')),
    city: formData.city.trim().length > 0,
    transactionNumber: formData.transactionNumber.trim().length >= 2,
    membershipType: !!formData.membershipType,
    address: formData.address.trim().length >= 5,
    declaration: formData.declaration === true,
    photoUrl: !!formData.photoUrl,
  }

  const joinFieldClass = (field: string) => {
    const touched = joinTouched[field]
    const error = allJoinErrors[field]
    const valid = joinValid[field]
    if (error && (touched || joinServerErrors[field])) return 'border-red-400 dark:border-red-500 focus-visible:border-red-500'
    if (touched && valid) return 'border-green-400 dark:border-green-500 focus-visible:border-green-400'
    return 'input-focus-ring'
  }

  const clearJoinServerError = (field: string) => {
    setJoinServerErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  useEffect(() => {
    const saved = localStorage.getItem('upisha-join-form')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>
        if (parsed && (parsed.fullName || parsed.email)) {
          // Ensure every field has a defined value (filter out null/undefined from saved data)
          const sanitized = { ...defaultFormData } as typeof defaultFormData
          for (const key of Object.keys(defaultFormData) as (keyof typeof defaultFormData)[]) {
            const value = parsed[key]
            if (value !== undefined && value !== null) {
              ;(sanitized as Record<keyof typeof defaultFormData, unknown>)[key] = value
            }
          }
          setFormData(sanitized)
          if (typeof parsed.photoUrl === 'string') setPhotoPreview(parsed.photoUrl)
          if (typeof parsed.rciCertificateUrl === 'string') setRciPreview(parsed.rciCertificateUrl)
          setShowRestored(true)
          setTimeout(() => setShowRestored(false), 6000)
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (formData.fullName || formData.email || formData.phone) {
      localStorage.setItem('upisha-join-form', JSON.stringify(formData))
    }
  }, [formData])

  const handleFileToBase64 = (file: File, field: 'photoUrl' | 'rciCertificateUrl'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      const message = 'Photo must be less than 5MB — please choose a smaller image.'
      setPhotoUploadError(message)
      setJoinTouched((prev) => ({ ...prev, photoUrl: true }))
      toast({
        title: 'Photo too large',
        description: message,
        variant: 'destructive',
      })
      return
    }
    if (!file.type.startsWith('image/')) {
      const message = 'Please upload an image file (JPEG, PNG, or WebP) for your photo.'
      setPhotoUploadError(message)
      setJoinTouched((prev) => ({ ...prev, photoUrl: true }))
      toast({
        title: 'Invalid photo type',
        description: message,
        variant: 'destructive',
      })
      return
    }
    setPhotoUploadError(null)
    clearJoinServerError('photoUrl')
    const base64 = await handleFileToBase64(file, 'photoUrl')
    setPhotoPreview(base64)
    setFormData({ ...formData, photoUrl: base64 })
  }

  const handleRciChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      const message = 'RCI certificate must be less than 10MB — please choose a smaller file.'
      setRciUploadError(message)
      toast({
        title: 'Certificate too large',
        description: message,
        variant: 'destructive',
      })
      return
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      const message = 'RCI certificate must be an image (JPEG/PNG) or a PDF file.'
      setRciUploadError(message)
      toast({
        title: 'Invalid certificate type',
        description: message,
        variant: 'destructive',
      })
      return
    }
    setRciUploadError(null)
    const base64 = await handleFileToBase64(file, 'rciCertificateUrl')
    setRciPreview(base64)
    setFormData({ ...formData, rciCertificateUrl: base64 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate the whole form against the same schema the API enforces, so
    // the user sees exactly which fields are wrong *before* anything is sent.
    const parsed = joinSchema.safeParse(formData)
    if (!parsed.success) {
      const fieldOrder = Object.keys(JOIN_FIELD_LABELS)
      const serverErrors: Record<string, string> = {}
      const touchedAll: Record<string, boolean> = {}
      for (const issue of parsed.error.issues) {
        const rawField = issue.path.length > 0 ? String(issue.path[0]) : 'form'
        const field = rawField in JOIN_FIELD_LABELS ? rawField : 'form'
        if (!(field in serverErrors)) serverErrors[field] = issue.message
        touchedAll[field] = true
      }
      setJoinServerErrors(serverErrors)
      setJoinTouched((prev) => ({ ...prev, ...touchedAll }))
      const fields = Object.keys(serverErrors).filter((f) => f !== 'form').sort(
        (a, b) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b)
      )
      const labels = fields.map((f) => JOIN_FIELD_LABELS[f] ?? f)
      toast({
        title: `Please fix ${fields.length} field${fields.length > 1 ? 's' : ''}`,
        description: labels.length > 0 ? `Needs attention: ${labels.join(', ')}` : 'Please fix the highlighted fields and try again.',
        variant: 'destructive',
      })
      if (fields.length > 0) {
        // Let the inline errors render before scrolling to the first one.
        setTimeout(() => scrollToJoinField(fields[0]), 50)
      }
      return
    }
    setJoinServerErrors({})
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
        localStorage.removeItem('upisha-join-form')
        const data = await res.json().catch(() => ({}))
        toast({
          title: 'Application submitted!',
          description: data.message || 'Account created! Please check your email to verify your account.',
        })
      } else {
        const errData = await res.json().catch(() => ({})) as {
          error?: string
          code?: string
          details?: JoinServerError[]
        }
        if (errData.code === 'EMAIL_EXISTS') {
          toast({
            title: 'Email already registered',
            description: 'An account with this email already exists — please sign in to your member portal instead of applying again.',
            variant: 'destructive',
            action: (
              <ToastAction altText="Go to login" onClick={() => router.push('/login')}>
                Go to Login
              </ToastAction>
            ),
          })
        } else if (Array.isArray(errData.details) && errData.details.length > 0) {
          const serverErrors: Record<string, string> = {}
          const touchedAll: Record<string, boolean> = {}
          for (const d of errData.details) {
            if (d.field && !(d.field in serverErrors)) {
              serverErrors[d.field] = d.message || 'Invalid value'
              touchedAll[d.field] = true
            }
          }
          setJoinServerErrors(serverErrors)
          setJoinTouched((prev) => ({ ...prev, ...touchedAll }))
          const fieldOrder = Object.keys(JOIN_FIELD_LABELS)
          const fields = Object.keys(serverErrors).filter((f) => f !== 'form').sort(
            (a, b) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b)
          )
          const fieldSummary = fields.length > 0
            ? `Needs attention: ${fields.map((f) => JOIN_FIELD_LABELS[f] ?? f).join(', ')}`
            : 'Please fix the highlighted fields and try again.'
          toast({
            title: 'Please fix the highlighted fields',
            description: errData.error && !/invalid input data/i.test(errData.error) ? errData.error : fieldSummary,
            variant: 'destructive',
          })
          if (fields.length > 0) {
            setTimeout(() => scrollToJoinField(fields[0]), 50)
          }
        } else if (res.status === 429) {
          toast({
            title: 'Too many attempts',
            description: errData.error || 'You have tried too many times. Please wait a while and try again later.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Submission failed',
            description: errData.error || 'Please try again or contact us directly.',
            variant: 'destructive',
          })
        }
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearForm = () => {
    setFormData(defaultFormData)
    setJoinServerErrors({})
    setJoinTouched({})
    setPhotoUploadError(null)
    setRciUploadError(null)
    setPhotoPreview(null)
    setRciPreview(null)
    localStorage.removeItem('upisha-join-form')
    toast({ title: 'Form cleared', description: 'All entered data has been removed.' })
  }

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 bg-white border border-gray-200 shadow-md">
            <img
              src="/images/upishalogo.png"
              alt="UP ISHA Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Membership</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Join UP ISHA</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Become a member of the leading professional body for speech and hearing professionals in
            Uttar Pradesh.
          </p>
        </div>

        <Card id="payment-details" className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-upisha-navy dark:text-white">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-upisha-navy dark:text-white mb-2">Bank Transfer</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><span className="font-medium">Account Name:</span> Uttar Pradesh Indian Speech and Hearing Association</p>
                  <p><span className="font-medium">Account No:</span> 126401003059</p>
                  <p><span className="font-medium">IFSC:</span> ICICI0001264</p>
                  <p><span className="font-medium">Bank:</span> ICICI BANK</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-upisha-navy dark:text-white mb-2">UPI Payment</h4>
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 flex items-center justify-center bg-white dark:bg-gray-900">
                  <img
                    src="/images/UPISHA_QR.png"
                    alt="UPI Payment QR Code"
                    className="w-full max-w-[220px] h-auto object-contain"
                    width={603}
                    height={972}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="apply-form" className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top scroll-mt-32 mt-8">
          <CardHeader>
            <CardTitle className="text-upisha-navy dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-upisha-teal" />
              Membership Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showRestored && (
              <div className="mb-4 p-3 rounded-lg bg-upisha-gold/10 border border-upisha-gold/30 text-xs text-upisha-navy dark:text-gray-200 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-upisha-gold shrink-0" />
                <span className="flex-1">We restored your previously entered form data.</span>
                <button
                  onClick={handleClearForm}
                  className="shrink-0 underline hover:text-upisha-teal"
                >
                  Clear
                </button>
              </div>
            )}
            {submitted ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-upisha-teal/10 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="h-12 w-12 text-upisha-teal" />
                </motion.div>
                <h3 className="text-xl font-bold text-upisha-navy dark:text-white mb-2">
                  Application Submitted!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Thank you for your interest in joining UP ISHA. Your account has been created and
                  a verification email has been sent. We will review your application and get back
                  to you shortly.
                </p>
                <Link href="/login" className="inline-block text-upisha-teal hover:underline text-sm font-medium">
                  Click here to sign in to your member portal →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Photo Upload */}
                <div id="join-photo" className="scroll-mt-32">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Photo *
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer transition-colors ${allJoinErrors.photoUrl ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600 hover:border-upisha-teal'}`}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => photoInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      <p className="text-[10px] text-gray-400 mt-1">Max 5MB. JPEG, PNG, or WebP.</p>
                      {photoUploadError && <p role="alert" className="text-xs text-red-500 mt-1">{photoUploadError}</p>}
                      {allJoinErrors.photoUrl && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.photoUrl}</p>}
                    </div>
                  </div>
                </div>

                {/* Membership Plan */}
                <div id="join-membership-type" className="scroll-mt-32">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Select Membership Plan *
                  </label>
                  <Select
                    value={formData.membershipType}
                    onValueChange={(value) => {
                      setFormData({ ...formData, membershipType: value })
                      clearJoinServerError('membershipType')
                    }}
                    onOpenChange={() => setJoinTouched((prev) => ({ ...prev, membershipType: true }))}
                  >
                    <SelectTrigger className={`w-full ${allJoinErrors.membershipType ? 'border-red-400' : joinTouched.membershipType && joinValid.membershipType ? 'border-green-400' : ''}`}>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="life">Life Member - ₹2,000</SelectItem>
                      <SelectItem value="annual">Annual Member - ₹1,000/year</SelectItem>
                      <SelectItem value="student">Student Member - ₹1,000 (Valid for 3 Years)</SelectItem>
                    </SelectContent>
                  </Select>
                  {allJoinErrors.membershipType && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.membershipType}</p>}
                </div>

                {/* Name & Email */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div id="join-fullname" className="scroll-mt-32">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        placeholder="Dr. Your Name"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value })
                          clearJoinServerError('fullName')
                        }}
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, fullName: true }))}
                        className={joinFieldClass('fullName')}
                      />
                      {joinTouched.fullName && joinValid.fullName && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {allJoinErrors.fullName && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {allJoinErrors.fullName && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.fullName}</p>}
                  </div>
                  <div id="join-email" className="scroll-mt-32">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Email *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          clearJoinServerError('email')
                        }}
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, email: true }))}
                        className={joinFieldClass('email')}
                      />
                      {joinTouched.email && joinValid.email && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {allJoinErrors.email && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {allJoinErrors.email && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.email}</p>}
                  </div>
                </div>

                {/* Password */}
                <div id="join-password" className="scroll-mt-32">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type="password"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
                        clearJoinServerError('password')
                      }}
                      onBlur={() => setJoinTouched((prev) => ({ ...prev, password: true }))}
                      className={joinFieldClass('password')}
                    />
                    {joinTouched.password && joinValid.password && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                    {allJoinErrors.password && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                  </div>
                  {allJoinErrors.password && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.password}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">Min 8 characters with at least one uppercase letter (A–Z), one lowercase letter (a–z) and one number (0–9). This password will be used to log into your account. A verification email will be sent.</p>
                </div>

                {/* Phone & City */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div id="join-phone" className="scroll-mt-32">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Phone *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        type="tel"
                        placeholder="+91-XXXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value })
                          clearJoinServerError('phone')
                        }}
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, phone: true }))}
                        className={joinFieldClass('phone')}
                      />
                      {joinTouched.phone && joinValid.phone && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {allJoinErrors.phone && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {allJoinErrors.phone && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.phone}</p>}
                  </div>
                  <div id="join-city" className="scroll-mt-32">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      City *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        placeholder="Lucknow"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value })
                          clearJoinServerError('city')
                        }}
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, city: true }))}
                        className={joinFieldClass('city')}
                      />
                      {joinTouched.city && joinValid.city && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {allJoinErrors.city && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {allJoinErrors.city && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.city}</p>}
                  </div>
                </div>

                {/* Address */}
                <div id="join-address" className="scroll-mt-32">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Address *
                  </label>
                  <div className="relative">
                    <Textarea
                      required
                      placeholder="Full address with street, city, state, and pincode"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value })
                        clearJoinServerError('address')
                      }}
                      onBlur={() => setJoinTouched((prev) => ({ ...prev, address: true }))}
                      rows={3}
                      className={joinFieldClass('address')}
                    />
                    {joinTouched.address && joinValid.address && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
                    {allJoinErrors.address && <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />}
                  </div>
                  {allJoinErrors.address && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.address}</p>}
                </div>

                {/* Qualification */}
                <div id="join-qualification" className="scroll-mt-32">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Qualification *
                  </label>
                  <Input
                    required
                    placeholder="M.Sc. (Audiology)"
                    value={formData.qualification}
                    onChange={(e) => {
                      setFormData({ ...formData, qualification: e.target.value })
                      clearJoinServerError('qualification')
                    }}
                    onBlur={() => setJoinTouched((prev) => ({ ...prev, qualification: true }))}
                    className={joinFieldClass('qualification')}
                  />
                  {allJoinErrors.qualification && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.qualification}</p>}
                </div>

                {/* Course & Current Year - Only for students */}
                {formData.membershipType === 'student' && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div id="join-course" className="scroll-mt-32">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Course *
                      </label>
                      <Input
                        required
                        placeholder="e.g. B.Sc. Audiology"
                        value={formData.course}
                        onChange={(e) => {
                          setFormData({ ...formData, course: e.target.value })
                          clearJoinServerError('course')
                        }}
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, course: true }))}
                        className={joinFieldClass('course')}
                      />
                      {allJoinErrors.course && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.course}</p>}
                    </div>
                    <div id="join-current-year" className="scroll-mt-32">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Current Year *
                      </label>
                      <Select
                        value={formData.currentYear}
                        onValueChange={(value) => {
                          setFormData({ ...formData, currentYear: value })
                          setJoinTouched((prev) => ({ ...prev, currentYear: true }))
                          clearJoinServerError('currentYear')
                        }}
                      >
                        <SelectTrigger className={`w-full ${allJoinErrors.currentYear ? 'border-red-400' : ''}`}>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                      {allJoinErrors.currentYear && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.currentYear}</p>}
                    </div>
                  </div>
                )}

                {/* RCI Number & Certificate - Only for non-students */}
                {formData.membershipType !== 'student' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          RCI Registration No.
                        </label>
                        <Input
                          placeholder="RCI Number"
                          value={formData.rciNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, rciNumber: e.target.value })
                          }
                          className="input-focus-ring"
                        />
                      </div>
                    </div>

                    {/* RCI Certificate Upload */}
                    <div id="join-rci-certificate" className="scroll-mt-32">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        RCI Certificate
                      </label>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer hover:border-upisha-teal transition-colors shrink-0"
                          onClick={() => rciInputRef.current?.click()}
                        >
                          {rciPreview ? (
                            <img src={rciPreview} alt="RCI Certificate" className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            ref={rciInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleRciChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => rciInputRef.current?.click()}
                            className="text-xs"
                          >
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            {rciPreview ? 'Change Certificate' : 'Upload Certificate'}
                          </Button>
                          <p className="text-[10px] text-gray-400 mt-1">Max 10MB. Image or PDF.</p>
                          {rciUploadError && <p role="alert" className="text-xs text-red-500 mt-1">{rciUploadError}</p>}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Registration Date */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Registration Date
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) =>
                        setFormData({ ...formData, registrationDate: e.target.value })
                      }
                      onBlur={() => setJoinTouched((prev) => ({ ...prev, registrationDate: true }))}
                      className="input-focus-ring"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">You can enter a past date if already registered locally.</p>
                </div>

                {/* Additional Message */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Additional Message
                  </label>
                  <Textarea
                    placeholder="Any additional information..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="input-focus-ring"
                  />
                </div>

                {/* Transaction Number */}
                <div id="join-transaction-number" className="scroll-mt-32">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Transaction Number *
                  </label>
                  <Input
                    required
                    placeholder="Enter payment transaction / reference number"
                    value={formData.transactionNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, transactionNumber: e.target.value })
                      clearJoinServerError('transactionNumber')
                    }}
                    onBlur={() => setJoinTouched((prev) => ({ ...prev, transactionNumber: true }))}
                    className={joinFieldClass('transactionNumber')}
                  />
                  {allJoinErrors.transactionNumber && <p role="alert" className="text-xs text-red-500 mt-1">{allJoinErrors.transactionNumber}</p>}
                </div>

                {/* Declaration */}
                <div id="join-declaration" className={`scroll-mt-32 p-4 rounded-lg bg-upisha-teal/5 border ${allJoinErrors.declaration ? 'border-red-400' : 'border-upisha-teal/20'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.declaration}
                      onChange={(e) => {
                        setFormData({ ...formData, declaration: e.target.checked })
                        setJoinTouched((prev) => ({ ...prev, declaration: true }))
                        clearJoinServerError('declaration')
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-upisha-teal focus:ring-upisha-teal"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      I declare that the information provided above is true and correct, and I consent to UP ISHA using my details for membership purposes
                    </span>
                  </label>
                  {allJoinErrors.declaration && <p role="alert" className="text-xs text-red-500 mt-2 ml-7">{allJoinErrors.declaration}</p>}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-upisha-teal hover:bg-upisha-teal-dark text-white glow-teal"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  {(formData.fullName || formData.email) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearForm}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
                  Your data is auto-saved locally as you type. Clearing browser data will remove it.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-16 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-upisha-teal">
            ← Back to website
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}