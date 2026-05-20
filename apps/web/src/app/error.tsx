'use client'
import { ShowError } from '@/components/ShowError'
import { AppError } from '@/errors/app-error'

export default function Page({ error }: { error: Error | AppError }) {
  let code: string = 'Internal Error'
  let statusCode: number = 500
  let message: string = 'An internal error occurred. Please try again later.'

  if (error instanceof AppError) {
    code = error.code
    statusCode = error.statusCode
    message = error.message
  }

  return <ShowError code={code} statusCode={statusCode} message={message} />
}
