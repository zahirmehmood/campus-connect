import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import type { ZodType } from 'zod'

export interface Principal {
  userId: string
  role: 'student' | 'organizer' | 'admin'
  email: string
}

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'HttpError'
  }
}

export function principalFrom(event: APIGatewayProxyEvent): Principal {
  const claims = event.requestContext.authorizer?.claims as Record<string, string> | undefined
  if (!claims?.sub) throw new HttpError(401, 'Authentication is required.')
  const groups = String(claims['cognito:groups'] ?? '').split(',').map((group) => group.trim())
  const role = groups.includes('admin') ? 'admin' : groups.includes('organizer') ? 'organizer' : 'student'
  return { userId: claims.sub, role, email: claims.email ?? '' }
}

export function requireRole(principal: Principal, allowed: Principal['role'][]) {
  if (!allowed.includes(principal.role)) throw new HttpError(403, 'You do not have permission to perform this action.')
}

export function parseBody<T>(event: APIGatewayProxyEvent, schema: ZodType<T>): T {
  let value: unknown
  try { value = JSON.parse(event.body ?? '{}') } catch { throw new HttpError(400, 'Request body must be valid JSON.') }
  const result = schema.safeParse(value)
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? 'Request validation failed.')
  return result.data
}

export function response(statusCode: number, body?: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: body === undefined ? '' : JSON.stringify(body),
  }
}

export function handleError(error: unknown): APIGatewayProxyResult {
  if (error instanceof HttpError) return response(error.statusCode, { message: error.message })
  if (typeof error === 'object' && error && 'name' in error) {
    const name = String(error.name)
    if (name === 'ConditionalCheckFailedException' || name === 'TransactionCanceledException') {
      return response(409, { message: 'The request conflicts with the latest data. Refresh and try again.' })
    }
  }
  console.error('Unhandled request failure', error instanceof Error ? { name: error.name, message: error.message } : { type: typeof error })
  return response(500, { message: 'The request could not be completed.' })
}
