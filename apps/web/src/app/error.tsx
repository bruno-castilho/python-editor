'use client'
import { ShowError } from '@/components/ShowError'

const statusCodeMap: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  500: 'Internal Error',
}

function getCode(status: number): string {
  return statusCodeMap[status] ?? 'Internal Error'
}

export class AppError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.code = getCode(statusCode)
  }
}

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
