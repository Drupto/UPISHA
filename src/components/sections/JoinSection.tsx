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
  PhoneCall, Building, Mailbox, Zap,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { features, membershipBenefits, membershipTypes, faqItems } from '@/lib/static-data'
import { AnimatedSection } from '@/components/sections'

/* ─── Join UP ISHA Section ─── */
export function JoinSection() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    rciNumber: '',
    membershipType: '',
    city: '',
    message: '',
  })
  const [joinTouched, setJoinTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showRestored, setShowRestored] = useState(false)

  // Validation helpers for join form
  const joinErrors: Record<string, string> = {}
  if (joinTouched.fullName && formData.fullName.trim().length < 2) joinErrors.fullName = 'Name must be at least 2 characters'
  if (joinTouched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) joinErrors.email = 'Please enter a valid email address'
  if (joinTouched.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) joinErrors.phone = 'Please enter a valid 10-digit phone number'
  if (joinTouched.city && formData.city.trim().length === 0) joinErrors.city = 'City is required'
  if (joinTouched.membershipType && !formData.membershipType) joinErrors.membershipType = 'Please select a membership type'

  const joinValid: Record<string, boolean> = {
    fullName: formData.fullName.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    phone: /^\d{10}$/.test(formData.phone.replace(/\D/g, '')),
    city: formData.city.trim().length > 0,
    membershipType: !!formData.membershipType,
  }

  const joinFieldClass = (field: string) => {
    const touched = joinTouched[field]
    const error = joinErrors[field]
    const valid = joinValid[field]
    if (touched && error) return 'border-red-400 dark:border-red-500 focus-visible:border-red-500'
    if (touched && valid) return 'border-green-400 dark:border-green-500 focus-visible:border-green-500'
    return 'input-focus-ring'
  }

  // Auto-save form data to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('upisha-join-form')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && (parsed.fullName || parsed.email)) {
          setFormData(parsed)
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
        toast({
          title: 'Submission failed',
          description: 'Please try again or contact us directly.',
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
      rciNumber: '', membershipType: '', city: '', message: '',
    })
    localStorage.removeItem('upisha-join-form')
    toast({ title: 'Form cleared', description: 'All entered data has been removed.' })
  }

  // Compute form completion percentage
  const filledFields = Object.values(formData).filter(v => v && v.trim() !== '').length
  const totalFields = 8
  const completionPct = Math.round((filledFields / totalFields) * 100)

  return (
    <AnimatedSection id="join" className="py-16 md:py-20 bg-upisha-teal-light dark:bg-upisha-teal/10 border-t-2 border-t-upisha-gold/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Membership</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Join UP ISHA</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Become a member of the leading professional body for speech and hearing professionals in
            Uttar Pradesh.
          </p>
        </div>

        {/* Membership Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {membershipTypes.map((plan, i) => (
            <motion.div
              key={plan.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={`h-full relative card-gradient-top card-gradient-border card-lift ${
                  plan.popular
                    ? 'border-upisha-teal shadow-lg md:scale-[1.03] dark:bg-gray-800'
                    : 'border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-upisha-gold text-white shadow-md">★ Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-upisha-navy dark:text-white text-lg">{plan.type}</h3>
                  <div className="my-4">
                    <span className="text-3xl font-bold text-gradient-teal-gold">{plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
                  <ul className="space-y-2 text-left mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle2 className="h-4 w-4 text-upisha-teal shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-upisha-teal hover:bg-upisha-teal-dark text-white glow-teal'
                        : 'bg-white border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, membershipType: plan.type }))
                      document.getElementById('join-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                  >
                    {plan.popular ? 'Apply Now' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Membership Benefits */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6">Membership Benefits</h3>
            <div className="space-y-3">
              {membershipBenefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <Card id="join-form" className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top scroll-mt-32">
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-upisha-navy dark:text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-upisha-teal" />
                  Membership Application
                </CardTitle>
                {completionPct > 0 && completionPct < 100 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {completionPct}% complete
                  </span>
                )}
              </div>
              {completionPct > 0 && completionPct < 100 && (
                <div className="mt-2 h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-upisha-teal to-upisha-gold transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              )}
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
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Membership Type *
                    </label>
                    <Select
                      value={formData.membershipType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, membershipType: value })
                      }
                      onOpenChange={() => setJoinTouched((prev) => ({ ...prev, membershipType: true }))}
                    >
                      <SelectTrigger className={`w-full ${joinTouched.membershipType && joinErrors.membershipType ? 'border-red-400' : joinTouched.membershipType && joinValid.membershipType ? 'border-green-400' : ''}`}>
                        <SelectValue placeholder="Select membership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="life">Life Member - ₹5,000</SelectItem>
                        <SelectItem value="annual">Annual Member - ₹500/year</SelectItem>
                        <SelectItem value="student">Student Member - ₹200/year</SelectItem>
                      </SelectContent>
                    </Select>
                    {joinTouched.membershipType && joinErrors.membershipType && <p className="text-xs text-red-500 mt-1">{joinErrors.membershipType}</p>}
                    {formData.membershipType && !joinErrors.membershipType && (
                      <p className="text-xs text-upisha-teal mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Selected: {membershipTypes.find(t => t.type.toLowerCase().includes(formData.membershipType))?.type || formData.membershipType}
                      </p>
                    )}
                  </div>
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
        </div>

        {/* FAQ */}
        <div>
          <h3 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 px-4"
                >
                  <AccordionTrigger className="text-left font-semibold text-upisha-navy dark:text-white hover:text-upisha-teal">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-300">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

