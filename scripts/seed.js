/**
 * Seed script to populate database with default data
 * Run with: node scripts/seed.js [options]
 * 
 * Options:
 *   --users-only        Only seed users and their favorites
 *   --feedback-only    Only seed feedback entries
 *   --count <n>        Number of feedback entries to create (default: 20)
 */

// Load environment variables
require('dotenv').config()

const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Parse command line arguments
const args = process.argv.slice(2)
const flags = {
  usersOnly: args.includes('--users-only'),
  feedbackOnly: args.includes('--feedback-only'),
  count: (() => {
    const countIndex = args.indexOf('--count')
    if (countIndex !== -1 && args[countIndex + 1]) {
      const count = parseInt(args[countIndex + 1], 10)
      return isNaN(count) ? 20 : count
    }
    return 20
  })()
}

// Dynamic import for faker (ES module)
let faker

// Popular game IDs from IGDB (you can replace these with actual game IDs from your database)
const POPULAR_GAMES = [
  { igdbId: 1942, name: 'The Witcher 3: Wild Hunt' },
  { igdbId: 1944, name: 'Grand Theft Auto V' },
  { igdbId: 1959, name: 'Minecraft' },
  { igdbId: 1960, name: 'Counter-Strike: Global Offensive' },
  { igdbId: 1961, name: 'The Elder Scrolls V: Skyrim' },
  { igdbId: 1962, name: 'Portal 2' },
  { igdbId: 1963, name: 'Half-Life 2' },
  { igdbId: 1964, name: 'BioShock Infinite' },
  { igdbId: 1965, name: 'Red Dead Redemption 2' },
  { igdbId: 1966, name: 'The Last of Us' },
  { igdbId: 1967, name: 'God of War' },
  { igdbId: 1968, name: 'Horizon Zero Dawn' },
]

// Sample user data template - names will be generated with faker in seed function
const USER_TEMPLATES = [
  {
    email: 'bob@bob.bob',
    password: 'bob',
    name: 'Bob Admin',
    role: 'ADMIN'
  },
  {
    email: 'alice@example.com',
    password: 'password123',
    name: null, // Will be generated with faker
    role: 'GUEST'
  },
  {
    email: 'charlie@example.com',
    password: 'password123',
    name: null, // Will be generated with faker
    role: 'GUEST'
  },
  {
    email: 'diana@example.com',
    password: 'password123',
    name: null, // Will be generated with faker
    role: 'GUEST'
  },
  {
    email: 'eve@example.com',
    password: 'password123',
    name: null, // Will be generated with faker
    role: 'GUEST'
  }
]

// Generate deterministic favorite games for a user based on their email
function getUserFavorites(userEmail, userIndex) {
  // Use email hash to deterministically select games
  let hash = 0
  for (let i = 0; i < userEmail.length; i++) {
    hash = ((hash << 5) - hash) + userEmail.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Each user gets 2-4 games based on their email hash
  const numFavorites = 2 + (Math.abs(hash) % 3) // 2-4 games
  const shuffledGames = [...POPULAR_GAMES].sort((a, b) => {
    // Deterministic shuffle based on hash
    const aHash = Math.abs(hash + a.igdbId) % 1000
    const bHash = Math.abs(hash + b.igdbId) % 1000
    return aHash - bHash
  })
  
  return shuffledGames.slice(0, numFavorites)
}

// Generate deterministic waitlist emails (same emails every run)
function generateWaitlistEmails(count = 15) {
  const emails = []
  const names = [
    'john', 'jane', 'mike', 'sarah', 'david', 'emily', 'chris', 'lisa',
    'james', 'maria', 'robert', 'jennifer', 'william', 'patricia', 'richard',
    'linda', 'joseph', 'barbara', 'thomas', 'elizabeth', 'daniel', 'susan',
    'matthew', 'jessica', 'anthony', 'mark', 'karen', 'donald', 'nancy', 'steven'
  ]
  
  // Use seed-based generation for consistency
  for (let i = 0; i < count; i++) {
    const nameIndex = i % names.length
    const number = Math.floor(i / names.length) * 1000 + (i % 1000)
    emails.push(`${names[nameIndex]}${number}@example.com`)
  }
  
  return emails
}

// Generate interesting feedback messages using faker
function generateFeedbackMessages(faker, count) {
  const feedbackTemplates = [
    () => `I've been using this platform for a while now and ${faker.helpers.arrayElement(['love', 'really enjoy', 'am impressed by'])} the game recommendations! ${faker.lorem.sentence()}`,
    () => `The search functionality is ${faker.helpers.arrayElement(['amazing', 'incredible', 'fantastic'])}. ${faker.lorem.sentence()} However, I think ${faker.lorem.sentence()}`,
    () => `Would love to see ${faker.helpers.arrayElement(['more', 'additional', 'extra'])} ${faker.helpers.arrayElement(['features', 'games', 'filtering options'])}. ${faker.lorem.paragraph()}`,
    () => `Great platform overall! ${faker.lorem.sentence()} One suggestion: ${faker.lorem.sentence()}`,
    () => `The UI is ${faker.helpers.arrayElement(['clean', 'intuitive', 'user-friendly'])} but ${faker.lorem.sentence()}`,
    () => `I found ${faker.helpers.arrayElement(['several', 'a few', 'many'])} games I'd never heard of before. ${faker.lorem.paragraph()}`,
    () => `The waitlist feature is ${faker.helpers.arrayElement(['helpful', 'useful', 'great'])}. ${faker.lorem.sentence()}`,
    () => `Could you add support for ${faker.helpers.arrayElement(['more platforms', 'better filtering', 'user reviews', 'game ratings'])}? ${faker.lorem.sentence()}`,
    () => `This is exactly what I was looking for! ${faker.lorem.paragraph()}`,
    () => `The game database seems ${faker.helpers.arrayElement(['comprehensive', 'extensive', 'well-maintained'])}. ${faker.lorem.sentence()} Keep up the good work!`,
  ]

  const messages = []
  for (let i = 0; i < count; i++) {
    const template = feedbackTemplates[i % feedbackTemplates.length]
    messages.push(template())
  }
  return messages
}

async function seedUsers(faker) {
  // Generate user data with faker names
  const USERS = USER_TEMPLATES.map(template => ({
    ...template,
    name: template.name || faker.person.fullName()
  }))
  
  console.log('👤 Creating/updating users...')
  const createdUsers = []
  
  for (const userData of USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // Use upsert for true idempotency
    const user = await prisma.user.upsert({
      where: { email: userData.email.toLowerCase() },
      update: {
        password: hashedPassword,
        role: userData.role,
        ...(userData.role === 'ADMIN' ? { name: userData.name } : {})
      },
      create: {
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        name: userData.name,
        role: userData.role
      }
    })
    
    createdUsers.push(user)
    console.log(`  ✅ User: ${userData.email} (${userData.role}) - ${user.name || 'No name'}`)
  }

  // Add favorite games for each user
  console.log('\n🎮 Adding favorite games...')
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i]
    const userFavorites = getUserFavorites(user.email, i)

    let addedCount = 0
    for (const game of userFavorites) {
      try {
        await prisma.favorite.upsert({
          where: {
            userId_gameId: {
              userId: user.id,
              gameId: game.igdbId
            }
          },
          update: {
            gameName: game.name,
            gameData: {
              name: game.name,
              igdbId: game.igdbId
            }
          },
          create: {
            userId: user.id,
            gameId: game.igdbId,
            gameName: game.name,
            gameData: {
              name: game.name,
              igdbId: game.igdbId
            }
          }
        })
        addedCount++
      } catch (error) {
        if (error.code !== 'P2002') {
          throw error
        }
      }
    }
    console.log(`  ✅ ${addedCount} favorites for ${user.email}`)
  }

  return createdUsers
}

