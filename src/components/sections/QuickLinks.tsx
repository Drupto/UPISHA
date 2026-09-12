'use client'

import { motion } from 'framer-motion'
import { Ear, MessageSquare, Users, Award, ArrowUpRight } from 'lucide-react'

/* ─── Quick Links ─── */
export function QuickLinks() {
  const links = [
    { icon: Ear, label: 'Audiology', href: '#about' },
    {
      icon: MessageSquare,
      label: 'Speech Language Pathology',
      href: '#about',
    },
    {
      icon: Users,
      label: 'Locate Professional',
      href: '#contact',
    },
    { icon: Award, label: 'Clinic Accreditation', href: '#documents' },
  ]

  return (
    <div className="relative z-20 -mt-16 md:-mt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {links.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              aria-label={`${link.label} — learn more`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
              className="card-gradient-top group relative flex h-full min-h-[164px] md:min-h-[184px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 pt-6 text-center shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:border-upisha-teal/20 hover:shadow-[0_20px_45px_-15px_rgba(13,115,119,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upisha-teal focus-visible:ring-offset-2 dark:border-white/10 dark:bg-gray-800/95 md:p-6 md:pt-7"
            >
              <ArrowUpRight
                aria-hidden="true"
                className="absolute right-3 top-3 h-4 w-4 text-upisha-teal/40 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-upisha-teal group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-upisha-teal/10 to-upisha-gold/10 transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110 group-hover:from-upisha-teal group-hover:to-upisha-teal-dark group-hover:shadow-lg group-hover:shadow-upisha-teal/30 dark:from-upisha-teal/20 dark:to-upisha-gold/20 md:h-16 md:w-16">
                <link.icon className="h-7 w-7 text-upisha-teal transition-colors duration-300 group-hover:text-white md:h-8 md:w-8" />
              </div>
              <span className="text-balance text-sm font-bold leading-tight tracking-tight text-upisha-navy transition-colors duration-300 group-hover:text-upisha-teal dark:text-white dark:group-hover:text-upisha-gold md:text-[15px]">
                {link.label}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-slate-500">
                Learn more
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}

