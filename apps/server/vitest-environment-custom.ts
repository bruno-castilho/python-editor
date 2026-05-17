import dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import type { Environment } from 'vitest/environments'
import db from '@python-editor/db'
import redis from '@python-editor/redis'

dotenv.config({ path: '.env.development' })
function generateDatabaseURL(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.')
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <Environment>{
  name: 'e2e-test',
  viteEnvironment: 'ssr',
  async setup() {
    const schema = randomUUID()
    const databaseURL = generateDatabaseURL(schema)

    process.env.DATABASE_URL = databaseURL

    await redis.flushdb()

    execSync('npm run -w @python-editor/db db:push ')

    return {
      async teardown() {
        await db.prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )
        await db.prisma.$disconnect()
      },
    }
  },
}
