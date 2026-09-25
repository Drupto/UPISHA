import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Apply for Membership",
  description:
    "Apply for UP ISHA membership. Join the Uttar Pradesh Indian Speech & Hearing Association to access professional development, networking, conferences, journals, and more benefits for audiologists and speech-language pathologists.",
  path: "/apply",
  keywords: [
    "UP ISHA membership",
    "apply membership",
    "audiology association India",
    "speech pathology membership",
    "RCI registered membership",
    "professional association UP",
  ],
});

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}