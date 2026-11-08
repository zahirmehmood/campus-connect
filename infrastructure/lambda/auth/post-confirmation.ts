import type { PostConfirmationTriggerHandler } from 'aws-lambda'
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const usersTable = process.env.USERS_TABLE
if (!usersTable) throw new Error('USERS_TABLE is required')
const cognito = new CognitoIdentityProviderClient({})
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } })

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const attributes = event.request.userAttributes
  const fullName = attributes.name || attributes.email?.split('@')[0] || 'CampusConnect Student'
  await dynamo.send(new PutCommand({
    TableName: usersTable,
    Item: {
      userId: attributes.sub,
      email: String(attributes.email ?? '').toLowerCase(),
      fullName,
      role: 'student',
      status: 'active',
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=dbeafe`,
      department: attributes['custom:department'] ?? 'Not specified',
      academicYear: attributes['custom:academicYear'] ?? 'Not specified',
      bio: '', interests: [], skills: [], managedCommunityIds: [],
      createdAt: new Date().toISOString(),
    },
    ConditionExpression: 'attribute_not_exists(userId)',
  })).catch((error: unknown) => {
    if (!(typeof error === 'object' && error && 'name' in error && error.name === 'ConditionalCheckFailedException')) throw error
  })
  await cognito.send(new AdminAddUserToGroupCommand({
    UserPoolId: event.userPoolId,
    Username: event.userName,
    GroupName: 'student',
  }))
  return event
}
