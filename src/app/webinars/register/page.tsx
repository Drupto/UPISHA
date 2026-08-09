'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, Sparkles, Send, AlertCircle, CheckCircle2, Monitor, BadgeCheck, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AnimatedSection } from '@/components/sections'
import type { Webinar } from '@/lib/types'

export default function WebinarRegisterPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const preselectedWebinarId = searchParams.get('webinarId') || ''
  const preselectedWebinarTitle = searchParams.get('webinarTitle') || ''

  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [webinarsLoading, setWebinarsLoading] = useState(true)
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    city: '',
    webinarId: preselectedWebinarId,
    webinarTitle: preselectedWebinarTitle,
    transactionNumber: '',
    message: '',
    declaration: false,
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showRestored, setShowRestored] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null)

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const res = await fetch('/api/webinars')
        if (res.ok) {
          const data = await res.json()
          setWebinars(data.webinars || [])
        }
      } catch {
        // Silently fail
      } finally {
        setWebinarsLoading(false)
      }
    }
    fetchWebinars()
  }, [])

  // Track selected webinar for conditional UI
  useEffect(() => {
    if (formData.webinarId && webinars.length) {
      const found = webinars.find((w) => w.id === formData.webinarId) || null
      setSelectedWebinar(found)
    } else {
      setSelectedWebinar(null)
    }
  }, [formData.webinarId, webinars])

  const isFree = selectedWebinar?.type === 'free'

  const errors: Record<string, string> = {}
  if (touched.fullName && formData.fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters'
  if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address'
  if (touched.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Please enter a valid 10-digit phone number'
  if (touched.city && formData.city.trim().length === 0) errors.city = 'City is required'
  if (touched.webinarId && !formData.webinarId) errors.webinarId = 'Please select a webinar'
  if (!isFree && touched.transactionNumber && formData.transactionNumber.trim().length < 2) errors.transactionNumber = 'Transaction number is required'
  if (touched.declaration && !formData.declaration) errors.declaration = 'You must accept the declaration to submit'

  const valid: Record<string, boolean> = {
    fullName: formData.fullName.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    phone: /^\d{10}$/.test(formData.phone.replace(/\D/g, '')),
    city: formData.city.trim().length > 0,
    webinarId: !!formData.webinarId,
    transactionNumber: isFree ? true : formData.transactionNumber.trim().length >= 2,
    declaration: formData.declaration === true,
  }

  const fieldClass = (field: string) => {
    const t = touched[field]
    const e = errors[field]
    const v = valid[field]
    if (t && e) return 'border-red-400 dark:border-red-500 focus-visible:border-red-500'
    if (t && v) return 'border-green-400 dark:border-green-500 focus-visible:border-green-400'
    return 'input-focus-ring'
  }

  useEffect(() => {
    const saved = localStorage.getItem('upisha-webinar-reg-form')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>
        if (parsed && (parsed.fullName || parsed.email)) {
          setFormData((prev) => ({
            fullName: typeof parsed.fullName === 'string' ? parsed.fullName : prev.fullName,
            email: typeof parsed.email === 'string' ? parsed.email : prev.email,
            phone: typeof parsed.phone === 'string' ? parsed.phone : prev.phone,
            qualification: typeof parsed.qualification === 'string' ? parsed.qualification : prev.qualification,
            city: typeof parsed.city === 'string' ? parsed.city : prev.city,
            webinarId: typeof parsed.webinarId === 'string' ? parsed.webinarId : preselectedWebinarId,
            webinarTitle: typeof parsed.webinarTitle === 'string' ? parsed.webinarTitle : preselectedWebinarTitle,
            transactionNumber: typeof parsed.transactionNumber === 'string' ? parsed.transactionNumber : prev.transactionNumber,
            message: typeof parsed.message === 'string' ? parsed.message : prev.message,
            declaration: typeof parsed.declaration === 'boolean' ? parsed.declaration : prev.declaration,
          }))
          setShowRestored(true)
          setTimeout(() => setShowRestored(false), 6000)
        }
      } catch {}
    }
  }, [preselectedWebinarId, preselectedWebinarTitle])

  useEffect(() => {
    if (formData.fullName || formData.email || formData.phone) {
      localStorage.setItem('upisha-webinar-reg-form', JSON.stringify(formData))
    }
  }, [formData])

  useEffect(() => {
    if (formData.webinarId && !preselectedWebinarId) {
      const selected = webinars.find((w) => w.id === formData.webinarId)
      if (selected) {
        setFormData((prev) => ({ ...prev, webinarTitle: selected.title }))
      }
    }
  }, [formData.webinarId, webinars, preselectedWebinarId])

  // Check if the user has already registered for the selected webinar
  useEffect(() => {
    let cancelled = false
    const checkRegistration = async () => {
      if (!formData.webinarId) {
        setAlreadyRegistered(false)
        return
      }
      setCheckingRegistration(true)
      try {
        const res = await fetch('/api/webinars/register/mine')
        if (res.ok) {
          const data = await res.json()
          const registrations = data.registrations || []
          const exists = registrations.some((r: { webinarId: string }) => r.webinarId === formData.webinarId)
          if (!cancelled) setAlreadyRegistered(exists)
        }
      } catch {
        // Silently fail - user may not be authenticated
      } finally {
        if (!cancelled) setCheckingRegistration(false)
      }
    }
    checkRegistration()
    return () => { cancelled = true }
  }, [formData.webinarId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.webinarId) {
      toast({ title: 'Webinar selection required', description: 'Please select a webinar to register for.', variant: 'destructive' })
      return
    }
    if (!formData.declaration) {
      toast({ title: 'Declaration required', description: 'Please accept the declaration to submit your registration.', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/webinars/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
        localStorage.removeItem('upisha-webinar-reg-form')
        const data = await res.json().catch(() => ({}))
        setRegistrationStatus(data.status || null)
        toast({ title: 'Registration submitted!', description: data.message || 'Your registration is pending admin confirmation.' })
      } else {
        const errData = await res.json().catch(() => ({}))
        toast({ title: 'Registration failed', description: errData.error || 'Please try again or contact us directly.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Network error', description: 'Please check your connection and try again.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearForm = () => {
    setFormData({
      fullName: '', email: '', phone: '', qualification: '', city: '',
      webinarId: '', webinarTitle: '', transactionNumber: '', message: '', declaration: false,
    })
    localStorage.removeItem('upisha-webinar-reg-form')
    toast({ title: 'Form cleared', description: 'All entered data has been removed.' })
  }

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Registration</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            Webinar Registration
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Register for our upcoming professional development webinars. Complete the payment and submit your registration.
          </p>
        </div>

        {selectedWebinar?.type === 'free' ? (
          <Card className="border-green-200 dark:border-green-800 dark:bg-gray-800 card-gradient-top max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-upisha-navy dark:text-white flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Free Webinar — No Payment Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This is a free webinar. Complete the registration form below to secure your spot.
                {selectedWebinar.meetingLink && (
                  <span className="block mt-2">
                    After registering, you will receive the meeting link via email, or you can join directly:
                    <a href={selectedWebinar.meetingLink} target="_blank" rel="noopener noreferrer" className="text-upisha-teal hover:underline ml-1">
                      Join Meeting <ExternalLink className="h-3.5 w-3.5 inline" />
                    </a>
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ) : (
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
        )}

        <Card id="webinar-reg-form" className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top scroll-mt-32 mt-8">
          <CardHeader>
            <CardTitle className="text-upisha-navy dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-upisha-teal" />
              Registration Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showRestored && (
              <div className="mb-4 p-3 rounded-lg bg-upisha-gold/10 border border-upisha-gold/30 text-xs text-upisha-navy dark:text-gray-200 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-upisha-gold shrink-0" />
                <span className="flex-1">We restored your previously entered form data.</span>
                <button onClick={handleClearForm} className="shrink-0 underline hover:text-upisha-teal">Clear</button>
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
                <h3 className="text-xl font-bold text-upisha-navy dark:text-white mb-2">Registration Successful!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Thank you for registering for <strong>{formData.webinarTitle}</strong>.
                  {registrationStatus === 'confirmed'
                    ? ' You are now registered and confirmed for this webinar.'
                    : ' Your registration is pending admin confirmation. You will receive an email once your registration is confirmed.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      fullName: '', email: '', phone: '', qualification: '', city: '',
                      webinarId: '', webinarTitle: '', transactionNumber: '', message: '', declaration: false,
                    })
                  }}>
                    Register for Another Webinar
                  </Button>
                  <Link href="/webinars">
                    <Button className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">View All Webinars</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Select Webinar *</label>
                  <Select
                    value={formData.webinarId}
                    onValueChange={(value) => {
                      const selected = webinars.find((w) => w.id === value)
                      setFormData({ ...formData, webinarId: value, webinarTitle: selected?.title || '' })
                    }}
                    onOpenChange={() => setTouched((prev) => ({ ...prev, webinarId: true }))}
                    disabled={webinarsLoading}
                  >
                    <SelectTrigger className={`w-full ${touched.webinarId && errors.webinarId ? 'border-red-400' : touched.webinarId && valid.webinarId ? 'border-green-400' : ''}`}>
                      <SelectValue placeholder={webinarsLoading ? 'Loading webinars...' : 'Choose a webinar'} />
                    </SelectTrigger>
                    <SelectContent>
                      {webinars.length === 0 && !webinarsLoading && (
                        <SelectItem value="none" disabled>No webinars available</SelectItem>
                      )}
                      {webinars.map((webinar) => (
                        <SelectItem key={webinar.id || webinar.title} value={webinar.id || ''}>
                          <div className="flex flex-col">
                            <span>{webinar.title}</span>
                            <span className="text-xs text-gray-400">{webinar.date} • {webinar.time}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.webinarId && errors.webinarId && <p className="text-xs text-red-500 mt-1">{errors.webinarId}</p>}
                  {formData.webinarTitle && (
                    <div className="mt-2 p-2 rounded bg-upisha-teal/5 border border-upisha-teal/20 text-xs text-upisha-navy dark:text-gray-300 flex items-center gap-2">
                      <Monitor className="h-3.5 w-3.5 text-upisha-teal shrink-0" />
                      <span>Selected: <strong>{formData.webinarTitle}</strong></span>
                    </div>
                  )}
                  {checkingRegistration && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <span className="h-3 w-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                      Checking your registration status...
                    </p>
                  )}
                  {alreadyRegistered && (
                    <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>You have already registered for this webinar. Please check your registrations for the status.</span>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Full Name *</label>
                    <div className="relative">
                      <Input required placeholder="Dr. Your Name" value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                        className={fieldClass('fullName')} />
                      {touched.fullName && valid.fullName && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {touched.fullName && errors.fullName && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {touched.fullName && errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Email *</label>
                    <div className="relative">
                      <Input required type="email" placeholder="you@example.com" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                        className={fieldClass('email')} />
                      {touched.email && valid.email && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {touched.email && errors.email && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {touched.email && errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Phone *</label>
                    <div className="relative">
                      <Input required type="tel" placeholder="+91-XXXXXXXXXX" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                        className={fieldClass('phone')} />
                      {touched.phone && valid.phone && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {touched.phone && errors.phone && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {touched.phone && errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">City *</label>
                    <div className="relative">
                      <Input required placeholder="Lucknow" value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                        className={fieldClass('city')} />
                      {touched.city && valid.city && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {touched.city && errors.city && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {touched.city && errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Qualification</label>
                  <Input placeholder="M.Sc. (Audiology) - Optional" value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="input-focus-ring" />
                </div>

                {!isFree && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Transaction Number *</label>
                    <Input required placeholder="Enter payment transaction / reference number"
                      value={formData.transactionNumber}
                      onChange={(e) => setFormData({ ...formData, transactionNumber: e.target.value })}
                      onBlur={() => setTouched((prev) => ({ ...prev, transactionNumber: true }))}
                      className={fieldClass('transactionNumber')} />
                    {touched.transactionNumber && errors.transactionNumber && <p className="text-xs text-red-500 mt-1">{errors.transactionNumber}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">Enter the transaction/reference number from your payment above.</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Additional Message</label>
                  <Textarea placeholder="Any questions or special requirements..." value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3} className="input-focus-ring" />
                </div>

                <div className="p-4 rounded-lg bg-upisha-teal/5 border border-upisha-teal/20">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.declaration}
                      onChange={(e) => {
                        setFormData({ ...formData, declaration: e.target.checked })
                        setTouched((prev) => ({ ...prev, declaration: true }))
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-upisha-teal focus:ring-upisha-teal" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      I confirm that the information provided is accurate and I consent to UP ISHA using my details for webinar registration and communication purposes.
                    </span>
                  </label>
                  {touched.declaration && errors.declaration && <p className="text-xs text-red-500 mt-2 ml-7">{errors.declaration}</p>}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-upisha-teal hover:bg-upisha-teal-dark text-white glow-teal" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Submitting...</>
                    ) : (
                      <>Register for Webinar<Send className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                  {(formData.fullName || formData.email) && (
                    <Button type="button" variant="outline" onClick={handleClearForm}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
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
          <Link href="/webinars" className="text-sm text-gray-500 hover:text-upisha-teal">← View All Webinars</Link>
        </div>
      </div>
    </AnimatedSection>
  )
}