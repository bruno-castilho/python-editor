import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import MaterialProvider from '@/providers/MaterialProvider'
import TanstackProvider from '@/providers/TanstackProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'python-editor',
  description: 'python-editor',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MaterialProvider>
          <TanstackProvider>{children}</TanstackProvider>
        </MaterialProvider>
      </body>
    </html>
  )
}
