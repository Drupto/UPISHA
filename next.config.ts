import type { NextConfig } from "next";

// In production, use a strict CSP without unsafe-eval/unsafe-inline.
// In development, Next.js requires 'unsafe-eval'/'unsafe-inline' for HMR
// and inline bootstrap scripts — a strict CSP would break the page.
const isProduction = process.env.NODE_ENV === "production";

const strictCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://*.googleapis.com wss://firestore.googleapis.com wss://*.firebaseio.com; font-src 'self' data:; frame-src https://www.openstreetmap.org; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";

const devCsp = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://*.googleapis.com wss://firestore.googleapis.com wss://*.firebaseio.com; font-src 'self' data:; frame-src https://www.openstreetmap.org; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";

const nextConfig: NextConfig = {
  // Keep the (CommonJS, heavyweight) Firebase Admin SDK out of the bundler
  // graph — Netlify Functions require() it from node_modules at runtime.
  serverExternalPackages: ['firebase-admin'],
  poweredByHeader: false,
  turbopack: {
    root: import.meta.dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
          {
            key: "Content-Security-Policy",
            value: isProduction ? strictCsp : devCsp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
