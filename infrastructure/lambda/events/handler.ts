import type { APIGatewayProxyHandler } from 'aws-lambda'
import { randomUUID } from 'node:crypto'
import { PutCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { documentClient, requireActiveUser, requireItem, tables } from '../shared/db'
import { handleError, HttpError, parseBody, principalFrom, requireRole, response } from '../shared/http'
import { attendanceSchema, eventSchema } from '../shared/schemas'

interface EventRecord {
  eventId: string
  organizerId: string
  organizerName: string
  registrationCount: number
  capacity: number
  status: string
  startAt: string
  title: string
  [key: string]: unknown
}

async function assertCommunityOwnership(user: Record<string, unknown>, communityId: string | undefined, role: string) {
  if (!communityId || role === 'admin') return
  const managed = Array.isArray(user.managedCommunityIds) ? user.managedCommunityIds : []
  if (!managed.includes(communityId)) throw new HttpError(403, 'You can only manage events for your assigned communities.')
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const principal = principalFrom(event)
    const user = await requireActiveUser(principal.userId)
    const eventId = event.pathParameters?.eventId
    const targetUserId = event.pathParameters?.userId

    if (event.resource === '/events' && event.httpMethod === 'POST') {
      requireRole(principal, ['organizer', 'admin'])
      const input = parseBody(event, eventSchema)
      await assertCommunityOwnership(user, input.communityId, principal.role)
      const community = input.communityId ? await requireItem<Record<string, unknown>>(tables.communities, { communityId: input.communityId }, 'Community') : undefined
      const now = new Date().toISOString()
      const item = {
        ...input,
        eventId: randomUUID(),
        organizerId: principal.userId,
        organizerName: String(community?.name ?? user.fullName ?? principal.email),
        registrationCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      await documentClient.send(new PutCommand({ TableName: tables.events, Item: item, ConditionExpression: 'attribute_not_exists(eventId)' }))
      return response(201, { ...item, id: item.eventId })
    }

    if (!eventId) throw new HttpError(400, 'Event ID is required.')
    const campusEvent = await requireItem<EventRecord>(tables.events, { eventId }, 'Event')

    if (event.resource === '/events/{eventId}' && event.httpMethod === 'PUT') {
      requireRole(principal, ['organizer', 'admin'])
      if (principal.role !== 'admin' && campusEvent.organizerId !== principal.userId) throw new HttpError(403, 'You can only edit events you created.')
      const input = parseBody(event, eventSchema)
      await assertCommunityOwnership(user, input.communityId, principal.role)
      if (input.capacity < campusEvent.registrationCount) throw new HttpError(409, 'Capacity cannot be lower than active registrations.')
      const names: Record<string, string> = {}
      const values: Record<string, unknown> = { ':updatedAt': new Date().toISOString(), ':capacityCheck': input.capacity }
      const sets = Object.entries(input).map(([key, value], index) => {
        names[`#field${index}`] = key
        values[`:value${index}`] = value
        return `#field${index} = :value${index}`
      })
      const result = await documentClient.send(new UpdateCommand({
        TableName: tables.events,
        Key: { eventId },
        UpdateExpression: `SET ${sets.join(', ')}, updatedAt = :updatedAt`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ConditionExpression: 'attribute_exists(eventId) AND registrationCount <= :capacityCheck',
        ReturnValues: 'ALL_NEW',
      }))
      return response(200, { ...result.Attributes, id: eventId })
    }

    if (event.resource === '/events/{eventId}/registrations' && event.httpMethod === 'POST') {
      requireRole(principal, ['student'])
      if (campusEvent.status !== 'published' || new Date(campusEvent.startAt) <= new Date()) throw new HttpError(409, 'Registration is closed for this event.')
      const now = new Date().toISOString()
      const notificationId = randomUUID()
      await documentClient.send(new TransactWriteCommand({ TransactItems: [
        { Put: { TableName: tables.registrations, Item: { eventId, userId: principal.userId, registeredAt: now, status: 'registered', attendance: 'pending', userEventKey: `${campusEvent.startAt}#${eventId}` }, ConditionExpression: 'attribute_not_exists(eventId) AND attribute_not_exists(userId)' } },
        { Update: { TableName: tables.events, Key: { eventId }, UpdateExpression: 'ADD registrationCount :one', ConditionExpression: '#status = :published AND registrationCount < capacity', ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: { ':one': 1, ':published': 'published' } } },
        { Put: { TableName: tables.notifications, Item: { userId: principal.userId, notificationKey: `${now}#${notificationId}`, notificationId, title: 'Registration confirmed', message: `You are registered for ${campusEvent.title}.`, type: 'event', link: `/events/${eventId}`, createdAt: now } } },
      ] }))
      return response(204)
    }

    if (event.resource === '/events/{eventId}/registrations/me' && event.httpMethod === 'DELETE') {
      requireRole(principal, ['student'])
      await documentClient.send(new TransactWriteCommand({ TransactItems: [
        { Delete: { TableName: tables.registrations, Key: { eventId, userId: principal.userId }, ConditionExpression: 'attribute_exists(eventId) AND attribute_exists(userId)' } },
        { Update: { TableName: tables.events, Key: { eventId }, UpdateExpression: 'ADD registrationCount :minusOne', ConditionExpression: 'registrationCount > :zero', ExpressionAttributeValues: { ':minusOne': -1, ':zero': 0 } } },
      ] }))
      return response(204)
    }

    if (event.resource === '/events/{eventId}/registrations/{userId}' && event.httpMethod === 'PATCH') {
      requireRole(principal, ['organizer', 'admin'])
      if (principal.role !== 'admin' && campusEvent.organizerId !== principal.userId) throw new HttpError(403, 'You cannot manage this event registration.')
      if (!targetUserId) throw new HttpError(400, 'User ID is required.')
      const { attendance } = parseBody(event, attendanceSchema)
      await documentClient.send(new UpdateCommand({ TableName: tables.registrations, Key: { eventId, userId: targetUserId }, UpdateExpression: 'SET attendance = :attendance', ExpressionAttributeValues: { ':attendance': attendance }, ConditionExpression: 'attribute_exists(eventId) AND attribute_exists(userId)' }))
      return response(204)
    }

    return response(405, { message: 'Method not allowed.' })
  } catch (error) { return handleError(error) }
}
