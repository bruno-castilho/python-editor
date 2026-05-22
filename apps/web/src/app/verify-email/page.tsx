import { AppError } from '@/errors/app-error'
import { VerifyEmailHandler } from './components/VerifyEmailHandler'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token)
    throw new AppError('Verification token not found in the URL.', 400)

  return <VerifyEmailHandler token={token} />
}
