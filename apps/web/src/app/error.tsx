'use client'
import { ShowError } from '@/components/ShowError'
import { AppError } from '@/errors/app-error'

export default function Page({ error }: { error: Error | AppError }) {
  let code: string = 'Internal Error'
  let statusCode: number = 500
  let message: string = 'An internal error occurred. Please try again later.'

  try {
    const object = JSON.parse(error.message)
    const errorMessageObject = AppError.verifyMessage(object)

    code = errorMessageObject.code
    statusCode = errorMessageObject.statusCode
    message = errorMessageObject.message
  } catch {}

  return <ShowError code={code} statusCode={statusCode} message={message} />
}
