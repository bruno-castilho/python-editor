import { AppError } from '@/errors/app-error'
import { OpenRouterCallback } from './components/OpenRouterCallback'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  if (!code)
    throw new AppError('No authorization code received from OpenRouter.', 400)

  return <OpenRouterCallback code={code} />
}
