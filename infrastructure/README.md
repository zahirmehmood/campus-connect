# CampusConnect AWS infrastructure

This directory contains the AWS CDK v2 stack and TypeScript Lambda handlers for CampusConnect.

## Resources

- Amplify Hosting application and `main` branch configuration
- Cognito User Pool, browser client, and `student`, `organizer`, `admin` groups
- Post-confirmation profile/group provisioning Lambda
- API Gateway REST API with Cognito authorizer
- Bootstrap, profile, events, communities, announcements, admin, and upload Lambdas
- Users, Events, EventRegistrations, Communities, CommunityMemberships, Announcements, and Notifications DynamoDB tables
- Private, encrypted, versioned S3 upload bucket
- SNS notifications topic

## Commands

From the repository root:

```bash
npm --prefix infrastructure install
npm run infra:build
npm run infra:synth
```

For an authorized target account:

```bash
npx --prefix infrastructure cdk bootstrap aws://ACCOUNT_ID/REGION
npm --prefix infrastructure run diff -- -c allowedOrigin=https://YOUR_FRONTEND_ORIGIN -c retainData=true
npm --prefix infrastructure run deploy -- -c allowedOrigin=https://YOUR_FRONTEND_ORIGIN -c retainData=true
```

The default origin is `http://localhost:5173`. The default retention setting is safe: tables and the bucket are retained and table deletion protection is enabled. Use `retainData=false` only for an explicitly disposable environment.

## Deployment sequence

1. Build and synthesize locally.
2. Review `cdk diff` and IAM changes.
3. Deploy with the temporary local origin if an Amplify domain does not yet exist.
4. Connect the generated Amplify app to the approved source repository, or use manual deployment.
5. Redeploy with the real Amplify origin to restrict API and S3 CORS.
6. Populate approved production content through a controlled process.
7. Provision organizer/admin roles in both Cognito groups and DynamoDB.
8. Attach only approved SNS subscriptions.
9. Run role, ownership, concurrency, upload-policy, backup, and alert tests.

## Security behavior

API Gateway validates Cognito tokens. Lambda still checks Cognito groups, DynamoDB account status, organizer ownership, and request schemas. New public registrations always become students. Registration and membership counters use DynamoDB transactions and conditional expressions.

Uploads use a five-minute presigned POST. The policy allows JPG, PNG, WebP, or PDF and a maximum of 5 MB. The server chooses the object key. S3 blocks public access and requires TLS.

## Status

`npm run build` and `npm run synth` have completed successfully in the local workspace. This stack has not been deployed to AWS, so no live integration is claimed.
