import type { APIGatewayProxyHandler } from 'aws-lambda'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { documentClient, requireActiveUser, tables } from '../shared/db'
import { handleError, HttpError, parseBody, principalFrom, requireRole, response } from '../shared/http'
import { accountStatusSchema, communityStatusSchema, contentStatusSchema } from '../shared/schemas'

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const principal = principalFrom(event)
    await requireActiveUser(principal.userId)
    requireRole(principal, ['admin'])

    if (event.resource === '/admin/users/{userId}' && event.httpMethod === 'PATCH') {
      const userId = event.pathParameters?.userId
      if (!userId) throw new HttpError(400, 'User ID is required.')
      if (userId === principal.userId) throw new HttpError(409, 'You cannot suspend your own administrator account.')
      const { status } = parseBody(event, accountStatusSchema)
      await documentClient.send(new UpdateCommand({ TableName: tables.users, Key: { userId }, UpdateExpression: 'SET #status = :status, updatedAt = :now', ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() }, ConditionExpression: 'attribute_exists(userId)' }))
      return response(204)
    }

    if (event.resource === '/admin/communities/{communityId}' && event.httpMethod === 'PATCH') {
      const communityId = event.pathParameters?.communityId
      if (!communityId) throw new HttpError(400, 'Community ID is required.')
      const { status } = parseBody(event, communityStatusSchema)
      const result = await documentClient.send(new UpdateCommand({ TableName: tables.communities, Key: { communityId }, UpdateExpression: 'SET #status = :status, reviewedAt = :now, reviewedBy = :admin', ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString(), ':admin': principal.userId }, ConditionExpression: 'attribute_exists(communityId)', ReturnValues: 'ALL_NEW' }))
      return response(200, { ...result.Attributes, id: communityId })
    }

    if (event.resource === '/admin/content/{contentType}/{contentId}' && event.httpMethod === 'PATCH') {
      const contentType = event.pathParameters?.contentType
      const contentId = event.pathParameters?.contentId
      if (!contentId || !['event', 'announcement'].includes(contentType ?? '')) throw new HttpError(400, 'Valid content type and ID are required.')
      const { status } = parseBody(event, contentStatusSchema)
      const table = contentType === 'event' ? tables.events : tables.announcements
      const keyName = contentType === 'event' ? 'eventId' : 'announcementId'
      await documentClient.send(new UpdateCommand({ TableName: table, Key: { [keyName]: contentId }, UpdateExpression: 'SET #status = :status, moderatedAt = :now, moderatedBy = :admin', ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString(), ':admin': principal.userId }, ConditionExpression: `attribute_exists(${keyName})` }))
      return response(204)
    }

    return response(405, { message: 'Method not allowed.' })
  } catch (error) { return handleError(error) }
}
