'use client'
import { queryClient } from '@/utils/trpc'
import { QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? dynamic(() =>
        import('@tanstack/react-query-devtools').then((mod) => ({
          default: mod.ReactQueryDevtools,
        })),
      )
    : () => null

export default function TanstackProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
