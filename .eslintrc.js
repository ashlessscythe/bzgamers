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
  },
}
