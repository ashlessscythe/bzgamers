module.exports = {
  extends: ['next/core-web-vitals', 'eslint:recommended'],
  rules: {
    'no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@next/next/no-img-element': 'off',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    es2020: true,
  },
  ignorePatterns: ['src/generated/prisma/**/*'],
  globals: {
    globalThis: 'readonly',
    BigInt: 'readonly',
    SharedArrayBuffer: 'readonly',
    WeakRef: 'readonly',
    WorkerGlobalScope: 'readonly',
    DedicatedWorkerGlobalScope: 'readonly',
    SharedWorkerGlobalScope: 'readonly',
    ServiceWorkerGlobalScope: 'readonly',
  },
  overrides: [
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
  ],
}
