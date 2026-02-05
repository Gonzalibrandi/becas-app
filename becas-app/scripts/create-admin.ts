// Script to create an admin user
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-admin.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.argv[2] || 'gonzalo'
  const password = process.argv[3] || 'librandi'
  const email = process.argv[4] || null

  console.log(`Creating admin user: ${username}`)

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12)

  // Check if user exists
  const existing = await prisma.adminUser.findUnique({
    where: { username },
  })

  if (existing) {
    // Update password
    await prisma.adminUser.update({
      where: { username },
      data: { passwordHash, email },
    })
    console.log(`✅ Admin "${username}" password updated`)
  } else {
    // Create new
    await prisma.adminUser.create({
      data: {
        username,
        passwordHash,
        email,
      },
    })
    console.log(`✅ Admin "${username}" created`)
  }

  // List all admins
  const admins = await prisma.adminUser.findMany({
    select: { id: true, username: true, email: true, isActive: true, createdAt: true },
  })
  console.log('\nAll admin users:')
  console.table(admins)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
