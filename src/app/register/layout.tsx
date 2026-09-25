import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageMetadata({
  title: "Register",
  description:
    "Create an account on UP ISHA to access member features, register for webinars, and manage your profile with the Uttar Pradesh Indian Speech & Hearing Association.",
  path: "/register",
  noIndex: true,
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}