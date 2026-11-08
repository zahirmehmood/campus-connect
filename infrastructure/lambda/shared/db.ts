import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { HttpError } from './http'

export const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
})

export const tables = {
  users: required('USERS_TABLE'),
  events: required('EVENTS_TABLE'),
  registrations: required('REGISTRATIONS_TABLE'),
  communities: required('COMMUNITIES_TABLE'),
  memberships: required('MEMBERSHIPS_TABLE'),
  announcements: required('ANNOUNCEMENTS_TABLE'),
  notifications: required('NOTIFICATIONS_TABLE'),
}

function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} environment variable is required`)
  return value
}

export async function getItem<T>(TableName: string, Key: Record<string, string>): Promise<T | undefined> {
  const result = await documentClient.send(new GetCommand({ TableName, Key, ConsistentRead: true }))
  return result.Item as T | undefined
}

export async function requireItem<T>(TableName: string, Key: Record<string, string>, label: string): Promise<T> {
  const item = await getItem<T>(TableName, Key)
  if (!item) throw new HttpError(404, `${label} not found.`)
  return item
}

export async function requireActiveUser(userId: string) {
  const user = await requireItem<Record<string, unknown>>(tables.users, { userId }, 'User')
  if (user.status !== 'active') throw new HttpError(403, 'This account is not active.')
  return user
}
