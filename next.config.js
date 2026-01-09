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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://challenges.cloudflare.com/turnstile/v0/api.js",
              "frame-src 'self' https://challenges.cloudflare.com",
              "connect-src 'self' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
