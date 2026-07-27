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
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { galleryImages } from '@/lib/static-data'
import { AnimatedSection } from '@/components/sections'

/* ─── Gallery Section ─── */
function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; index: number } | null>(null)
  const [filter, setFilter] = useState('All')
  const [visibleCount, setVisibleCount] = useState(6)
  const { toast } = useToast()

  const categories = ['All', 'Events', 'Workshops', 'Meetings', 'Outreach', 'Training', 'Conferences']
  const filteredImages =
    filter === 'All' ? galleryImages : galleryImages.filter((img) => img.category === filter)

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImage((prev) =>
          prev ? { src: filteredImages[(prev.index - 1 + filteredImages.length) % filteredImages.length].src, index: (prev.index - 1 + filteredImages.length) % filteredImages.length } : null
        )
      } else if (e.key === 'ArrowRight') {
        setSelectedImage((prev) =>
          prev ? { src: filteredImages[(prev.index + 1) % filteredImages.length].src, index: (prev.index + 1) % filteredImages.length } : null
        )
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, filteredImages])

  const goToPrev = () => {
    setSelectedImage((prev) =>
      prev ? { src: filteredImages[(prev.index - 1 + filteredImages.length) % filteredImages.length].src, index: (prev.index - 1 + filteredImages.length) % filteredImages.length } : null
    )
  }

  const goToNext = () => {
    setSelectedImage((prev) =>
      prev ? { src: filteredImages[(prev.index + 1) % filteredImages.length].src, index: (prev.index + 1) % filteredImages.length } : null
    )
  }
  const visibleImages = filteredImages.slice(0, visibleCount)

  return (
    <AnimatedSection id="gallery" className="py-16 md:py-20 bg-white dark:bg-gray-900 section-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Badge className="bg-upisha-teal/10 text-upisha-teal">Visual Stories</Badge>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'UP ISHA Gallery',
                    text: 'Browse photos from UP ISHA events, workshops, and activities.',
                    url: window.location.href,
                  }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  toast({ title: 'Link copied!', description: 'Gallery link has been copied to clipboard.' })
                }
              }}
              className="p-1.5 rounded-md hover:bg-upisha-teal/10 transition-colors"
              aria-label="Share gallery"
            >
              <Share2 className="h-4 w-4 text-upisha-teal" />
            </button>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Gallery</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Browse through our collection of photos from events, workshops, conferences, and
            community activities.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = filter === cat
            const count = cat === 'All' ? galleryImages.length : galleryImages.filter(g => g.category === cat).length
            return (
              <Button
                key={cat}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-upisha-teal text-white filter-pill-active hover:bg-upisha-teal-dark'
                    : 'border-upisha-teal/30 text-upisha-teal hover:bg-upisha-teal-light hover:border-upisha-teal/60 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => { setFilter(cat); setVisibleCount(6) }}
              >
                {cat}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25' : 'bg-upisha-teal/10 text-upisha-teal dark:bg-gray-700 dark:text-gray-300'
                }`}>{count}</span>
              </Button>
            )
          })}
        </div>

        {/* Image count */}
        {visibleImages.length < filteredImages.length && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing <span className="font-semibold text-upisha-teal dark:text-upisha-teal">{visibleImages.length}</span> of <span className="font-semibold text-upisha-teal dark:text-upisha-teal">{filteredImages.length}</span> images
          </p>
        )}

        {/* Gallery Grid - Masonry-like layout with varying heights */}
        <div className="masonry-grid">
          {visibleImages.map((img, i) => {
            // Vary aspect ratios for masonry effect
            const aspectClass = i % 5 === 0 ? 'aspect-[3/4]' : i % 5 === 2 ? 'aspect-[4/3]' : i % 5 === 4 ? 'aspect-square' : 'aspect-[4/3]'
            return (
              <motion.div
                key={`${img.title}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.08, 0.4) }}
                viewport={{ once: true }}
                className="group cursor-pointer relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl tilt-hover bg-gray-100 dark:bg-gray-800"
                onClick={() => setSelectedImage({ src: img.src, index: i })}
              >
                <div className={`${aspectClass} overflow-hidden`}>
                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 backdrop-blur-[2px]">
                  <div>
                    <h4 className="text-white font-semibold text-sm">{img.title}</h4>
                    <Badge className="bg-upisha-gold/90 text-white text-xs mt-1 border-0">{img.category}</Badge>
                  </div>
                </div>
                {/* Top-right zoom icon */}
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Load More / View Full Gallery */}
        <div className="text-center mt-8 space-y-3">
          {visibleCount < filteredImages.length && (
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="border-upisha-teal text-upisha-teal hover:bg-upisha-teal hover:text-white"
            >
              Load More ({filteredImages.length - visibleCount} remaining)
            </Button>
          )}
          {filteredImages.length > 0 && (
            <div>
              <Button
                className="bg-upisha-teal hover:bg-upisha-teal-dark text-white shadow-sm hover:shadow-md"
              >
                <Camera className="h-4 w-4 mr-2" />
                View Full Gallery
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Lightbox */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Gallery Image</DialogTitle>
              <DialogDescription>
                {selectedImage ? `${selectedImage.index + 1} of ${filteredImages.length}` : ''}
              </DialogDescription>
            </DialogHeader>
            {selectedImage && (
              <div className="relative">
                {/* Image Counter */}
                <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {selectedImage.index + 1} of {filteredImages.length}
                </div>

                {/* Previous Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrev() }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Next Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Image */}
                <img
                  src={selectedImage.src}
                  alt={filteredImages[selectedImage.index]?.title || 'Gallery'}
                  className="w-full max-h-[75vh] object-contain"
                />

                {/* Title & Category Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                  <h4 className="text-white font-semibold text-lg">
                    {filteredImages[selectedImage.index]?.title}
                  </h4>
                  <Badge className="bg-upisha-gold/90 text-white text-xs mt-1.5 border-0">
                    {filteredImages[selectedImage.index]?.category}
                  </Badge>
                </div>

                {/* Mobile Swipe Hint */}
                <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-pulse pointer-events-none">
                  ← Swipe to navigate →
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedSection>
  )
}
