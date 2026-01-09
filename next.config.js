/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App Router is enabled by default in Next.js 13+
  experimental: {
    // Enable any experimental features if needed
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: Allow self, Turnstile, and Cloudflare Insights
              // Note: 'unsafe-inline' and 'unsafe-eval' are required for Next.js
              // but pose XSS risks. Consider using nonces in production.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.cloudflare.com https://static.cloudflareinsights.com",
              // Frames: Only allow Turnstile iframes
              "frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com",
              "child-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com",
              // Workers: Allow Cloudflare workers (needed for Turnstile)
              "worker-src 'self' blob: https://*.cloudflare.com",
              // Network connections: Limit to necessary Cloudflare endpoints
              "connect-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com https://static.cloudflareinsights.com",
              // Styles: 'unsafe-inline' needed for Next.js but allows CSS injection
              // Consider using nonces for better security
              "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://*.cloudflare.com",
              // Images: Restrict to specific domains if possible (currently allows all HTTPS)
              "img-src 'self' data: https: blob:",
              // Fonts: Allow data URIs and HTTPS fonts
              "font-src 'self' data: https:",
              // Base URI: Prevent base tag injection
              "base-uri 'self'",
              // Form actions: Prevent form hijacking
              "form-action 'self'",
              // Object/embed: Block plugins
              "object-src 'none'",
              // Upgrade insecure requests
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Additional security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'browsing-topics=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
