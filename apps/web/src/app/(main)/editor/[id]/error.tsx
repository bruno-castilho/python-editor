'use client'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <div>
      <p>{error.message}</p>
    </div>
  )
}
