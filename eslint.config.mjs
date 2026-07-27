import nextVitals from 'eslint-config-next/core-web-vitals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'src/generated/**',
      'scripts/**',
      'test_*.js',
      'src/pages-backup/**',
      'src/lib/api-test.js',
      'src/app/api/test-igdb/**',
      'src/test/**',
    ],
  },
  ...nextVitals,
  {
    rules: {
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@next/next/no-img-element': 'off',
      // New React Compiler / hooks plugin rules from eslint-config-next 16 —
      // keep them off for now so the vuln upgrade stays lint-clean.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/error-boundaries': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{js,jsx}', 'vitest.setup.js', 'vitest.config.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: [
      'src/lib/api.js',
      'src/lib/api-enhanced.js',
      'src/lib/api-cache.js',
      'src/lib/db-cache.js',
      'src/lib/auth.js',
      'src/lib/auth-config.js',
      'src/lib/rate-limiter.js',
      'src/app/api/**/*.js',
      'src/app/games/page.js',
    ],
    rules: {
      'no-console': 'off',
    },
  },
]

export default config
