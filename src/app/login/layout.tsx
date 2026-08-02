import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Login",
  description:
    "Login to your UP ISHA account to access member features, manage your profile, and register for webinars with the Uttar Pradesh Speech & Hearing Association.",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}