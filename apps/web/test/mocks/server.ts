import type { Page, Request, Route } from '@playwright/test'

type ProcedureHandler = (input: unknown) => unknown

interface RestHandlerEntry {
  method: string
  pathPattern: RegExp
  handler: (request: Request) => { status: number; body: unknown }
}

export class MockServer {
  private trpcHandlers = new Map<string, ProcedureHandler>()
  private restHandlers: RestHandlerEntry[] = []

  setTrpcHandler(procedure: string, handler: ProcedureHandler) {
    this.trpcHandlers.set(procedure, handler)
  }

  setRestHandler(
    method: string,
    pathPattern: string,
    handler: (request: Request) => { status: number; body: unknown },
  ) {
    this.restHandlers.push({
      method: method.toUpperCase(),
      pathPattern: new RegExp(pathPattern),
      handler,
    })
  }

  async install(page: Page): Promise<void> {
    await page.route(
      (url) => url.hostname === 'localhost' && url.port === '3333',
      async (route, request) => {
        const url = new URL(request.url())

        if (url.pathname.startsWith('/trpc/')) {
          await this.handleTrpc(route, request, url)
          return
        }

        await this.handleRest(route, request, url)
      },
    )
  }

  private async handleTrpc(
    route: Route,
    request: Request,
    url: URL,
  ): Promise<void> {
    const pathAfterTrpc = url.pathname.replace('/trpc/', '')
    const procedures = pathAfterTrpc.split(',')

    const inputs: Record<string, unknown> = this.extractTrpcInput(request, url)

    const responses = procedures.map((procedure, index) => {
      const handler = this.trpcHandlers.get(procedure)

      if (handler) {
        const input = inputs[String(index)]
        return this.executeTrpcProcedureHandler(handler, input)
      }

      return buildTrpcErrorResponse(
        new TrpcMockError(
          `No mock handler registered for procedure: ${procedure}`,
          'INTERNAL_SERVER_ERROR',
        ),
      )
    })

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses),
    })
  }

  private extractTrpcInput(request: Request, url: URL) {
    try {
      if (request.method() === 'GET') {
        const inputParam = url.searchParams.get('input')

        if (inputParam) return JSON.parse(decodeURIComponent(inputParam))
      } else {
        const body = request.postDataJSON() as Record<string, unknown>

        if (body) return body
      }
    } catch {}

    return {}
  }

  private executeTrpcProcedureHandler(
    handler: ProcedureHandler,
    input: unknown,
  ) {
    try {
      const data = handler(input)
      return { result: { data } }
    } catch (error) {
      if (error instanceof TrpcMockError) {
        return buildTrpcErrorResponse(error)
      }
      return buildTrpcErrorResponse(
        new TrpcMockError(
          error instanceof Error ? error.message : 'Unknown error',
          'INTERNAL_SERVER_ERROR',
        ),
      )
    }
  }

  private async handleRest(route: Route, request: Request, url: URL) {
    const restEntry = this.restHandlers.find(
      (entry) =>
        entry.method === request.method().toUpperCase() &&
        entry.pathPattern.test(url.pathname),
    )

    if (restEntry) {
      const { status, body } = restEntry.handler(request)
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })
      return
    }

    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        error: `No mock for ${request.method()} ${url.pathname}`,
      }),
    })
  }
}

const httpStatusMap: Record<string, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
}

class TrpcMockError extends Error {
  readonly trpcCode: string
  readonly httpStatus: number

  constructor(message: string, code: string) {
    super(message)
    this.name = 'TrpcMockError'
    this.trpcCode = code
    this.httpStatus = httpStatusMap[code] ?? 500
  }
}

export function trpcError(message: string, code: string): TrpcMockError {
  return new TrpcMockError(message, code)
}

function buildTrpcErrorResponse(error: TrpcMockError): unknown {
  return {
    error: {
      message: error.message,
      code: -32600,
      data: {
        code: error.trpcCode,
        httpStatus: error.httpStatus,
      },
    },
  }
}
