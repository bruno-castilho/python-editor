import { AppError } from '@/errors/app-error'
import { UnverifiedEmailContent } from './components/UnverifiedEmailContent'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  if (!email) throw new AppError('No email address was provided', 400)

  return <UnverifiedEmailContent email={email} />
}
