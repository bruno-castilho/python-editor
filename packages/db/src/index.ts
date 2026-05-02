import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@python-editor/env/server'

import { PrismaClient } from '../prisma/generated/client'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export * from '../prisma/generated/client'
export * from '@prisma/adapter-pg'
export default {
  prisma,
}
