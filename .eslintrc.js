module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
  ],
  rules: {
    // Add custom rules here
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    es2020: true, // Add ES2020 support for BigInt, globalThis, etc.
  },
  ignorePatterns: [
    'src/generated/prisma/**/*', // Ignore generated Prisma files
  ],
  globals: {
    // Add globals that are used in generated files
    globalThis: 'readonly',
    BigInt: 'readonly',
    SharedArrayBuffer: 'readonly',
    WeakRef: 'readonly',
    WorkerGlobalScope: 'readonly',
    DedicatedWorkerGlobalScope: 'readonly',
    SharedWorkerGlobalScope: 'readonly',
    ServiceWorkerGlobalScope: 'readonly',
  },
}
