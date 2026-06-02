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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/server': path.resolve(__dirname, 'node_modules/next/server.js'),
    },
  },
})
