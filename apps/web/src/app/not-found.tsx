'use client'

import { ShowError } from '@/components/ShowError'

export default function Page() {
  return (
    <ShowError
      code="Not Found"
      statusCode={404}
      message="The page you are looking for doesn't exist or has been moved."
    />
  )
}
