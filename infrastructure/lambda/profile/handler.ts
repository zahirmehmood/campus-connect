import type { APIGatewayProxyHandler } from 'aws-lambda'
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { documentClient, requireActiveUser, tables } from '../shared/db'
import { handleError, parseBody, principalFrom, response } from '../shared/http'
import { profileSchema } from '../shared/schemas'

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const principal = principalFrom(event)
    if (event.httpMethod === 'GET') {
      const user = await requireActiveUser(principal.userId)
      return response(200, { ...user, id: user.userId })
    }
    if (event.httpMethod === 'PUT') {
      await requireActiveUser(principal.userId)
      const input = parseBody(event, profileSchema)
      const result = await documentClient.send(new UpdateCommand({
        TableName: tables.users,
        Key: { userId: principal.userId },
        UpdateExpression: 'SET fullName = :fullName, department = :department, academicYear = :academicYear, bio = :bio, interests = :interests, skills = :skills, avatarUrl = :avatarUrl, updatedAt = :updatedAt',
        ExpressionAttributeValues: { ...Object.fromEntries(Object.entries(input).map(([key, value]) => [`:${key}`, value])), ':updatedAt': new Date().toISOString() },
        ConditionExpression: 'attribute_exists(userId)',
        ReturnValues: 'ALL_NEW',
      }))
      return response(200, { ...result.Attributes, id: principal.userId })
    }
    return response(405, { message: 'Method not allowed.' })
  } catch (error) { return handleError(error) }
}
