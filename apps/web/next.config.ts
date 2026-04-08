import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Security headers applied at the Next.js layer (local dev + any non-Vercel host).
// These mirror the headers in vercel.json so that local dev is equally hardened.
// Tune CSP for your specific external origins before going to production.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS only in production — HTTPS is not guaranteed in local dev.
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  {
    key: "Content-Security-Policy",
    // Next.js 16 App Router requires 'unsafe-inline' for styles and hydration scripts.
    // For a stricter CSP with nonces, see: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // Clerk, Convex, and generic HTTPS image sources (avatars, etc.)
      "img-src 'self' blob: data: https:",
      "font-src 'self'",
      // Clerk auth domains + Convex realtime (wss) + self
      "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.clerk.com https://*.clerk.accounts.dev",
      // Clerk OAuth popup frames
      "frame-src https://accounts.google.com https://*.clerk.accounts.dev",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@xyphyx/shared"],
  output: "standalone",
  experimental: {
    typedRoutes: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
