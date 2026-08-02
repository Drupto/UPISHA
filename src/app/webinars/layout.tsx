import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Webinars & Workshops",
  description:
    "Join UP ISHA's professional development webinars and workshops on audiology, speech-language pathology, cochlear implants, tele-practice, and more. Register for upcoming sessions.",
  path: "/webinars",
  keywords: [
    "UP ISHA webinars",
    "audiology webinars India",
    "speech pathology workshops",
    "continuing education SLP",
    "RCI credits",
    "online audiology courses",
    "speech therapy training",
  ],
});

export default function WebinarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}