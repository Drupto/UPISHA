/**
 * SEO Utility Library — UP ISHA
 * Centralized JSON-LD structured data generators for Schema.org compliance.
 * @see https://schema.org
 */

import type { Metadata } from "next";
import {
  faqItems,
  executiveCouncil,
  eventsTimeline,
  upcomingWebinars,
  testimonials,
  stats,
} from "@/lib/static-data";
import type {
  FAQ,
  ExecutiveMember,
  TimelineEvent,
  Webinar,
  Testimonial,
} from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://upisha.org";
const SITE_NAME = "UP ISHA - Uttar Pradesh Speech & Hearing Association";
const SITE_DESCRIPTION =
  "Uttar Pradesh Speech & Hearing Association (UP ISHA) — Dedicated to advancing the professions of audiology and speech-language pathology in Uttar Pradesh, India.";
const LOGO_URL = `${SITE_URL}/images/mainlogo.jpeg`;

/* ─── Organization Schema ─── */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: "Uttar Pradesh Speech & Hearing Association",
    alternateName: "UP ISHA",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    image: LOGO_URL,
    description: SITE_DESCRIPTION,
    foundingDate: "2025",
    areaServed: {
      "@type": "State",
      name: "Uttar Pradesh",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "110 Raghu Raj Nagar Patel Nagar",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      postalCode: "226016",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-522-456-7890",
      contactType: "customer service",
      email: "office@upisha.org",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://facebook.com/upisha",
      "https://twitter.com/upisha",
      "https://instagram.com/upisha",
      "https://linkedin.com/company/upisha",
      "https://youtube.com/@upisha",
    ],
  };
}

/* ─── WebSite Schema (with SearchAction) ─── */
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "MedicalBusiness",
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?s={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-IN",
  };
}

/* ─── BreadcrumbList Schema ─── */
export function getBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/* ─── FAQPage Schema ─── */
export function getFAQSchema(faqs: FAQ[] = faqItems) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/* ─── Event Schema (from TimelineEvent) ─── */
export function getEventSchema(event: TimelineEvent) {
  // Parse date range — e.g., "18-20 Oct 2026" → startDate/endDate
  const dateMatch = event.date.match(/(\d+)(?:-(\d+))?\s+(\w+)\s+(\d{4})/);
  let startDate: string | undefined;
  let endDate: string | undefined;

  if (dateMatch) {
    const [, startDay, endDay, month, year] = dateMatch;
    const startDayNum = parseInt(startDay, 10);
    const endDayNum = endDay ? parseInt(endDay, 10) : startDayNum;
    const monthNum = new Date(`${month} 1 ${year}`).getMonth() + 1;
    startDate = `${year}-${String(monthNum).padStart(2, "0")}-${String(startDayNum).padStart(2, "0")}`;
    endDate = `${year}-${String(monthNum).padStart(2, "0")}-${String(endDayNum).padStart(2, "0")}`;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: startDate,
    endDate: endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location,
    },
    organizer: {
      "@type": "Organization",
      name: "Uttar Pradesh Speech & Hearing Association",
      url: SITE_URL,
    },
    performer: event.speakers.map((speaker) => ({
      "@type": "Person",
      name: speaker,
    })),
  };
}

/* ─── Events Array Schema ─── */
export function getEventsSchema(events: TimelineEvent[] = eventsTimeline) {
  return events.map((event) => getEventSchema(event));
}

/* ─── Person Schema (from ExecutiveMember) ─── */
export function getPersonSchema(member: ExecutiveMember) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    image: `${SITE_URL}${member.image}`,
    worksFor: {
      "@type": "Organization",
      name: "Uttar Pradesh Speech & Hearing Association",
    },
    knowsAbout: member.speciality || undefined,
  };
}

/* ─── Executive Council Array Schema ─── */
export function getExecutiveCouncilSchema(
  members: ExecutiveMember[] = executiveCouncil
) {
  return members.map((member) => getPersonSchema(member));
}

/* ─── VideoObject Schema (from Webinar) ─── */
export function getWebinarSchema(webinar: Webinar) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: webinar.title,
    description: webinar.description || `Webinar by ${webinar.speaker}`,
    uploadDate: webinar.date,
    duration: webinar.duration,
    presenter: {
      "@type": "Person",
      name: webinar.speaker,
    },
    thumbnailUrl: `${SITE_URL}/images/hero-1.png`,
    contentUrl: webinar.registrationLink || undefined,
  };
}

/* ─── Webinars Array Schema ─── */
export function getWebinarsSchema(webinars: Webinar[] = upcomingWebinars) {
  return webinars.map((webinar) => getWebinarSchema(webinar));
}

/* ─── Review Schema (from Testimonial) ─── */
export function getReviewSchema(testimonial: Testimonial) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(testimonial.rating),
      bestRating: "5",
    },
    author: {
      "@type": "Person",
      name: testimonial.name,
    },
    reviewBody: testimonial.content,
    itemReviewed: {
      "@type": "Organization",
      name: "Uttar Pradesh Speech & Hearing Association",
    },
  };
}

/* ─── AggregateRating Schema ─── */
export function getAggregateRatingSchema(
  reviews: Testimonial[] = testimonials
) {
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: avgRating.toFixed(1),
    reviewCount: String(reviews.length),
    bestRating: "5",
    worstRating: "1",
    itemReviewed: {
      "@type": "Organization",
      name: "Uttar Pradesh Speech & Hearing Association",
    },
  };
}

/* ─── Service Schema ─── */
export function getServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Audiology and Speech-Language Pathology Services",
    provider: {
      "@type": "MedicalBusiness",
      "@id": `${SITE_URL}/#organization`,
    },
    areaServed: {
      "@type": "State",
      name: "Uttar Pradesh",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "UP ISHA Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Professional Development Webinars",
            description:
              "Continuing education webinars for audiology and speech-language pathology professionals.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Annual Conference",
            description:
              "UP ISHACON — flagship annual state conference featuring keynote lectures and workshops.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Professional Directory",
            description:
              "Directory of RCI-registered audiologists and speech-language pathologists in Uttar Pradesh.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Publications",
            description:
              "UP Journal of Speech & Hearing — peer-reviewed research journal.",
          },
        },
      ],
    },
  };
}

/* ─── Combined Schema Graph (for layout.tsx) ─── */
export function getSchemaGraph() {
  return [
    getOrganizationSchema(),
    getWebsiteSchema(),
    getServiceSchema(),
  ];
}

/* ─── Page-Level Metadata Generators ─── */

export function getPageMetadata({
  title,
  description,
  path,
  image,
  keywords,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || "/images/mainlogo.jpeg";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "UP ISHA",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

/* ─── Site Configuration ─── */

export const siteConfig = {
  name: SITE_NAME,
  shortName: "UP ISHA",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  ogImage: "/images/mainlogo.jpeg",
  links: {
    facebook: "https://facebook.com/upisha",
    twitter: "https://twitter.com/upisha",
    instagram: "https://instagram.com/upisha",
    linkedin: "https://linkedin.com/company/upisha",
    youtube: "https://youtube.com/@upisha",
  },
  contact: {
    email: "office@upisha.org",
    phone: "+91-522-456-7890",
    address: {
      street: "110 Raghu Raj Nagar Patel Nagar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      postalCode: "226016",
      country: "IN",
    },
  },
};