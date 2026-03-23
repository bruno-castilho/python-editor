import dotenv from 'dotenv'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

dotenv.config({
  path: '../../apps/server/.env',
})

dotenv.config({
  path: '../../apps/server/.env.development',
  override: false,
})

export default defineConfig({
  schema: path.join('prisma', 'schema'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
