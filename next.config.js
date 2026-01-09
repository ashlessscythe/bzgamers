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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.cloudflare.com",
              "frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com",
              "child-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com",
              "worker-src 'self' blob: https://*.cloudflare.com",
              "connect-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://*.cloudflare.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
