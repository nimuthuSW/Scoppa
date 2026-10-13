import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Same default as lib/prisma.js. Falling back (rather than prisma's env(),
    // which throws when unset) lets `npm install` run `prisma generate` on a
    // fresh clone before .env exists.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
})