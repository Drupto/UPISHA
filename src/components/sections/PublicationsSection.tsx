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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { publications } from '@/lib/static-data'
import { AnimatedSection } from '@/components/sections'

/* ─── Publications Section ─── */
export function PublicationsSection() {
  return (
    <AnimatedSection id="publications" className="py-16 md:py-20 bg-white dark:bg-gray-900 border-t-2 border-t-upisha-teal/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-gold/10 text-upisha-gold mb-3">Research & Knowledge</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Publications</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Explore our journal, monographs, and research contributions that advance the field of
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
            <TabsTrigger
              value="monograph"
              className="data-[state=active]:bg-upisha-teal data-[state=active]:text-white"
            >
              Monograph
            </TabsTrigger>
            <TabsTrigger
              value="research"
              className="data-[state=active]:bg-upisha-teal data-[state=active]:text-white"
            >
              Research
            </TabsTrigger>
          </TabsList>
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
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-upisha-navy dark:text-white text-sm">Current Issue Highlights:</h4>
                    <ul className="space-y-1.5">
                      <li className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-upisha-teal shrink-0 mt-0.5" />
                        Effectiveness of Tele-Audiology in Rural UP
                      </li>
                      <li className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-upisha-teal shrink-0 mt-0.5" />
                        Language Development in Hindi-Speaking Children
                      </li>
                      <li className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-upisha-teal shrink-0 mt-0.5" />
                        Cochlear Implant Outcomes: A 5-Year Review
                      </li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                      <Eye className="h-4 w-4 mr-1" />
                      Current Issue
                    </Button>
                    <Button size="sm" variant="outline" className="border-upisha-teal text-upisha-teal">
                      <FileText className="h-4 w-4 mr-1" />
                      Previous Issues
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
                      Submit to: editor@upisha.org
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
          <TabsContent value="monograph" className="mt-8">
            <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top card-gradient-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-upisha-teal" />
                  <div>
                    <h3 className="font-bold text-upisha-navy dark:text-white text-lg">Clinical Monograph Series</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Specialized Topic Publications</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our monograph series provides in-depth coverage of specialized topics in audiology
                  and speech-language pathology, authored by leading experts in the field.
                </p>
                <div className="space-y-3">
                  {[
                    'Pediatric Audiology Assessment in Hindi-Speaking Populations',
                    'Neurogenic Communication Disorders: Clinical Management',
                    'Aural Rehabilitation for Adult Cochlear Implant Users',
                  ].map((title, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-upisha-teal-light/50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</span>
                      <Button variant="ghost" size="sm" className="text-upisha-teal">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="research" className="mt-8">
            <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top card-gradient-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="h-8 w-8 text-upisha-teal" />
                  <div>
                    <h3 className="font-bold text-upisha-navy dark:text-white text-lg">
                      Research in Uttar Pradesh
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ongoing & Completed Research</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Browse the directory of research projects being conducted in the field of speech
                  and hearing across Uttar Pradesh. Submit your research for inclusion.
                </p>
                <div className="space-y-3">
                  {[
                    'Prevalence of Hearing Loss in School Children of Lucknow District',
                    'Effectiveness of Early Intervention for Speech Sound Disorders',
                    'Tele-Practice Feasibility Study for Rural Communities in UP',
                  ].map((title, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-upisha-teal-light/50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</span>
                      <Button variant="ghost" size="sm" className="text-upisha-teal">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedSection>
  )
}

