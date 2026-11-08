import { PrismaClient } from '@/generated/prisma'

/**
 * Shared PrismaClient. Cached on globalThis so route modules, dev hot reloads
 * and src/lib/db-cache.js all reuse one connection pool.
 */
const KEY = '__bzgamersPrisma'

function createClient() {
  if (process.env.NODE_ENV === 'test') return new PrismaClient()
  if (!globalThis[KEY]) globalThis[KEY] = new PrismaClient()
  return globalThis[KEY]
}

export const prisma = createClient()
export default prisma
