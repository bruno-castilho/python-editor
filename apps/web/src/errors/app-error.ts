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
