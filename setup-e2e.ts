import { config } from 'dotenv'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { Redis } from '@python-editor/redis'
import db, { PrismaClient, PrismaPg } from '@python-editor/db'
import { env } from '@python-editor/env/server'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const redis = new Redis(env.REDIS_URL)

function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable')
  }

  const url = new URL(env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  const adapter = new PrismaPg({ connectionString: databaseURL })
  db.prisma = new PrismaClient({ adapter })

  await redis.flushdb()

  execSync('npm run db:push')
})

afterAll(async () => {
  await db.prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`,
  )
  await db.prisma.$disconnect()
})
