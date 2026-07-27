import path from 'path'
import { defineConfig } from 'vitest/config'
import { transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'

/** Vitest 4 / Vite 8 use Oxc, which does not parse JSX in `.js` by default. */
function jsxInJs() {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\.js$/.test(id) || id.includes('node_modules')) return null
      return transformWithOxc(code, id, { lang: 'jsx' })
    },
  }
}

export default defineConfig({
  plugins: [jsxInJs(), react({ include: /\.(jsx|js)$/ })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/lib/**/*.{js,jsx}',
        'src/app/api/**/*.{js,jsx}',
        'src/components/admin/AnalyticsPanel.js',
        'src/components/AuthModal.js',
        'src/components/CompactGameCard.js',
        'src/components/Layout.js',
      ],
      exclude: [
        'src/**/*.{test,spec}.{js,jsx}',
        'src/generated/**',
        'src/pages-backup/**',
        // External/integration-heavy modules — covered via integration scripts, not unit tests
        'src/lib/api.js',
        'src/lib/api-enhanced.js',
        'src/lib/api-cache.js',
        'src/lib/api-test.js',
        'src/lib/mock-data.js',
        'src/lib/db-cache.js',
        'src/lib/compliance-checker.js',
        'src/lib/config.js',
        'src/lib/turnstile-loader.js',
        'src/app/api/test-igdb/**',
        'src/app/api/compliance-check/**',
        'src/app/api/genres/**',
        'src/app/api/platforms/**',
        'src/app/api/games-filtered/**',
        'src/app/api/games/[id]/**',
      ],
      thresholds: {
        lines: 40,
        functions: 50,
        statements: 40,
        branches: 40,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/server': path.resolve(__dirname, 'node_modules/next/server.js'),
    },
  },
})
