import { PrismaClient } from '@prisma/client'

// Prisma client singleton for Next.js
// Prevents multiple instances during hot reload in development

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
