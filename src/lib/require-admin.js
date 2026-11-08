import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * Verify the caller is an admin. The JWT role is only a hint; the role is
 * re-read from the database so demoted or deleted users lose access
 * immediately instead of when their token expires.
 *
 * @returns {Promise<object|null>} the session if the caller is an admin, otherwise null
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') return null

  const id = parseInt(session.user.id, 10)
  if (!Number.isInteger(id)) return null

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  })
  if (user?.role !== 'ADMIN') return null

  return session
}
