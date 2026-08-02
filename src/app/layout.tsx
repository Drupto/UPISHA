import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { getSchemaGraph, siteConfig } from "@/lib/seo";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | UP ISHA`,
  },
  description: siteConfig.description,
  keywords: [
    "UP ISHA",
    "Uttar Pradesh Speech & Hearing Association",
    "Uttar Pradesh",
    "Speech",
    "Hearing",
    "Audiology",
    "Speech Language Pathology",
    "Audiologist",
    "Speech Therapist",
    "SLP",
    "ASHA",
    "RCI registered",
    "Hearing care India",
    "Speech therapy Lucknow",
    "Audiology UP",
    "Association",
    "India",
    "UP ISHACON",
    "Speech and hearing conference",
    "Continuing education audiology",
  ],
  authors: [{ name: "UP ISHA", url: siteConfig.url }],
  creator: "UP ISHA",
  publisher: "UP ISHA",
  category: "Healthcare",
  applicationName: "UP ISHA",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${siteConfig.url}/feed.xml`,
    },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "UP ISHA",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "UP ISHA - Uttar Pradesh Speech & Hearing Association",
      },
    ],
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@upisha",
    site: "@upisha",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
    },
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appLinks: {
    web: {
      url: siteConfig.url,
      should_fallback: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d7377" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resource Hints — Performance Optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://securetoken.googleapis.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Structured Data — Schema.org JSON-LD */}
          {getSchemaGraph().map((schema, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema),
              }}
            />
          ))}
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
          <GoogleAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}