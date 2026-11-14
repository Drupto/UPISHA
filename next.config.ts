import type { NextConfig } from "next";

// NOTE: the Content-Security-Policy is now owned by middleware.ts (nonce-based
// in production - M1 residual fix, see SECURITY_AUDIT_REPORT.md). This block
// keeps the static security headers for every response. API routes also get
// headers via withSecurityHeaders() in src/lib/security.ts.
const nextConfig: NextConfig = {
  // Keep the (CommonJS, heavyweight) Firebase Admin SDK out of the bundler
  // graph - Netlify Functions require() it from node_modules at runtime.
  serverExternalPackages: ["firebase-admin"],
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
        ],
      },
    ];
  },
};

export default nextConfig;
