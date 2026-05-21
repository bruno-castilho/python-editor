import z from 'zod'

const statusCodeMap: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  500: 'Internal Error',
}

function getCode(status: number): string {
  return statusCodeMap[status] ?? 'Internal Error'
}

export class AppError extends Error {
  constructor(message: string, statusCode: number) {
    super(JSON.stringify({ message, statusCode, code: getCode(statusCode) }))
  }

  public static verifyMessage(object: undefined) {
    return z
      .object({
        message: z.string(),
        statusCode: z.number(),
        code: z.string(),
      })
      .parse(object)
  }
}
