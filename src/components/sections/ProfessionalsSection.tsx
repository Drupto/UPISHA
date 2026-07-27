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
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { professionalCategories, sampleProfessionals, upCities, specialities } from '@/lib/static-data'
import { AnimatedSection, SectionHeading } from '@/components/sections'

/* ─── Professionals Section ─── */
function ProfessionalsSection() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('All Cities')
  const [specialityFilter, setSpecialityFilter] = useState('All Specialities')
  const [visibleCount, setVisibleCount] = useState(6)
  const [selectedProfessional, setSelectedProfessional] = useState<typeof sampleProfessionals[0] | null>(null)

  const filtered = useMemo(() => {
    return sampleProfessionals.filter((p) => {
      const matchesQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.speciality.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCity = cityFilter === 'All Cities' || p.city === cityFilter
      const matchesSpeciality =
        specialityFilter === 'All Specialities' || p.speciality === specialityFilter
      return matchesQuery && matchesCity && matchesSpeciality
    })
  }, [searchQuery, cityFilter, specialityFilter])

  const resetFilters = () => {
    setSearchQuery('')
    setCityFilter('All Cities')
    setSpecialityFilter('All Specialities')
    setVisibleCount(6)
  }

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value)
    setVisibleCount(6)
  }

  const updateCityFilter = (value: string) => {
    setCityFilter(value)
    setVisibleCount(6)
  }

  const updateSpecialityFilter = (value: string) => {
    setSpecialityFilter(value)
    setVisibleCount(6)
  }

  const visible = filtered.slice(0, visibleCount)

  return (
    <AnimatedSection id="professionals" className="py-16 md:py-20 bg-upisha-navy dark:bg-gray-950 relative overflow-hidden">
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 relative">
        <SectionHeading
          badge="Find Experts"
          badgeIcon={Users}
          title="Professionals Directory"
          subtitle="Locate qualified audiologists, speech-language pathologists, and accredited clinics across Uttar Pradesh. Search by name, city, or speciality."
          light
        />

        {/* Category Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {professionalCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-upisha-navy-light border-upisha-navy-light hover:border-upisha-teal transition-all duration-300 group hover:-translate-y-1 card-gradient-top card-gradient-border">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-upisha-teal/20 to-upisha-gold/20 rounded-2xl flex items-center justify-center group-hover:bg-upisha-teal group-hover:rotate-6 transition-all">
                    <cat.icon className="h-8 w-8 text-upisha-teal group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{cat.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{cat.description}</p>
                  <div className="text-3xl font-bold text-upisha-teal">{cat.count}</div>
                  <p className="text-xs text-gray-500">Professionals Listed</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <Card className="bg-upisha-navy-light dark:bg-gray-900 border-upisha-navy-light dark:border-gray-800 mb-8">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Search className="h-5 w-5 text-upisha-teal" />
              Locate a Professional
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Search by name or qualification</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="e.g. Dr. Rajesh..."
                    value={searchQuery}
                    onChange={(e) => updateSearchQuery(e.target.value)}
                    className="bg-upisha-navy border-upisha-navy-light dark:bg-gray-800 dark:border-gray-700 text-white placeholder:text-gray-500 pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">City</label>
                <Select value={cityFilter} onValueChange={updateCityFilter}>
                  <SelectTrigger className="bg-upisha-navy border-upisha-navy-light dark:bg-gray-800 dark:border-gray-700 text-white">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {upCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Speciality</label>
                <Select value={specialityFilter} onValueChange={updateSpecialityFilter}>
                  <SelectTrigger className="bg-upisha-navy border-upisha-navy-light dark:bg-gray-800 dark:border-gray-700 text-white">
                    <SelectValue placeholder="Select speciality" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-upisha-navy-light">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-semibold">{visible.length}</span> of{' '}
                <span className="text-white font-semibold">{filtered.length}</span> professionals
              </p>
              {(searchQuery || cityFilter !== 'All Cities' || specialityFilter !== 'All Specialities') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-upisha-navy-light text-gray-300 hover:bg-upisha-navy-light hover:text-white"
                  onClick={resetFilters}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {visible.length === 0 ? (
          <div className="text-center py-16 bg-upisha-navy-light rounded-2xl">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-1">No professionals found</h4>
            <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((pro, i) => (
              <motion.div
                key={`${pro.name}-${pro.rci}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="h-full bg-upisha-navy-light border-upisha-navy-light hover:border-upisha-teal transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  onClick={() => setSelectedProfessional(pro)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-upisha-teal to-upisha-teal-dark flex items-center justify-center text-white font-bold">
                        {pro.name.split(' ').slice(-2, -1)[0]?.[0] || pro.name[2]}
                        {pro.name.split(' ').slice(-1)[0]?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate group-hover:text-upisha-teal transition-colors">
                          {pro.name}
                        </h4>
                        <p className="text-xs text-upisha-teal mb-2">{pro.speciality}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPinned className="h-3 w-3 text-upisha-gold" />
                            {pro.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-upisha-gold" />
                            {pro.experience}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-upisha-gold" />
                            {pro.setting}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-upisha-navy-light flex items-center justify-between">
                      <Badge className="bg-upisha-teal/20 text-upisha-teal text-[10px]">
                        RCI: {pro.rci}
                      </Badge>
                      <span className="text-xs text-gray-400 group-hover:text-upisha-teal flex items-center gap-1 transition-colors">
                        View
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more */}
        {visibleCount < filtered.length && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="border-upisha-teal text-upisha-teal hover:bg-upisha-teal hover:text-white"
            >
              Load More ({filtered.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </div>

      {/* Professional Detail Dialog */}
      <Dialog open={!!selectedProfessional} onOpenChange={(open) => !open && setSelectedProfessional(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Professional details</DialogTitle>
          </DialogHeader>
          {selectedProfessional && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-upisha-teal to-upisha-teal-dark flex items-center justify-center text-white font-bold text-xl">
                  {selectedProfessional.name.split(' ').slice(-2, -1)[0]?.[0] || selectedProfessional.name[2]}
                  {selectedProfessional.name.split(' ').slice(-1)[0]?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-upisha-navy dark:text-white">{selectedProfessional.name}</h3>
                  <p className="text-sm text-upisha-teal">{selectedProfessional.speciality}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-upisha-gold" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{selectedProfessional.city}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-upisha-teal/10 text-upisha-teal gap-1">
                  <Shield className="h-3 w-3" />
                  Verified RCI Registration
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Qualification</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedProfessional.qualification}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MapPinned className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">City</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedProfessional.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Briefcase className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Experience & Setting</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {selectedProfessional.experience} • {selectedProfessional.setting}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">RCI Registration</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedProfessional.rci}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact via UP ISHA
                </Button>
                <Button
                  variant="outline"
                  className="border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedProfessional.name,
                        text: `${selectedProfessional.name} - ${selectedProfessional.speciality}, ${selectedProfessional.city} | UP ISHA`,
                        url: window.location.href,
                      }).catch(() => {})
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      toast({ title: 'Link copied!', description: 'Profile link has been copied to clipboard.' })
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full mt-3 border-upisha-gold/30 text-upisha-gold hover:bg-upisha-gold/10"
                onClick={() => toast({ title: 'Feature coming soon!', description: 'Appointment booking will be available shortly.' })}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Request Appointment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AnimatedSection>
  )
}
