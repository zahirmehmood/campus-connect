import type { APIGatewayProxyHandler } from 'aws-lambda'
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { documentClient, requireActiveUser, tables } from '../shared/db'
import { handleError, principalFrom, response, type Principal } from '../shared/http'

async function scan(TableName: string) {
  const result = await documentClient.send(new ScanCommand({ TableName }))
  return result.Items ?? []
}

async function queryByUser(TableName: string, IndexName: string, userId: string) {
  const result = await documentClient.send(new QueryCommand({ TableName, IndexName, KeyConditionExpression: 'userId = :userId', ExpressionAttributeValues: { ':userId': userId } }))
  return result.Items ?? []
}

function optionalPrincipal(event: Parameters<APIGatewayProxyHandler>[0]): Principal | null {
  try { return principalFrom(event) } catch { return null }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const principal = optionalPrincipal(event)
    if (principal) await requireActiveUser(principal.userId)
    const [allEvents, allCommunities, allAnnouncements] = await Promise.all([
      scan(tables.events), scan(tables.communities), scan(tables.announcements),
    ])
    const events = allEvents.filter((item) => principal?.role === 'admin' || item.status === 'published' || item.organizerId === principal?.userId)
    const communities = allCommunities.filter((item) => principal?.role === 'admin' || item.status === 'approved')
    const announcements = allAnnouncements.filter((item) => principal?.role === 'admin' || item.status === 'published' || item.authorId === principal?.userId)

    if (!principal) {
      return response(200, {
        version: 1,
        users: [],
        events: events.map((item) => ({ ...item, id: item.eventId })),
        registrations: [],
        communities: communities.map((item) => ({ ...item, id: item.communityId })),
        memberships: [],
        announcements: announcements.map((item) => ({ ...item, id: item.announcementId })),
        notifications: [],
        activities: [],
      })
    }

    const memberships = principal.role === 'student'
      ? await queryByUser(tables.memberships, 'user-joinedAt-index', principal.userId)
      : await scan(tables.memberships)
    const allRegistrations = principal.role === 'student'
      ? await queryByUser(tables.registrations, 'user-startAt-index', principal.userId)
      : await scan(tables.registrations)
    const ownedEventIds = new Set(allEvents.filter((item) => item.organizerId === principal.userId).map((item) => item.eventId))
    const registrations = principal.role === 'organizer' ? allRegistrations.filter((item) => ownedEventIds.has(item.eventId)) : allRegistrations
    const visibleUserIds = new Set([principal.userId, ...registrations.map((item) => String(item.userId)), ...memberships.map((item) => String(item.userId))])
    const rawUsers = await scan(tables.users)
    const users = rawUsers.filter((item) => principal.role === 'admin' || visibleUserIds.has(String(item.userId))).map((item) => {
      if (principal.role === 'admin' || item.userId === principal.userId || registrations.some((registration) => registration.userId === item.userId && ownedEventIds.has(registration.eventId))) return item
      const publicProfile = { ...item }
      delete publicProfile.email
      delete publicProfile.status
      return { ...publicProfile, email: '', status: 'active' }
    })
    const notificationsResult = await documentClient.send(new QueryCommand({ TableName: tables.notifications, KeyConditionExpression: 'userId = :userId', ExpressionAttributeValues: { ':userId': principal.userId }, ScanIndexForward: false, Limit: 25 }))

    return response(200, {
      version: 1,
      users: users.map((item) => ({ ...item, id: item.userId })),
      events: events.map((item) => ({ ...item, id: item.eventId })),
      registrations,
      communities: communities.map((item) => ({ ...item, id: item.communityId })),
      memberships,
      announcements: announcements.map((item) => ({ ...item, id: item.announcementId })),
      notifications: (notificationsResult.Items ?? []).map((item) => ({ ...item, id: item.notificationId })),
      activities: [],
    })
  } catch (error) { return handleError(error) }
}
