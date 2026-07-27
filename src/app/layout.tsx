import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/hooks/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UP ISHA - Uttar Pradesh Speech & Hearing Association",
  description:
    "Uttar Pradesh Speech & Hearing Association (UP ISHA) - Dedicated to advancing the professions of audiology and speech-language pathology in Uttar Pradesh, India.",
  keywords: [
    "UP ISHA",
    "Uttar Pradesh",
    "Speech",
    "Hearing",
    "Audiology",
    "Speech Language Pathology",
    "Association",
    "India",
  ],
  authors: [{ name: "UP ISHA" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "UP ISHA - Uttar Pradesh Speech & Hearing Association",
    description:
      "Dedicated to advancing the professions of audiology and speech-language pathology in Uttar Pradesh.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Uttar Pradesh Speech & Hearing Association",
                "alternateName": "UP ISHA",
                "url": "https://upisha.org",
                "logo": "https://upisha.org/images/mainlogo.jpeg",
                "description": "Dedicated to advancing the professions of audiology and speech-language pathology in Uttar Pradesh, India.",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "110 Raghu Raj Nagar Patel Nagar",
                  "addressLocality": "Lucknow",
                  "addressRegion": "Uttar Pradesh",
                  "postalCode": "226016",
                  "addressCountry": "IN"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+91-522-456-7890",
                  "contactType": "customer service",
                  "email": "info@upisha.org"
                },
                "sameAs": [
                  "https://facebook.com/upisha",
                  "https://twitter.com/upisha",
                  "https://instagram.com/upisha",
                  "https://linkedin.com/company/upisha",
                  "https://youtube.com/@upisha"
                ]
              })
            }}
          />
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
