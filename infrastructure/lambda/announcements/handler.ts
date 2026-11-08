import type { APIGatewayProxyHandler } from 'aws-lambda'
import { randomUUID } from 'node:crypto'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { documentClient, requireActiveUser, requireItem, tables } from '../shared/db'
import { handleError, HttpError, parseBody, principalFrom, requireRole, response } from '../shared/http'
import { announcementSchema } from '../shared/schemas'

const sns = new SNSClient({})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const principal = principalFrom(event)
    const user = await requireActiveUser(principal.userId)
    requireRole(principal, ['organizer', 'admin'])
    if (event.resource !== '/announcements' || event.httpMethod !== 'POST') return response(405, { message: 'Method not allowed.' })
    const input = parseBody(event, announcementSchema)
    if (principal.role === 'organizer') {
      if (input.scope !== 'community' || !input.communityId) throw new HttpError(403, 'Organizers can publish to assigned communities only.')
      const managed = Array.isArray(user.managedCommunityIds) ? user.managedCommunityIds : []
      if (!managed.includes(input.communityId)) throw new HttpError(403, 'You cannot publish for this community.')
    }
    const community = input.communityId ? await requireItem<Record<string, unknown>>(tables.communities, { communityId: input.communityId }, 'Community') : undefined
    const item = {
      ...input,
      announcementId: randomUUID(),
      authorId: principal.userId,
      authorName: String(community?.name ?? user.fullName ?? principal.email),
      publishedAt: new Date().toISOString(),
    }
    await documentClient.send(new PutCommand({ TableName: tables.announcements, Item: item, ConditionExpression: 'attribute_not_exists(announcementId)' }))
    if (input.status === 'published' && process.env.SNS_TOPIC_ARN) {
      await sns.send(new PublishCommand({ TopicArn: process.env.SNS_TOPIC_ARN, Subject: input.title.slice(0, 100), Message: JSON.stringify({ type: 'announcement.published', announcementId: item.announcementId, scope: input.scope, communityId: input.communityId, title: input.title }) }))
    }
    return response(201, { ...item, id: item.announcementId })
  } catch (error) { return handleError(error) }
}
