import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://upisha.org";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UP ISHA - Uttar Pradesh Speech & Hearing Association",
    short_name: "UP ISHA",
    description:
      "Uttar Pradesh Speech & Hearing Association — Dedicated to advancing audiology and speech-language pathology in Uttar Pradesh, India.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#0d7377",
    categories: ["health", "medical", "education", "professional"],
    lang: "en-IN",
    dir: "ltr",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    shortcuts: [
      {
        name: "Webinars",
        short_name: "Webinars",
        description: "View upcoming webinars and workshops",
        url: "/webinars",
      },
      {
        name: "Apply for Membership",
        short_name: "Join",
        description: "Apply for UP ISHA membership",
        url: "/apply",
      },
      {
        name: "About Us",
        short_name: "About",
        description: "Learn about UP ISHA",
        url: "/#about",
      },
    ],
    screenshots: [
      {
        src: "/images/hero-1.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "UP ISHA Homepage",
      },
    ],
  };
}