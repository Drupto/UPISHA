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
import { membershipTypes } from '@/lib/static-data'
import { AnimatedSection } from '@/components/sections'

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    rciNumber: '',
    membershipType: '',
    city: '',
    transactionNumber: '',
    message: '',
    address: '',
    photoUrl: '',
    rciCertificateUrl: '',
    registrationDate: '',
    declaration: false,
  })
  const [joinTouched, setJoinTouched] = useState<Record<string, boolean>>({})
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
  if (joinTouched.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) joinErrors.phone = 'Please enter a valid 10-digit phone number'
  if (joinTouched.city && formData.city.trim().length === 0) joinErrors.city = 'City is required'
  if (joinTouched.transactionNumber && formData.transactionNumber.trim().length < 2) joinErrors.transactionNumber = 'Transaction number is required'
  if (joinTouched.membershipType && !formData.membershipType) joinErrors.membershipType = 'Please select a membership type'
  if (joinTouched.address && formData.address.trim().length < 5) joinErrors.address = 'Address must be at least 5 characters'
  if (joinTouched.declaration && !formData.declaration) joinErrors.declaration = 'You must accept the declaration to submit'

  const joinValid: Record<string, boolean> = {
    fullName: formData.fullName.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    phone: /^\d{10}$/.test(formData.phone.replace(/\D/g, '')),
    city: formData.city.trim().length > 0,
    transactionNumber: formData.transactionNumber.trim().length >= 2,
    membershipType: !!formData.membershipType,
    address: formData.address.trim().length >= 5,
    declaration: formData.declaration === true,
  }

  const joinFieldClass = (field: string) => {
    const touched = joinTouched[field]
    const error = joinErrors[field]
    const valid = joinValid[field]
    if (touched && error) return 'border-red-400 dark:border-red-500 focus-visible:border-red-500'
    if (touched && valid) return 'border-green-400 dark:border-green-500 focus-visible:border-green-400'
    return 'input-focus-ring'
  }

  useEffect(() => {
    const saved = localStorage.getItem('upisha-join-form')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && (parsed.fullName || parsed.email)) {
          setFormData(parsed)
          if (parsed.photoUrl) setPhotoPreview(parsed.photoUrl)
          if (parsed.rciCertificateUrl) setRciPreview(parsed.rciCertificateUrl)
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
      toast({
        title: 'File too large',
        description: 'Photo must be less than 5MB',
        variant: 'destructive',
      })
      return
    }
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      })
      return
    }
    const base64 = await handleFileToBase64(file, 'photoUrl')
    setPhotoPreview(base64)
    setFormData({ ...formData, photoUrl: base64 })
  }

  const handleRciChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'RCI certificate must be less than 10MB',
        variant: 'destructive',
      })
      return
    }
    const base64 = await handleFileToBase64(file, 'rciCertificateUrl')
    setRciPreview(base64)
    setFormData({ ...formData, rciCertificateUrl: base64 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.membershipType) {
      toast({
        title: 'Membership type required',
        description: 'Please select a membership type before submitting.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.declaration) {
      toast({
        title: 'Declaration required',
        description: 'Please accept the declaration to submit your application.',
        variant: 'destructive',
      })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
        localStorage.removeItem('upisha-join-form')
        toast({
          title: 'Application submitted!',
          description: 'We will review your application and contact you soon.',
        })
      } else {
        const errData = await res.json().catch(() => ({}))
        toast({
          title: 'Submission failed',
          description: errData.error || 'Please try again or contact us directly.',
          variant: 'destructive',
        })
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
    setFormData({
      fullName: '', email: '', phone: '', qualification: '',
      rciNumber: '', membershipType: '', city: '', transactionNumber: '', message: '',
      address: '', photoUrl: '', rciCertificateUrl: '', registrationDate: '', declaration: false,
    })
    setPhotoPreview(null)
    setRciPreview(null)
    localStorage.removeItem('upisha-join-form')
    toast({ title: 'Form cleared', description: 'All entered data has been removed.' })
  }

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
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
                  <p><span className="font-medium">Account Name:</span> UP ISHA</p>
                  <p><span className="font-medium">Bank:</span> ___________</p>
                  <p><span className="font-medium">Account No:</span> ___________</p>
                  <p><span className="font-medium">IFSC:</span> ___________</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-upisha-navy dark:text-white mb-2">UPI Payment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">UPI ID:</span> upisha@upi
                </p>
                <div className="mt-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 h-40 flex items-center justify-center text-xs text-gray-400">
                  [QR Image Placeholder]
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
                <p className="text-gray-500 dark:text-gray-400">
                  Thank you for your interest in joining UP ISHA. We will review your application
                  and get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Photo Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer hover:border-upisha-teal transition-colors"
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
                    </div>
                  </div>
                </div>

                {/* Membership Plan */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Select Membership Plan *
                  </label>
                  <Select
                    value={formData.membershipType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, membershipType: value })
                    }
                    onOpenChange={() => setJoinTouched((prev) => ({ ...prev, membershipType: true }))}
                  >
                    <SelectTrigger className={`w-full ${joinTouched.membershipType && joinErrors.membershipType ? 'border-red-400' : joinTouched.membershipType && joinValid.membershipType ? 'border-green-400' : ''}`}>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="life">Life Member - ₹5,000</SelectItem>
                      <SelectItem value="annual">Annual Member - ₹500/year</SelectItem>
                      <SelectItem value="student">Student Member - ₹200/year</SelectItem>
                    </SelectContent>
                  </Select>
                  {joinTouched.membershipType && joinErrors.membershipType && <p className="text-xs text-red-500 mt-1">{joinErrors.membershipType}</p>}
                </div>

                {/* Name & Email */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        placeholder="Dr. Your Name"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, fullName: true }))}
                        className={joinFieldClass('fullName')}
                      />
                      {joinTouched.fullName && joinValid.fullName && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {joinTouched.fullName && joinErrors.fullName && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {joinTouched.fullName && joinErrors.fullName && <p className="text-xs text-red-500 mt-1">{joinErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Email *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, email: true }))}
                        className={joinFieldClass('email')}
                      />
                      {joinTouched.email && joinValid.email && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {joinTouched.email && joinErrors.email && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {joinTouched.email && joinErrors.email && <p className="text-xs text-red-500 mt-1">{joinErrors.email}</p>}
                  </div>
                </div>

                {/* Phone & City */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Phone *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        type="tel"
                        placeholder="+91-XXXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, phone: true }))}
                        className={joinFieldClass('phone')}
                      />
                      {joinTouched.phone && joinValid.phone && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {joinTouched.phone && joinErrors.phone && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {joinTouched.phone && joinErrors.phone && <p className="text-xs text-red-500 mt-1">{joinErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      City *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        placeholder="Lucknow"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        onBlur={() => setJoinTouched((prev) => ({ ...prev, city: true }))}
                        className={joinFieldClass('city')}
                      />
                      {joinTouched.city && joinValid.city && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                      {joinTouched.city && joinErrors.city && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                    </div>
                    {joinTouched.city && joinErrors.city && <p className="text-xs text-red-500 mt-1">{joinErrors.city}</p>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Address *
                  </label>
                  <div className="relative">
                    <Textarea
                      required
                      placeholder="Full address with street, city, state, and pincode"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      onBlur={() => setJoinTouched((prev) => ({ ...prev, address: true }))}
                      rows={3}
                      className={joinFieldClass('address')}
                    />
                    {joinTouched.address && joinValid.address && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
                    {joinTouched.address && joinErrors.address && <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />}
                  </div>
                  {joinTouched.address && joinErrors.address && <p className="text-xs text-red-500 mt-1">{joinErrors.address}</p>}
                </div>

                {/* Qualification & RCI Number */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Qualification *
                    </label>
                    <Input
                      required
                      placeholder="M.Sc. (Audiology)"
                      value={formData.qualification}
                      onChange={(e) =>
                        setFormData({ ...formData, qualification: e.target.value })
                      }
                      className="input-focus-ring"
                    />
                  </div>
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
                <div>
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
                    </div>
                  </div>
                </div>

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
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Transaction Number *
                  </label>
                  <Input
                    required
                    placeholder="Enter payment transaction / reference number"
                    value={formData.transactionNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionNumber: e.target.value })
                    }
                    onBlur={() => setJoinTouched((prev) => ({ ...prev, transactionNumber: true }))}
                    className={joinFieldClass('transactionNumber')}
                  />
                  {joinTouched.transactionNumber && joinErrors.transactionNumber && <p className="text-xs text-red-500 mt-1">{joinErrors.transactionNumber}</p>}
                </div>

                {/* Declaration */}
                <div className="p-4 rounded-lg bg-upisha-teal/5 border border-upisha-teal/20">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.declaration}
                      onChange={(e) => {
                        setFormData({ ...formData, declaration: e.target.checked })
                        setJoinTouched((prev) => ({ ...prev, declaration: true }))
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-upisha-teal focus:ring-upisha-teal"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      I declare that the information provided above is true and correct, and I consent to UP ISHA using my details for membership purposes
                    </span>
                  </label>
                  {joinTouched.declaration && joinErrors.declaration && <p className="text-xs text-red-500 mt-2 ml-7">{joinErrors.declaration}</p>}
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