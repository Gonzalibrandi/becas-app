// Script to create an admin user
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-admin.ts
//
// Uses environment variables from .env:
//   ADMIN_USERNAME - Admin username (required)
//   ADMIN_PASSWORD - Admin password (required)
//   ADMIN_EMAIL    - Admin email (optional)
//
// Or pass as arguments:
//   npx ts-node ... scripts/create-admin.ts <username> <password> [email]

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load .env file
config();

const prisma = new PrismaClient();

async function main() {
  // Priority: CLI args > ENV vars
  const username = process.argv[2] || process.env.ADMIN_USERNAME;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  const email = process.argv[4] || process.env.ADMIN_EMAIL || null;

  if (!username || !password) {
    console.error('❌ Error: Username and password are required.');
    console.error('\nUsage:');
    console.error('  Option 1: Set ADMIN_USERNAME and ADMIN_PASSWORD in .env');
    console.error('  Option 2: Pass as arguments: npx ts-node ... scripts/create-admin.ts <username> <password> [email]');
    process.exit(1);
  }

  console.log(`Creating admin user: ${username}`);

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // Check if user exists
  const existing = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (existing) {
    // Update password
    await prisma.adminUser.update({
      where: { username },
      data: { passwordHash, email },
    });
    console.log(`✅ Admin "${username}" password updated`);
  } else {
    // Create new
    await prisma.adminUser.create({
      data: {
        username,
        passwordHash,
        email,
      },
    });
    console.log(`✅ Admin "${username}" created`);
  }

  // List all admins
  const admins = await prisma.adminUser.findMany({
    select: { id: true, username: true, email: true, isActive: true, createdAt: true },
  });
  console.log('\nAll admin users:');
  console.table(admins);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
