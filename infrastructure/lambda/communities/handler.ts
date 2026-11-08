import type { APIGatewayProxyHandler } from 'aws-lambda'
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { documentClient, requireActiveUser, requireItem, tables } from '../shared/db'
import { handleError, HttpError, principalFrom, requireRole, response } from '../shared/http'

interface CommunityRecord { communityId: string; name: string; status: string; memberCount: number }

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const principal = principalFrom(event)
    await requireActiveUser(principal.userId)
    requireRole(principal, ['student'])
    const communityId = event.pathParameters?.communityId
    if (!communityId) throw new HttpError(400, 'Community ID is required.')
    const community = await requireItem<CommunityRecord>(tables.communities, { communityId }, 'Community')
    if (community.status !== 'approved') throw new HttpError(409, 'This community is not accepting members.')

    if (event.resource === '/communities/{communityId}/memberships' && event.httpMethod === 'POST') {
      const joinedAt = new Date().toISOString()
      await documentClient.send(new TransactWriteCommand({ TransactItems: [
        { Put: { TableName: tables.memberships, Item: { communityId, userId: principal.userId, joinedAt, userMembershipKey: `${joinedAt}#${communityId}`, role: 'member' }, ConditionExpression: 'attribute_not_exists(communityId) AND attribute_not_exists(userId)' } },
        { Update: { TableName: tables.communities, Key: { communityId }, UpdateExpression: 'ADD memberCount :one', ConditionExpression: '#status = :approved', ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: { ':one': 1, ':approved': 'approved' } } },
      ] }))
      return response(204)
    }

    if (event.resource === '/communities/{communityId}/memberships/me' && event.httpMethod === 'DELETE') {
      await documentClient.send(new TransactWriteCommand({ TransactItems: [
        { Delete: { TableName: tables.memberships, Key: { communityId, userId: principal.userId }, ConditionExpression: 'attribute_exists(communityId) AND attribute_exists(userId)' } },
        { Update: { TableName: tables.communities, Key: { communityId }, UpdateExpression: 'ADD memberCount :minusOne', ConditionExpression: 'memberCount > :zero', ExpressionAttributeValues: { ':minusOne': -1, ':zero': 0 } } },
      ] }))
      return response(204)
    }

    return response(405, { message: 'Method not allowed.' })
  } catch (error) { return handleError(error) }
}
