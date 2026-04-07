import { redirect } from 'next/navigation'
import { getAccessToken } from '@/utils/access-token-store'

interface OnlyUserPageProps {
  children: React.ReactNode
}

export function OnlyUserPage({ children }: OnlyUserPageProps) {
  const accessToken = getAccessToken()

  if (!accessToken) {
    return redirect('/sign-in')
  }

  return children
}
