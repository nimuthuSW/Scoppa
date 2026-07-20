import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis

function createAdapter() {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db'

  // Remote libsql (e.g. Turso) in production, local SQLite file in development
  if (url.startsWith('libsql:') || url.startsWith('wss:') || url.startsWith('https:')) {
    return new PrismaLibSql({ url, authToken: process.env.DATABASE_AUTH_TOKEN })
  }
  return new PrismaBetterSqlite3({ url })
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
