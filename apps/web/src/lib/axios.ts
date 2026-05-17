import { env } from '@python-editor/env/web'
import axios from 'axios'

export const server = axios.create({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
})

export const openRouter = axios.create({
  baseURL: 'https://openrouter.ai/api',
})
