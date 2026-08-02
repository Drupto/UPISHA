'use client'

// Import all section components
import { useState, useEffect, useCallback } from 'react'
import {
  TopBar,
  Navbar,
  HeroSection,
  QuickLinks,
  CountdownTimer,
  WaveDivider,
  AnnouncementSection,
  FeaturesSection,
  AboutSection,
  StatsSection,
  EventsTimelineSection,
  DocumentsSection,
  PublicationsSection,
  WebinarsSection,
  // ProfessionalsSection, // Commented out - can be re-enabled when professional directory is ready
  MemberSpotlightSection,
  JoinSection,
  TestimonialsSection,
  GallerySection,
  NewsletterSection,
  PartnersSection,
  ContactSection,
  Footer,
  BackToTop,
  FloatingContact,
  SocialProofNotification,
  CookieConsent,
  SectionNavigationIndicator,
  BreadcrumbIndicator,
  CommandPalette,
  KeyboardShortcutsHelp,
  ScrollProgress,
  NewsTicker,
} from '@/components/sections'
import { navLinks } from '@/lib/static-data'
import { StructuredData } from '@/components/seo/StructuredData'
import { getFAQSchema, getEventsSchema, getBreadcrumbSchema, getAggregateRatingSchema } from '@/lib/seo'

/* ─── Structured Data for Home Page ─── */
const homePageSchemas = [
  getFAQSchema(),
  ...getEventsSchema(),
  getBreadcrumbSchema([
    { name: 'Home', url: '/' },
  ]),
  getAggregateRatingSchema(),
]

/* ─── Main Page ─── */
export default function Home() {
  const [activeSection, setActiveSection] = useState('home')
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map((l) => l.href.slice(1))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    let gPressed = false
    let gTimer: ReturnType<typeof setTimeout> | null = null

    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable

      // Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
        return
      }

      if (isTyping) return

      // ? for help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShortcutsOpen((prev) => !prev)
        return
      }

      // Esc closes dialogs
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setShortcutsOpen(false)
        return
      }

      // Home / End
      if (e.key === 'Home' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (e.key === 'End' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        return
      }

      // g + letter combos
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        if (gPressed) return
        gPressed = true
        if (gTimer) clearTimeout(gTimer)
        gTimer = setTimeout(() => { gPressed = false }, 800)
        return
      }
      if (gPressed) {
        const map: Record<string, string> = {
          h: 'home', a: 'about', j: 'join', c: 'contact', g: 'gallery',
          d: 'documents', p: 'professionals',
        }
        const target = map[e.key.toLowerCase()]
        if (target) {
          e.preventDefault()
          document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
        }
        gPressed = false
        if (gTimer) clearTimeout(gTimer)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      if (gTimer) clearTimeout(gTimer)
    }
  }, [])

  const handleNavClick = useCallback((href: string) => {
    if (href.startsWith('/')) {
      // Page navigation (e.g., /webinars)
      window.location.href = href
    } else {
      // Anchor link (e.g., #home, #about)
      const id = href.slice(1)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData data={homePageSchemas} />
      <a href="#home" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-upisha-teal focus:text-white focus:rounded-md focus:shadow-lg">
        Skip to main content
      </a>
      <ScrollProgress />
      <TopBar />
      <Navbar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <BreadcrumbIndicator activeSection={activeSection} />
      <NewsTicker />
      <main className="flex-1">
        <HeroSection />
        <QuickLinks />
        <CountdownTimer />
        <WaveDivider color="#0d7377" />
        <AnnouncementSection />
        <FeaturesSection />
        <WaveDivider color="#c7923e" />
        <AboutSection />
        <WaveDivider color="#1a2332" />
        <StatsSection />
        <EventsTimelineSection />
        <DocumentsSection />
        <PublicationsSection />
        <WebinarsSection />
        {/* <ProfessionalsSection />  Commented out - can be re-enabled when professional directory is ready */}
        <MemberSpotlightSection />
        <JoinSection />
        <TestimonialsSection />
        <GallerySection />
        <WaveDivider color="#0d7377" />
        <NewsletterSection />
        <PartnersSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
      <FloatingContact />
      <SocialProofNotification />
      <CookieConsent />
      <SectionNavigationIndicator activeSection={activeSection} />
      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavClick}
      />
      <KeyboardShortcutsHelp open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  )
}