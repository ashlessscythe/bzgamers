const { execSync } = require('child_process')

function looksLikePlaceholderDbUrl(dbUrl) {
  if (!dbUrl) return true
  const normalized = String(dbUrl).trim().toLowerCase()
  return (
    normalized === 'placeholder' ||
    normalized.includes('placeholder') ||
    normalized.includes('url.tld') // common .env.example placeholder
  )
}

const dbUrl = process.env.DATABASE_URL
const shouldSkipMigrate = looksLikePlaceholderDbUrl(dbUrl)

if (shouldSkipMigrate) {
  console.warn(
    '[start] Skipping `prisma migrate deploy` because DATABASE_URL looks like a placeholder.'
  )
} else {
  console.log('[start] Running `prisma migrate deploy`...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
}

console.log('[start] Starting Next.js...')
execSync('next start', { stdio: 'inherit' })

