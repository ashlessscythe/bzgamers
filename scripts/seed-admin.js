/**
 * Seed script to create the first admin user
 * Run with: node scripts/seed-admin.js
 */

// Load environment variables
require('dotenv').config()

const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function seedAdmin() {
  try {
    console.log('🌱 Admin User Seeder\n')

    const email = await question('Enter admin email: ')
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email')
      process.exit(1)
    }

    const password = await question('Enter admin password: ')
    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters')
      process.exit(1)
    }

    const name = await question('Enter admin name (optional): ') || null

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      console.log('⚠️  User already exists. Updating to admin role...')
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name: name || existing.name
        }
      })
      console.log('✅ User updated to admin')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          role: 'ADMIN'
        }
      })
      console.log('✅ Admin user created successfully!')
    }

    console.log('\n📧 You can now sign in at /auth/signin')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

seedAdmin()

