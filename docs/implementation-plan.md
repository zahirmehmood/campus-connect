# CampusConnect implementation plan

## Scope and assumptions

The demonstrable MVP runs entirely in the browser with realistic, versioned mock data. Its service layer mirrors the AWS REST contract. AWS infrastructure is supplied as CDK and Lambda code, but a real account deployment, institution configuration, and production operations remain separate rollout work.

## Phase 1: Foundation

- Vite, React, TypeScript, and Tailwind configuration
- shadcn-style reusable primitives and visual tokens
- Public and dashboard shells with responsive navigation
- Domain types, environment handling, route guards, toast feedback

**Outcome:** a consistent, responsive application frame.

## Phase 2: Local service layer

- Versioned `localStorage` database
- Twenty student accounts and role-specific demo identities
- Relative-date event and announcement seed
- Authentication session restoration
- Service-side role and ownership checks
- Registration and membership conflict/capacity logic

**Outcome:** interactions persist and reject unauthorized or conflicting mutations without AWS credentials.

## Phase 3: Student experience

- Landing page and public discovery
- Search, category filtering, sorting, and details
- Event registration/cancellation
- Community membership and member views
- Announcements
- Student dashboard, recommendations, profile, and personal lists

**Outcome:** the complete student journey works locally.

## Phase 4: Organizer experience

- Recharts analytics
- Event create/edit/draft/publish workflows
- Capacity validation
- Participant search, attendance status, and CSV export
- Scoped announcement publishing

**Outcome:** organizers can operate their own content and registrations.

## Phase 5: Administration

- Platform metrics
- User status management
- Society application review
- Content moderation
- Campus announcement publishing

**Outcome:** administrator controls work and mock service authorization remains authoritative.

## Phase 6: AWS integration

- Cognito User Pool, groups, client, and post-confirmation provisioning
- Cognito-protected API Gateway REST routes
- Domain Lambda functions with claim, account, ownership, and role checks
- Seven encrypted DynamoDB tables with query GSIs
- Transactional registration and membership writes
- Private S3 upload policies
- SNS announcement publication
- Amplify Hosting application and build configuration

**Outcome:** CDK and Lambda code type-check and synthesize into CloudFormation. Deployment is not considered complete until tested in an authorized AWS account.

## Phase 7: Verification and rollout

Completed local checks:

- Frontend TypeScript compilation
- ESLint
- Vite production build
- Infrastructure/Lambda TypeScript compilation
- CDK synthesis

Required before production:

- Deploy to a non-production AWS account
- Connect the Amplify source repository
- Exercise Cognito confirmation and each role
- Seed controlled cloud data
- Verify API authorization with negative tests
- Load-test capacity transactions
- Validate S3 policies with accepted and rejected uploads
- Configure approved SNS subscriptions
- Add alarms, dashboards, backups, privacy controls, and accessibility testing

## MVP acceptance criteria

- Every primary action navigates or changes state.
- Unauthorized route access redirects to the correct dashboard or sign-in.
- Mutation authorization is enforced in the service/backend layer.
- A student cannot register twice or exceed event capacity.
- Students can cancel registrations and leave communities.
- Organizers can manage only their events and communities.
- Administrators can moderate users, societies, events, and announcements.
- Forms provide validation and actionable errors.
- Loading and empty states are visible.
- Data survives refresh and can be reset.
- The UI adapts to mobile, tablet, and desktop widths.
- AWS deployment status is reported accurately.
