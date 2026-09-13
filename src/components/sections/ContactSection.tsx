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
import { siteConfig } from '@/lib/seo'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/components/sections'
import { csrfHeaders } from '@/lib/csrf'

/* ─── Contact Section ─── */
export function ContactSection() {
  const { toast } = useToast()
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [contactTouched, setContactTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Validation helpers for contact form
  const contactErrors: Record<string, string> = {}
  if (contactTouched.name && contactForm.name.trim().length < 2) contactErrors.name = 'Name must be at least 2 characters'
  if (contactTouched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) contactErrors.email = 'Please enter a valid email address'
  if (contactTouched.subject && contactForm.subject.trim().length < 5) contactErrors.subject = 'Subject must be at least 5 characters'
  if (contactTouched.message && contactForm.message.trim().length < 10) contactErrors.message = 'Message must be at least 10 characters'

  const contactValid: Record<string, boolean> = {
    name: contactForm.name.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email),
    subject: contactForm.subject.trim().length >= 5,
    message: contactForm.message.trim().length >= 10,
  }

  const contactFieldClass = (field: string) => {
    const touched = contactTouched[field]
    const error = contactErrors[field]
    const valid = contactValid[field]
    if (touched && error) return 'border-red-400 dark:border-red-500 focus-visible:border-red-500'
    if (touched && valid) return 'border-green-400 dark:border-green-500 focus-visible:border-green-500'
    return 'input-focus-ring'
  }

  // Auto-save contact form
  useEffect(() => {
    const saved = localStorage.getItem('upisha-contact-form')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>
        if (parsed && (parsed.name || parsed.email)) {
          setContactForm((prev) => ({
            name: typeof parsed.name === 'string' ? parsed.name : prev.name,
            email: typeof parsed.email === 'string' ? parsed.email : prev.email,
            subject: typeof parsed.subject === 'string' ? parsed.subject : prev.subject,
            message: typeof parsed.message === 'string' ? parsed.message : prev.message,
          }))
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (contactForm.name || contactForm.email) {
      localStorage.setItem('upisha-contact-form', JSON.stringify(contactForm))
    }
  }, [contactForm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(contactForm),
      })
      if (res.ok) {
        setSubmitted(true)
        localStorage.removeItem('upisha-contact-form')
        toast({
          title: 'Message sent!',
          description: 'Thank you for reaching out. We will get back to you shortly.',
        })
      } else {
        toast({
          title: 'Failed to send',
          description: 'Please try again or email us directly.',
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

  const contactMethods = [
    {
      icon: MapPin,
      title: 'Office Address',
      details: ['110 Raghu Raj Nagar Patel Nagar Lucknow-226016'],
      action: null,
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91-9555155940'],
      action: 'tel:+919555155940',
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['office@upisha.org', 'president@upisha.org', 'secretary@upisha.org'],
      action: 'mailto:office@upisha.org',
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: ['Monday - Friday: 9:00 AM - 5:00 PM', 'Saturday: 9:00 AM - 1:00 PM'],
      action: null,
    },
  ]

  return (
    <AnimatedSection id="contact" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 border-t-2 border-t-upisha-teal/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Get in Touch</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Contact Us</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Have questions or need assistance? We&apos;re here to help. Reach out to us through any
            of the channels below.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info - 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            {/* Contact method cards */}
            {contactMethods.map((method, i) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="border-gray-100 dark:bg-gray-800 dark:border-gray-700 card-lift overflow-hidden">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-upisha-teal/15 to-upisha-gold/15 rounded-xl flex items-center justify-center shrink-0 icon-tilt">
                      <method.icon className="h-5 w-5 text-upisha-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-upisha-navy dark:text-white text-sm mb-1">{method.title}</h4>
                      {method.details.map((d, j) => (
                        <p key={j} className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{d}</p>
                      ))}
                    </div>
                    {method.action && (
                      <a
                        href={method.action}
                        className="shrink-0 w-8 h-8 rounded-lg bg-upisha-teal/10 flex items-center justify-center hover:bg-upisha-teal hover:text-white transition-all group"
                        aria-label={`Contact via ${method.title}`}
                      >
                        <ArrowRight className="h-3.5 w-3.5 text-upisha-teal group-hover:text-white" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Social Links */}
            <Card className="border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <h4 className="font-semibold text-upisha-navy dark:text-white text-sm mb-3">Follow Us</h4>
                <div className="flex gap-2.5">
                  {[
                    { icon: Facebook, label: 'Facebook', href: siteConfig.links.facebook, color: 'hover:bg-blue-600' },
                    { icon: Twitter, label: 'X', href: siteConfig.links.x, color: 'hover:bg-sky-500' },
                    { icon: Instagram, label: 'Instagram', href: siteConfig.links.instagram, color: 'hover:bg-pink-600' },
                    { icon: Youtube, label: 'YouTube', href: siteConfig.links.youtube, color: 'hover:bg-red-600' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 ${social.color} hover:text-white transition-all`}
                      aria-label={social.label}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side: Form + Map - 3 cols */}
          <div className="lg:col-span-3 space-y-5">
            {/* Contact Form */}
            <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top">
              <CardHeader className="pb-3">
                <CardTitle className="text-upisha-navy dark:text-white flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5 text-upisha-teal" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                    <h3 className="text-xl font-bold text-upisha-navy dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Thank you for reaching out. We will get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Name *
                        </label>
                        <div className="relative">
                          <Input
                            required
                            placeholder="Your name"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            onBlur={() => setContactTouched((prev) => ({ ...prev, name: true }))}
                            className={contactFieldClass('name')}
                          />
                          {contactTouched.name && contactValid.name && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                          {contactTouched.name && contactErrors.name && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                        </div>
                        {contactTouched.name && contactErrors.name && <p className="text-xs text-red-500 mt-1">{contactErrors.name}</p>}
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
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            onBlur={() => setContactTouched((prev) => ({ ...prev, email: true }))}
                            className={contactFieldClass('email')}
                          />
                          {contactTouched.email && contactValid.email && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                          {contactTouched.email && contactErrors.email && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                        </div>
                        {contactTouched.email && contactErrors.email && <p className="text-xs text-red-500 mt-1">{contactErrors.email}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Subject *
                      </label>
                      <div className="relative">
                        <Input
                          required
                          placeholder="How can we help?"
                          value={contactForm.subject}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, subject: e.target.value })
                          }
                          onBlur={() => setContactTouched((prev) => ({ ...prev, subject: true }))}
                          className={contactFieldClass('subject')}
                        />
                        {contactTouched.subject && contactValid.subject && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                        {contactTouched.subject && contactErrors.subject && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                      </div>
                      {contactTouched.subject && contactErrors.subject && <p className="text-xs text-red-500 mt-1">{contactErrors.subject}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Message *
                      </label>
                      <div className="relative">
                        <Textarea
                          required
                          placeholder="Your message..."
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, message: e.target.value })
                          }
                          onBlur={() => setContactTouched((prev) => ({ ...prev, message: true }))}
                          rows={5}
                          className={`${contactFieldClass('message')} resize-none`}
                        />
                        {contactTouched.message && contactValid.message && <CheckCircle2 className="absolute right-3 top-4 h-4 w-4 text-green-500" />}
                        {contactTouched.message && contactErrors.message && <AlertCircle className="absolute right-3 top-4 h-4 w-4 text-red-500" />}
                      </div>
                      {contactTouched.message && contactErrors.message && <p className="text-xs text-red-500 mt-1">{contactErrors.message}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white glow-teal"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* Quick Contact Options */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider font-medium">
                        Or reach us directly
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href="tel:+919555155940"
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-upisha-teal/40 hover:bg-upisha-teal/5 dark:hover:bg-upisha-teal/10 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full bg-upisha-teal/10 flex items-center justify-center group-hover:bg-upisha-teal transition-colors">
                            <PhoneCall className="h-3.5 w-3.5 text-upisha-teal group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-upisha-teal transition-colors">Schedule a Call</span>
                        </a>
                        <a
                          href="mailto:office@upisha.org"
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-upisha-gold/40 hover:bg-upisha-gold/5 dark:hover:bg-upisha-gold/10 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full bg-upisha-gold/10 flex items-center justify-center group-hover:bg-upisha-gold transition-colors">
                            <Mail className="h-3.5 w-3.5 text-upisha-gold group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-upisha-gold transition-colors">Email Us</span>
                        </a>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
                      Your data is auto-saved locally as you type.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Embedded Map */}
            <Card className="border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-[220px] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=80.95%2C26.84%2C81.0%2C26.88&layer=mapnik&marker=26.86%2C80.97"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="UP ISHA Office Location - 110 Raghu Raj Nagar Patel Nagar Lucknow"
                    className="w-full h-full"
                  />
                  {/* Map overlay card */}
                  <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-md p-3 max-w-[220px] border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-upisha-teal" />
                      <span className="text-xs font-semibold text-upisha-navy dark:text-white">UP ISHA Office</span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                      110 Raghu Raj Nagar Patel Nagar Lucknow-226016
                    </p>
                    <a
                      href="https://www.google.com/maps/search/110+Raghu+Raj+Nagar+Patel+Nagar+Lucknow+226016"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-upisha-teal font-semibold mt-1.5 hover:underline"
                    >
                      Get Directions <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

