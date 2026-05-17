import { execSync } from 'node:child_process'

export default async function globalSetup() {
  return async function teardown() {
    try {
      execSync('fuser -k 3002/tcp', { stdio: 'ignore' })
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch {
      // port was free — no action needed
    }
  }
}
