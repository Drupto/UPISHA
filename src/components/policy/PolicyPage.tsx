import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/components/sections'

/* ─── Shared Policy Page Layout ─── */
interface PolicyPageProps {
  badge: string
  title: string
  description: string
  updated: string
  children: React.ReactNode
}

export function PolicyPage({ badge, title, description, updated, children }: PolicyPageProps) {
  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-upisha-teal hover:text-upisha-teal-dark font-medium transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-10">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">{badge}</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            {title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">{description}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Last updated: {updated}</p>
        </div>

        <div className="space-y-6">{children}</div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Questions about this policy? Contact us at{' '}
            <a
              href="mailto:office@upisha.org"
              className="text-upisha-teal hover:underline"
            >
              office@upisha.org
            </a>
            .
          </p>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ─── Policy Section (heading + body) ─── */
interface PolicySectionProps {
  title: string
  children: React.ReactNode
}

export function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-upisha-navy dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

/* ─── Policy List Item ─── */
export function PolicyListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-upisha-teal mt-0.5">•</span>
      <span>{children}</span>
    </li>
  )
}

/* ─── Policy Note (callout) ─── */
export function PolicyNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-upisha-teal/5 dark:bg-upisha-teal/10 border border-upisha-teal/20 rounded-lg p-4">
      <p className="font-semibold text-upisha-teal text-sm mb-1">{title}</p>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{children}</p>
    </div>
  )
}