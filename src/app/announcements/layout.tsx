import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Announcements",
  description:
    "Stay informed with the latest news and announcements from UP ISHA — Uttar Pradesh Speech & Hearing Association. Updates on conferences, workshops, webinars, and community programs.",
  path: "/announcements",
  keywords: [
    "UP ISHA announcements",
    "speech hearing association news",
    "audiology announcements India",
    "SLP updates Uttar Pradesh",
    "UP ISHA news",
    "hearing care updates",
  ],
});

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}