async function seedWaitlist(faker) {
  console.log('\n📧 Creating waitlist emails...')
  const waitlistEmails = generateWaitlistEmails(15)
  let processedCount = 0

  for (let i = 0; i < waitlistEmails.length; i++) {
    const email = waitlistEmails[i]
    const notified = (i % 10) < 3
    
    await prisma.waitlistEmail.upsert({
      where: { email: email.toLowerCase() },
      update: { notified: notified },
      create: {
        email: email.toLowerCase(),
        notified: notified
      }
    })
    processedCount++
  }
  console.log(`  ✅ Processed ${processedCount} waitlist emails`)
  return processedCount
}

async function seedFeedback(faker, count) {
  console.log(`\n💬 Creating ${count} feedback entries...`)
  
  // Get all users (some feedback will be linked to users, some won't)
  const users = await prisma.user.findMany()
  const feedbackMessages = generateFeedbackMessages(faker, count)
  
  let createdCount = 0
  let linkedCount = 0

  for (let i = 0; i < count; i++) {
    // 60% chance feedback is from a logged-in user
    const shouldLinkToUser = Math.random() < 0.6 && users.length > 0
    const user = shouldLinkToUser ? faker.helpers.arrayElement(users) : null
    
    const feedback = await prisma.feedback.create({
      data: {
        name: user ? user.name || faker.person.fullName() : faker.person.fullName(),
        email: user ? user.email : faker.internet.email().toLowerCase(),
        message: feedbackMessages[i],
        userId: user ? user.id : null
      }
    })
    
    createdCount++
    if (user) linkedCount++
  }
  
  console.log(`  ✅ Created ${createdCount} feedback entries (${linkedCount} linked to users)`)
  return createdCount
}

async function seed() {
  try {
    // Import faker dynamically (ES module)
    const fakerModule = await import('@faker-js/faker')
    faker = fakerModule.faker
    
    // Set faker seed for consistent results across runs
    faker.seed(12345)
    
    console.log('🌱 Starting database seed...\n')
    
    if (flags.feedbackOnly) {
      // Only seed feedback
      const feedbackCount = await seedFeedback(faker, flags.count)
      console.log('\n✨ Feedback seed completed successfully!')
      console.log(`\n📋 Summary: ${feedbackCount} feedback entries created`)
      return
    }
    
    if (flags.usersOnly) {
      // Only seed users and favorites
      const createdUsers = await seedUsers(faker)
      console.log('\n✨ User seed completed successfully!')
      console.log(`\n📋 Summary: ${createdUsers.length} users created/updated`)
      console.log(`  - Admin user: bob@bob.bob (password: bob)`)
      return
    }
    
    // Seed everything (default behavior)
    const createdUsers = await seedUsers(faker)
    const waitlistCount = await seedWaitlist(faker)
    const feedbackCount = await seedFeedback(faker, flags.count)

    console.log('\n✨ Seed completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`  - Users: ${createdUsers.length}`)
    console.log(`  - Admin user: bob@bob.bob (password: bob)`)
    console.log(`  - Waitlist emails: ${waitlistCount}`)
    console.log(`  - Feedback entries: ${feedbackCount}`)
    console.log('\n🔐 You can now sign in at /auth/signin')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seed
seed()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
