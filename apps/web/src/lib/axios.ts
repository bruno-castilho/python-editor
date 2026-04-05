import axios from 'axios'

export const server = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

export const openRouter = axios.create({
  baseURL: 'https://openrouter.ai/api',
})
