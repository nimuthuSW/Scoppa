// Applies pending Prisma migrations to a libsql/Turso database.
//
// `prisma migrate deploy` only understands file: URLs for SQLite, so remote
// databases are migrated with this script instead. It runs each
// prisma/migrations/*/migration.sql that hasn't been applied yet, in order,
// and records it in Prisma's _prisma_migrations table.
//
//   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:migrate:turso
require('dotenv/config')
const { createClient } = require('@libsql/client')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')

  const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN })

  const tables = (await db.execute(`SELECT name FROM sqlite_master WHERE type = 'table'`))
    .rows.map(r => r.name)
  const hasHistory = tables.includes('_prisma_migrations')

  // Tables without migration history means the schema was created some
  // other way — applying migrations on top could fail halfway or lose data.
  if (!hasHistory && tables.some(t => !t.startsWith('sqlite_') && !t.startsWith('_'))) {
    throw new Error(
      `The database already has tables (${tables.join(', ')}) but no migration history. ` +
      'Refusing to migrate it automatically.'
    )
  }

  if (!hasHistory) {
    await db.execute(`CREATE TABLE "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
    )`)
  }

  const applied = new Set(
    (await db.execute(
      `SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`
    )).rows.map(r => r.migration_name)
  )

  const migrations = fs.readdirSync(MIGRATIONS_DIR)
    .filter(name => fs.existsSync(path.join(MIGRATIONS_DIR, name, 'migration.sql')))
    .sort()
  const pending = migrations.filter(name => !applied.has(name))

  if (pending.length === 0) {
    console.log(`✅ Database is up to date (${migrations.length} migrations applied).`)
    return
  }

  for (const name of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name, 'migration.sql'), 'utf8')
    const checksum = crypto.createHash('sha256').update(sql).digest('hex')
    process.stdout.write(`Applying ${name}... `)
    await db.executeMultiple(sql)
    await db.execute({
      sql: `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
            VALUES (?, ?, current_timestamp, ?, 1)`,
      args: [crypto.randomUUID(), checksum, name],
    })
    console.log('done')
  }

  console.log(`✅ Applied ${pending.length} migration(s).`)
}

main().catch(err => {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
})
