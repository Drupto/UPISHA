import { StructuredData } from '@/components/seo/StructuredData'
import { HomeShell } from '@/app/home-shell'
import { getFAQSchema, getEventsSchema, getBreadcrumbSchema, getAggregateRatingSchema } from '@/lib/seo'
import {
  getAnnouncements,
  getEvents,
  getWebinars,
  getTestimonials,
  getGalleryImages,
  getPublications,
} from '@/lib/data'
import type { PublicationItem } from '@/components/sections/PublicationsSection'

export const revalidate = 60

/* ─── Structured Data for Home Page ─── */
const homePageSchemas = [
  getFAQSchema(),
  ...getEventsSchema(),
  getBreadcrumbSchema([
    { name: 'Home', url: '/' },
  ]),
  getAggregateRatingSchema(),
]

/**
 * Firestore returns Timestamp instances (custom classes) inside doc data.
 * RSC serialization only supports plain objects/arrays/primitives, so we
 * normalize to plain JSON before passing the data to the interactive shell.
 */
function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/* ─── Main Page (server component: content is part of the initial HTML) ─── */
export default async function Home() {
  const [announcements, events, webinars, testimonials, galleryImages, publications] = await Promise.all([
    getAnnouncements(),
    getEvents(),
    getWebinars(),
    getTestimonials(),
    getGalleryImages(),
    getPublications(),
  ]).then((results) =>
    results.map((result) => toPlain(result))
  ) as [
    Awaited<ReturnType<typeof getAnnouncements>>,
    Awaited<ReturnType<typeof getEvents>>,
    Awaited<ReturnType<typeof getWebinars>>,
    Awaited<ReturnType<typeof getTestimonials>>,
    Awaited<ReturnType<typeof getGalleryImages>>,
    Awaited<ReturnType<typeof getPublications>>,
  ]

  const newsTickerItems = announcements.slice(0, 5).map((a) => a.title)

  return (
    <>
      <StructuredData data={homePageSchemas} />
      <HomeShell
        announcements={announcements}
        events={events}
        webinars={webinars}
        testimonials={testimonials}
        galleryImages={galleryImages}
        publications={publications as unknown as PublicationItem[]}
        newsTickerItems={newsTickerItems}
      />
    </>
  )
}
