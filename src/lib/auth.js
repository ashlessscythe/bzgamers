import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { normalizeEmail } from './validation'


// bcrypt hash of a random string; only used to equalise timing
const DUMMY_HASH = '$2b$10$sqJ4b.jhEnbLGNjkrWGrguxiMjG8n5lwBEq5vc6Yhxp6Ozqto1Yi6'

/**
 * Verify user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} - User object or null if invalid
 */
export async function verifyCredentials(email, password) {
  try {
    const normalizedEmail = normalizeEmail(email)
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    // Always run a bcrypt compare (against a dummy hash for unknown emails) so
    // response time does not reveal whether the account exists.
    const isValid = await bcrypt.compare(password, user ? user.password : DUMMY_HASH)

    if (!user || !isValid) {
      return null
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('[AUTH] Error verifying credentials:', error)
    return null
  }
}

/**
 * Create a new user
 * @param {string} email - User email
 * @param {string} password - User password (will be hashed)
 * @param {string} name - User name (optional)
 * @param {string} role - User role (default: GUEST)
 * @returns {Promise<Object>} - Created user object
 */
export async function createUser(email, password, name = null, role = 'GUEST') {
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.create({
    data: {
      email: normalizeEmail(email),
      password: hashedPassword,
      name,
      role
    }
  })

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} - User object or null
 */
export async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(email) }
    })

    if (!user) {
      return null
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} - True if user is admin
 */
export function isAdmin(user) {
  return user?.role === 'ADMIN'
}

