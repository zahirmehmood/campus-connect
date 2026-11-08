import path from 'node:path'
import * as cdk from 'aws-cdk-lib'
import * as amplify from 'aws-cdk-lib/aws-amplify'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as sns from 'aws-cdk-lib/aws-sns'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import type { Construct } from 'constructs'

export class CampusConnectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const allowedOrigin = this.node.tryGetContext('allowedOrigin') as string | undefined ?? 'http://localhost:5173'
    const retainData = this.node.tryGetContext('retainData') !== 'false'
    const dataRemovalPolicy = retainData ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY

    const users = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      deletionProtection: retainData,
      removalPolicy: dataRemovalPolicy,
    })
    users.addGlobalSecondaryIndex({ indexName: 'email-index', partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })

    const events = new dynamodb.Table(this, 'EventsTable', {
      partitionKey: { name: 'eventId', type: dynamodb.AttributeType.STRING }, billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED, pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, deletionProtection: retainData, removalPolicy: dataRemovalPolicy,
    })
    events.addGlobalSecondaryIndex({ indexName: 'status-startAt-index', partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'startAt', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })
    events.addGlobalSecondaryIndex({ indexName: 'organizer-startAt-index', partitionKey: { name: 'organizerId', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'startAt', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })

    const registrations = new dynamodb.Table(this, 'EventRegistrationsTable', {
      partitionKey: { name: 'eventId', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, deletionProtection: retainData, removalPolicy: dataRemovalPolicy,
    })
    registrations.addGlobalSecondaryIndex({ indexName: 'user-startAt-index', partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'userEventKey', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })

    const communities = new dynamodb.Table(this, 'CommunitiesTable', {
      partitionKey: { name: 'communityId', type: dynamodb.AttributeType.STRING }, billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED, pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, deletionProtection: retainData, removalPolicy: dataRemovalPolicy,
    })
    communities.addGlobalSecondaryIndex({ indexName: 'slug-index', partitionKey: { name: 'slug', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })
    communities.addGlobalSecondaryIndex({ indexName: 'status-createdAt-index', partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })

    const memberships = new dynamodb.Table(this, 'CommunityMembershipsTable', {
      partitionKey: { name: 'communityId', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, deletionProtection: retainData, removalPolicy: dataRemovalPolicy,
    })
    memberships.addGlobalSecondaryIndex({ indexName: 'user-joinedAt-index', partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'userMembershipKey', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })

    const announcements = new dynamodb.Table(this, 'AnnouncementsTable', {
      partitionKey: { name: 'announcementId', type: dynamodb.AttributeType.STRING }, billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED, pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, deletionProtection: retainData, removalPolicy: dataRemovalPolicy,
    })
    announcements.addGlobalSecondaryIndex({ indexName: 'scope-publishedAt-index', partitionKey: { name: 'scope', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'publishedAt', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })
    announcements.addGlobalSecondaryIndex({ indexName: 'author-publishedAt-index', partitionKey: { name: 'authorId', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'publishedAt', type: dynamodb.AttributeType.STRING }, projectionType: dynamodb.ProjectionType.ALL })

    const notifications = new dynamodb.Table(this, 'NotificationsTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }, sortKey: { name: 'notificationKey', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, deletionProtection: retainData, removalPolicy: dataRemovalPolicy,
    })

    const uploads = new s3.Bucket(this, 'UploadsBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      cors: [{ allowedMethods: [s3.HttpMethods.POST], allowedOrigins: [allowedOrigin], allowedHeaders: ['*'], maxAge: 300 }],
      lifecycleRules: [{ id: 'AbortIncompleteUploads', abortIncompleteMultipartUploadAfter: cdk.Duration.days(1) }],
      removalPolicy: dataRemovalPolicy,
      autoDeleteObjects: false,
    })

    const notificationsTopic = new sns.Topic(this, 'NotificationsTopic', {
      displayName: 'CampusConnect notifications',
    })

    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: { email: { required: true, mutable: false }, fullname: { required: true, mutable: true } },
      customAttributes: {
        department: new cognito.StringAttribute({ mutable: true, minLen: 1, maxLen: 100 }),
        academicYear: new cognito.StringAttribute({ mutable: true, minLen: 1, maxLen: 50 }),
      },
      passwordPolicy: { minLength: 12, requireDigits: true, requireLowercase: true, requireUppercase: true, requireSymbols: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: dataRemovalPolicy,
    })
    const userPoolClient = userPool.addClient('WebClient', {
      generateSecret: false,
      authFlows: { userSrp: true, userPassword: true },
      preventUserExistenceErrors: true,
      enableTokenRevocation: true,
      accessTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    })
    new cognito.CfnUserPoolGroup(this, 'StudentGroup', { userPoolId: userPool.userPoolId, groupName: 'student', precedence: 30 })
    new cognito.CfnUserPoolGroup(this, 'OrganizerGroup', { userPoolId: userPool.userPoolId, groupName: 'organizer', precedence: 20 })
    new cognito.CfnUserPoolGroup(this, 'AdminGroup', { userPoolId: userPool.userPoolId, groupName: 'admin', precedence: 10 })

    const allTableEnvironment = {
      USERS_TABLE: users.tableName,
      EVENTS_TABLE: events.tableName,
      REGISTRATIONS_TABLE: registrations.tableName,
      COMMUNITIES_TABLE: communities.tableName,
      MEMBERSHIPS_TABLE: memberships.tableName,
      ANNOUNCEMENTS_TABLE: announcements.tableName,
      NOTIFICATIONS_TABLE: notifications.tableName,
      ALLOWED_ORIGIN: allowedOrigin,
    }
    const createFunction = (constructId: string, entry: string, extraEnvironment: Record<string, string> = {}) => {
      const logGroup = new logs.LogGroup(this, `${constructId}Logs`, {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      })
      return new NodejsFunction(this, constructId, {
        entry: path.join(__dirname, '..', 'lambda', entry),
        runtime: lambda.Runtime.NODEJS_24_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 512,
        timeout: cdk.Duration.seconds(15),
        tracing: lambda.Tracing.ACTIVE,
        logGroup,
        environment: { ...allTableEnvironment, ...extraEnvironment },
        bundling: { minify: true, sourceMap: true, target: 'node24' },
      })
    }

    const bootstrapFunction = createFunction('BootstrapFunction', 'bootstrap/handler.ts')
    const profileFunction = createFunction('ProfileFunction', 'profile/handler.ts')
    const eventsFunction = createFunction('EventsFunction', 'events/handler.ts')
    const communitiesFunction = createFunction('CommunitiesFunction', 'communities/handler.ts')
    const announcementsFunction = createFunction('AnnouncementsFunction', 'announcements/handler.ts', { SNS_TOPIC_ARN: notificationsTopic.topicArn })
    const adminFunction = createFunction('AdminFunction', 'admin/handler.ts')
    const uploadsFunction = createFunction('UploadsFunction', 'uploads/handler.ts', { UPLOADS_BUCKET: uploads.bucketName })
    const postConfirmationLogGroup = new logs.LogGroup(this, 'PostConfirmationFunctionLogs', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
    const postConfirmationFunction = new NodejsFunction(this, 'PostConfirmationFunction', {
      entry: path.join(__dirname, '..', 'lambda', 'auth/post-confirmation.ts'), runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64, memorySize: 256, timeout: cdk.Duration.seconds(10), logGroup: postConfirmationLogGroup,
      environment: { USERS_TABLE: users.tableName }, bundling: { minify: true, sourceMap: true, target: 'node24' },
    })
    userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, postConfirmationFunction)

    for (const table of [users, events, registrations, communities, memberships, announcements, notifications]) table.grantReadData(bootstrapFunction)
    users.grantReadWriteData(profileFunction)
    users.grantReadData(eventsFunction); communities.grantReadData(eventsFunction); events.grantReadWriteData(eventsFunction); registrations.grantReadWriteData(eventsFunction); notifications.grantWriteData(eventsFunction)
    users.grantReadData(communitiesFunction); communities.grantReadWriteData(communitiesFunction); memberships.grantReadWriteData(communitiesFunction)
    users.grantReadData(announcementsFunction); communities.grantReadData(announcementsFunction); announcements.grantWriteData(announcementsFunction); notificationsTopic.grantPublish(announcementsFunction)
    users.grantReadWriteData(adminFunction); communities.grantReadWriteData(adminFunction); events.grantReadWriteData(adminFunction); announcements.grantReadWriteData(adminFunction)
    uploads.grantPut(uploadsFunction)
    users.grantWriteData(postConfirmationFunction)
    postConfirmationFunction.addToRolePolicy(new iam.PolicyStatement({ actions: ['cognito-idp:AdminAddUserToGroup'], resources: [this.formatArn({ service: 'cognito-idp', resource: 'userpool', resourceName: '*' })] }))

    const api = new apigateway.RestApi(this, 'RestApi', {
      restApiName: 'CampusConnect API',
      description: 'Protected REST API for CampusConnect',
      deployOptions: { stageName: 'v1', tracingEnabled: true, metricsEnabled: true, throttlingRateLimit: 100, throttlingBurstLimit: 200 },
      defaultCorsPreflightOptions: { allowOrigins: [allowedOrigin], allowMethods: apigateway.Cors.ALL_METHODS, allowHeaders: ['Content-Type', 'Authorization'], allowCredentials: true },
    })
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', { cognitoUserPools: [userPool] })
    const protectedMethod: apigateway.MethodOptions = { authorizationType: apigateway.AuthorizationType.COGNITO, authorizer }
    const integration = (fn: lambda.IFunction) => new apigateway.LambdaIntegration(fn, { proxy: true })

    api.root.addResource('bootstrap').addMethod('GET', integration(bootstrapFunction), protectedMethod)
    api.root.addResource('public').addResource('bootstrap').addMethod('GET', integration(bootstrapFunction))
    const me = api.root.addResource('me'); me.addMethod('GET', integration(profileFunction), protectedMethod); me.addMethod('PUT', integration(profileFunction), protectedMethod)
    const eventsResource = api.root.addResource('events'); eventsResource.addMethod('POST', integration(eventsFunction), protectedMethod)
    const eventResource = eventsResource.addResource('{eventId}'); eventResource.addMethod('PUT', integration(eventsFunction), protectedMethod)
    const eventRegistrations = eventResource.addResource('registrations'); eventRegistrations.addMethod('POST', integration(eventsFunction), protectedMethod)
    eventRegistrations.addResource('me').addMethod('DELETE', integration(eventsFunction), protectedMethod)
    eventRegistrations.addResource('{userId}').addMethod('PATCH', integration(eventsFunction), protectedMethod)
    const communitiesResource = api.root.addResource('communities').addResource('{communityId}').addResource('memberships'); communitiesResource.addMethod('POST', integration(communitiesFunction), protectedMethod); communitiesResource.addResource('me').addMethod('DELETE', integration(communitiesFunction), protectedMethod)
    api.root.addResource('announcements').addMethod('POST', integration(announcementsFunction), protectedMethod)
    api.root.addResource('uploads').addMethod('POST', integration(uploadsFunction), protectedMethod)
    const admin = api.root.addResource('admin')
    admin.addResource('users').addResource('{userId}').addMethod('PATCH', integration(adminFunction), protectedMethod)
    admin.addResource('communities').addResource('{communityId}').addMethod('PATCH', integration(adminFunction), protectedMethod)
    admin.addResource('content').addResource('{contentType}').addResource('{contentId}').addMethod('PATCH', integration(adminFunction), protectedMethod)

    const amplifyApp = new amplify.CfnApp(this, 'AmplifyApp', {
      name: 'CampusConnect',
      platform: 'WEB',
      description: 'CampusConnect Vite frontend hosting. Connect a repository or publish dist manually.',
      buildSpec: `version: 1\nfrontend:\n  phases:\n    preBuild:\n      commands:\n        - npm ci\n    build:\n      commands:\n        - npm run build\n  artifacts:\n    baseDirectory: dist\n    files:\n      - '**/*'\n  cache:\n    paths:\n      - node_modules/**/*\n`,
      environmentVariables: [
        { name: 'VITE_DATA_MODE', value: 'aws' },
        { name: 'VITE_AWS_REGION', value: this.region },
        { name: 'VITE_COGNITO_USER_POOL_ID', value: userPool.userPoolId },
        { name: 'VITE_COGNITO_USER_POOL_CLIENT_ID', value: userPoolClient.userPoolClientId },
        { name: 'VITE_API_BASE_URL', value: api.url.replace(/\/$/, '') },
        { name: 'VITE_UPLOAD_BUCKET_NAME', value: uploads.bucketName },
      ],
      customRules: [{ source: '</^[^.]+$/>', target: '/index.html', status: '200' }],
    })
    new amplify.CfnBranch(this, 'MainBranch', { appId: amplifyApp.attrAppId, branchName: 'main', stage: 'PRODUCTION', enableAutoBuild: false })

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url })
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId })
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId })
    new cdk.CfnOutput(this, 'UploadsBucketName', { value: uploads.bucketName })
    new cdk.CfnOutput(this, 'NotificationsTopicArn', { value: notificationsTopic.topicArn })
    new cdk.CfnOutput(this, 'AmplifyAppId', { value: amplifyApp.attrAppId })
  }
}
