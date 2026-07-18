import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
