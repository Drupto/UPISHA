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
import { AnimatedSection } from '@/components/sections'
import { Badge } from '@/components/ui/badge'
import { executiveCouncil } from '@/lib/static-data'

/* ─── About Section ─── */
function AboutSection() {
  return (
    <AnimatedSection id="about" className="py-16 md:py-20 bg-white dark:bg-gray-900 section-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/about-illustration.png"
                alt="About UP ISHA"
                loading="lazy"
                className="w-full h-[400px] object-cover"
              />
            </div>
            {/* Stats overlay - improved dark mode */}
            <div className="absolute -bottom-6 -right-6 md:right-6 bg-upisha-teal text-white rounded-xl p-5 shadow-lg ring-4 ring-white/20 dark:ring-gray-900/20">
              <div className="text-3xl font-bold">2+</div>
              <div className="text-sm opacity-90">Years of Service</div>
            </div>
            <div className="absolute -top-4 -left-4 md:left-6 bg-upisha-gold text-white rounded-xl p-4 shadow-lg ring-4 ring-white/20 dark:ring-gray-900/20">
              <div className="text-2xl font-bold">550+</div>
              <div className="text-xs opacity-90">Members</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">About Us</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white mb-6">
              Uttar Pradesh Speech & Hearing Association
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-upisha-teal to-upisha-gold rounded-full mb-6" />
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
              The Uttar Pradesh Speech & Hearing Association (UP ISHA) is the premier professional
              body representing audiologists and speech-language pathologists in Uttar Pradesh,
              India. Established in 2024, UP ISHA has been at the forefront of advancing the
              professions of audiology and speech-language pathology in the state.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
              Our mission is to promote the highest standards of professional practice, foster
              research and education, advocate for persons with communication disorders, and serve
              as a unified voice for speech and hearing professionals across Uttar Pradesh.
            </p>

            {/* Mission & Vision - enhanced cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-upisha-teal-light to-white dark:from-upisha-teal/20 dark:to-gray-800 rounded-xl p-5 border border-upisha-teal/10 dark:border-upisha-teal/20 card-lift">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-upisha-teal/15 rounded-lg flex items-center justify-center">
                    <Heart className="h-4 w-4 text-upisha-teal" />
                  </div>
                  <h4 className="font-bold text-upisha-navy dark:text-white">Our Mission</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  To advance the science and practice of audiology and speech-language pathology,
                  and to advocate for individuals with communication disorders.
                </p>
              </div>
              <div className="bg-gradient-to-br from-upisha-gold-light to-white dark:from-upisha-gold/15 dark:to-gray-800 rounded-xl p-5 border border-upisha-gold/10 dark:border-upisha-gold/20 card-lift">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-upisha-gold/15 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-upisha-gold" />
                  </div>
                  <h4 className="font-bold text-upisha-navy dark:text-white">Our Vision</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Every individual in Uttar Pradesh has access to quality speech and hearing
                  healthcare services provided by qualified professionals.
                </p>
              </div>
            </div>

            <Button className="bg-upisha-teal hover:bg-upisha-teal-dark text-white glow-teal">
              Learn More <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* President's Message - enhanced with avatar */}
        <div className="mt-16 md:mt-20">
          <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Left: Avatar area with gradient bg */}
                <div className="md:w-64 shrink-0 bg-gradient-to-br from-upisha-teal/10 to-upisha-gold/10 dark:from-upisha-teal/20 dark:to-upisha-gold/15 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-3">
                    <img
                      src="/images/President.jpeg"
                      alt="Mr. Bhupendra Kumar Mishra"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="font-bold text-upisha-navy dark:text-white text-sm">Mr. Bhupendra Kumar Mishra</h4>
                  <p className="text-xs text-upisha-teal font-medium flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-upisha-gold text-upisha-gold" />
                    President, UP ISHA
                  </p>
                </div>
                {/* Right: Message content */}
                <div className="flex-1 p-6 md:p-8">
                  <Badge className="bg-upisha-gold text-white mb-4">President&apos;s Message</Badge>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic text-base mb-4">
                    &ldquo;It is my privilege to serve as the President of UP ISHA. Our association
                    continues to grow and strengthen, uniting professionals across Uttar Pradesh in
                    our shared commitment to improving communication health. Together, we can ensure
                    that every person with a speech or hearing challenge receives the care they
                    deserve. I invite you to join us in this noble mission.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-upisha-teal/20 to-transparent" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Est. 2024</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Council */}
        <div className="mt-16 md:mt-20">
          <div className="text-center mb-10">
            <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Leadership</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Executive Council</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3">
              Meet the dedicated professionals leading UP ISHA
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {executiveCouncil.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 group overflow-hidden dark:bg-gray-800 dark:border-gray-700 card-gradient-top card-gradient-border card-lift">
                  <CardContent className="pt-6 pb-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-upisha-teal/10 group-hover:border-upisha-teal transition-colors shadow-sm">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full gradient-avatar text-2xl">
                          {member.name.split(' ').filter(w => w.length > 1).slice(-2).map(w => w[0]).join('')}
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-upisha-navy dark:text-white">{member.name}</h4>
                    <p className="text-upisha-teal font-medium text-sm">{member.role}</p>
                    <Badge variant="outline" className="mt-2 text-xs dark:border-gray-600 dark:text-gray-300">
                      {member.speciality}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
