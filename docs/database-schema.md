# DynamoDB schema and access patterns

CampusConnect uses one table per aggregate. This makes ownership and IAM permissions easier to review than a single table while the product is still evolving. Every table uses on-demand billing, AWS-managed encryption, point-in-time recovery, and retention by default.

## Users

| Setting | Value |
|---|---|
| Partition key | `userId` (Cognito `sub`) |
| GSI | `email-index`: partition key `email` |

Important attributes: `email`, `fullName`, `role`, `status`, `avatarUrl`, `department`, `academicYear`, `bio`, `interests`, `skills`, `managedCommunityIds`, `createdAt`.

Access patterns:

- Get the current profile by Cognito subject.
- Resolve a unique email during controlled account operations.
- Scan/paginate users for administration.
- Read an organizer's managed community IDs for ownership checks.

The public API does not expose unrelated email or status fields.

## Events

| Setting | Value |
|---|---|
| Partition key | `eventId` |
| GSI | `status-startAt-index`: `status`, `startAt` |
| GSI | `organizer-startAt-index`: `organizerId`, `startAt` |

Important attributes: `organizerId`, `organizerName`, `communityId`, `category`, `startAt`, `endAt`, `location`, `capacity`, `registrationCount`, `status`, `featured`, `tags`.

Access patterns:

- Query upcoming published events in chronological order.
- Query an organizer's event calendar.
- Get one event for details, ownership checks, or registration.
- Update content fields without overwriting the concurrent registration counter.

## EventRegistrations

| Setting | Value |
|---|---|
| Partition key | `eventId` |
| Sort key | `userId` |
| GSI | `user-startAt-index`: `userId`, `userEventKey` (`startAt#eventId`) |

Important attributes: `registeredAt`, `status`, `attendance`, `userEventKey`.

Access patterns:

- List participants for an event.
- List one student's registrations ordered by event start.
- Get or conditionally delete one registration.
- Update attendance after organizer ownership verification.

### Registration transaction

Registration uses one `TransactWriteItems` call:

```text
Put EventRegistrations(eventId, userId)
  IF attribute_not_exists(eventId) AND attribute_not_exists(userId)

Update Events(eventId)
  ADD registrationCount 1
  IF status = "published" AND registrationCount < capacity

Put Notifications(userId, createdAt#notificationId)
```

The composite primary key prevents duplicates. The condition on the event row serializes competing increments at the capacity boundary. Both conditions must succeed or DynamoDB commits nothing.

Cancellation conditionally deletes the registration and decrements `registrationCount` only when it is greater than zero, also in one transaction.

## Communities

| Setting | Value |
|---|---|
| Partition key | `communityId` |
| GSI | `slug-index`: partition key `slug` |
| GSI | `status-createdAt-index`: `status`, `createdAt` |

Important attributes: `name`, `slug`, `description`, `leaderIds`, `leaderNames`, `memberCount`, `status`, `featured`, `imageKey` or `imageUrl`.

Access patterns:

- Resolve a community by ID or public slug.
- Query approved communities for discovery.
- Query pending applications in submission order.
- Update approval status after an admin check.

## CommunityMemberships

| Setting | Value |
|---|---|
| Partition key | `communityId` |
| Sort key | `userId` |
| GSI | `user-joinedAt-index`: `userId`, `userMembershipKey` (`joinedAt#communityId`) |

Important attributes: `role`, `joinedAt`, `userMembershipKey`.

Access patterns:

- List community members.
- List communities joined by one student.
- Test, add, or remove a membership.

Joining conditionally puts the membership and increments `memberCount` only while the community is approved. Leaving conditionally deletes it and performs a guarded decrement. Both use transactions.

## Announcements

| Setting | Value |
|---|---|
| Partition key | `announcementId` |
| GSI | `scope-publishedAt-index`: `scope`, `publishedAt` |
| GSI | `author-publishedAt-index`: `authorId`, `publishedAt` |

Important attributes: `authorId`, `authorName`, `scope`, `communityId`, `category`, `priority`, `status`, `title`, `summary`, `body`, `publishedAt`.

Access patterns:

- Query the campus feed newest-first.
- Query community announcements.
- List content published by an organizer.
- Moderate one announcement by ID.

## Notifications

| Setting | Value |
|---|---|
| Partition key | `userId` |
| Sort key | `notificationKey` (`createdAt#notificationId`) |

Important attributes: `notificationId`, `type`, `title`, `message`, `link`, `createdAt`, `readAt`.

Access patterns:

- Query recent notifications newest-first for one user.
- Count unread items in a bounded recent result.
- Mark a notification read with a key-specific update.

## Data integrity rules

- Cognito subject is the canonical user ID.
- Only the API writes counters; clients never submit `registrationCount` or `memberCount`.
- Lambda checks account status and ownership before mutations.
- Zod validates all mutation bodies.
- ISO-8601 timestamps preserve lexical ordering in sort keys.
- S3 object keys, not public object URLs, should be canonical for production media.
- Table deletion protection and retention are enabled unless a deployer explicitly sets `retainData=false`.

## Growth plan

The MVP bootstrap Lambda uses scans to assemble a compact dashboard snapshot. For production growth:

1. Add paginated `GET /events`, `/communities`, and `/announcements` query endpoints.
2. Materialize dashboard aggregates instead of scanning registration data.
3. Use DynamoDB Streams to update analytics summaries and notification fan-out.
4. Add TTL only to intentionally temporary records such as idempotency keys; do not apply TTL to registrations or audit data without a retention policy.
