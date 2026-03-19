import { getAccessToken } from '@/utils/access-token-store'

interface OnlyUserPageProps {
  children: React.ReactNode
}

export function OnlyUserPage({ children }: OnlyUserPageProps) {
  const accessToken = getAccessToken()

  if (!accessToken) return <h1>Permissão negada</h1>
  return children
}
