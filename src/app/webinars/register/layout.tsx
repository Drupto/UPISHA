import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Webinar Registration",
  description:
    "Register for upcoming UP ISHA webinars on audiology and speech-language pathology. Secure your spot for professional development sessions with expert speakers.",
  path: "/webinars/register",
  keywords: [
    "webinar registration",
    "UP ISHA webinar",
    "audiology webinar registration",
    "speech pathology online registration",
    "continuing education India",
  ],
});

export default function WebinarRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}