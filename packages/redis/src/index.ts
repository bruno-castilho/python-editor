import { env } from '@python-editor/env/server'
import Redis from 'ioredis'

const redis = new Redis(env.REDIS_URL)

export default redis
