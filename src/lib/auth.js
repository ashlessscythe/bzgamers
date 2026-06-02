import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcryptjs'
import { normalizeEmail } from './validation'

const prisma = new PrismaClient()

/**
 * Verify user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} - User object or null if invalid
 */
export async function verifyCredentials(email, password) {
  try {
    const normalizedEmail = normalizeEmail(email)
    console.log('[AUTH] Attempting to verify credentials for:', normalizedEmail)
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      console.log('[AUTH] User not found:', normalizedEmail)
      return null
    }

    console.log('[AUTH] User found, verifying password...')
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      console.log('[AUTH] Password mismatch for:', normalizedEmail)
      return null
    }

    console.log('[AUTH] Credentials verified successfully for:', normalizedEmail)
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

