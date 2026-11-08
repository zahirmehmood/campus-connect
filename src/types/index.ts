export type UserRole = 'student' | 'organizer' | 'admin'
export type AccountStatus = 'active' | 'suspended'
export type ContentStatus = 'draft' | 'published' | 'hidden'
export type CommunityStatus = 'pending' | 'approved' | 'rejected'
export type RegistrationStatus = 'registered' | 'cancelled'
export type AttendanceStatus = 'pending' | 'attended' | 'no-show'

export type EventCategory =
  | 'Technology'
  | 'Hackathons'
  | 'Workshops'
  | 'Career Development'
  | 'Entrepreneurship'
  | 'Cultural Events'
  | 'Competitions'

export type AnnouncementCategory =
  | 'Academic'
  | 'Campus Life'
  | 'Events'
  | 'Opportunities'
  | 'Important'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: AccountStatus
  avatarUrl: string
  department: string
  academicYear: string
  bio: string
  interests: string[]
  skills: string[]
  managedCommunityIds: string[]
  createdAt: string
  isDemo?: boolean
}

export interface CampusEvent {
  id: string
  title: string
  description: string
  details: string
  organizerId: string
  organizerName: string
  communityId?: string
  category: EventCategory
  startAt: string
  endAt: string
  location: string
  format: 'In person' | 'Hybrid' | 'Online'
  capacity: number
  registrationCount: number
  imageUrl: string
  status: ContentStatus
  featured: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface EventRegistration {
  eventId: string
  userId: string
  registeredAt: string
  status: RegistrationStatus
  attendance: AttendanceStatus
}

export interface Community {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  imageUrl: string
  category: string
  leaderIds: string[]
  leaderNames: string[]
  memberCount: number
  status: CommunityStatus
  featured: boolean
  createdAt: string
}

export interface CommunityMembership {
  communityId: string
  userId: string
  joinedAt: string
  role: 'member' | 'leader'
}

export interface Announcement {
  id: string
  title: string
  summary: string
  body: string
  category: AnnouncementCategory
  authorId: string
  authorName: string
  scope: 'campus' | 'community'
  communityId?: string
  publishedAt: string
  status: ContentStatus
  priority: 'normal' | 'important'
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'event' | 'community' | 'announcement' | 'system'
  link?: string
  createdAt: string
  readAt?: string
}

export interface ActivityItem {
  id: string
  action: string
  actorName: string
  targetName: string
  createdAt: string
}

export interface DemoDatabase {
  version: number
  users: UserProfile[]
  events: CampusEvent[]
  registrations: EventRegistration[]
  communities: Community[]
  memberships: CommunityMembership[]
  announcements: Announcement[]
  notifications: Notification[]
  activities: ActivityItem[]
  credentialHashes: Record<string, string>
}

export type CampusSnapshot = Omit<DemoDatabase, 'credentialHashes'>

export interface ProfileInput {
  fullName: string
  department: string
  academicYear: string
  bio: string
  interests: string[]
  skills: string[]
  avatarUrl: string
}

export interface EventInput {
  title: string
  description: string
  details: string
  communityId?: string
  category: EventCategory
  startAt: string
  endAt: string
  location: string
  format: CampusEvent['format']
  capacity: number
  imageUrl: string
  status: Exclude<ContentStatus, 'hidden'>
  featured: boolean
  tags: string[]
}

export interface AnnouncementInput {
  title: string
  summary: string
  body: string
  category: AnnouncementCategory
  scope: Announcement['scope']
  communityId?: string
  priority: Announcement['priority']
  status: Exclude<ContentStatus, 'hidden'>
}

export interface RegistrationInput {
  fullName: string
  email: string
  password: string
  department: string
  academicYear: string
}

export interface DashboardMetrics {
  totalStudents: number
  totalCommunities: number
  totalEvents: number
  totalRegistrations: number
}
