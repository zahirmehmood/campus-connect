import { createDemoDatabase, DEMO_PASSWORD } from '@/data/seed'
import { uniqueId } from '@/lib/utils'
import type {
  AccountStatus,
  Announcement,
  AnnouncementInput,
  AttendanceStatus,
  CampusEvent,
  CampusSnapshot,
  CommunityStatus,
  ContentStatus,
  DemoDatabase,
  EventInput,
  ProfileInput,
  RegistrationInput,
  UserProfile,
  UserRole,
} from '@/types'
import { ServiceError, type AuthService, type CampusService } from './contracts'

const DATABASE_KEY = 'campusconnect:demo-db:v1'
const SESSION_KEY = 'campusconnect:session:v1'
const LATENCY_MS = 140

const delay = () => new Promise((resolve) => window.setTimeout(resolve, LATENCY_MS))

function clone<T>(value: T): T {
  return structuredClone(value)
}

function readDatabase(): DemoDatabase {
  const stored = window.localStorage.getItem(DATABASE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as DemoDatabase
      if (parsed.version === 1 && Array.isArray(parsed.users) && Array.isArray(parsed.events)) {
        return parsed
      }
    } catch {
      window.localStorage.removeItem(DATABASE_KEY)
    }
  }

  const seeded = createDemoDatabase()
  writeDatabase(seeded)
  return seeded
}

function writeDatabase(database: DemoDatabase) {
  window.localStorage.setItem(DATABASE_KEY, JSON.stringify(database))
}

function snapshot(database: DemoDatabase): CampusSnapshot {
  const publicData = clone(database) as Partial<DemoDatabase>
  delete publicData.credentialHashes
  return publicData as CampusSnapshot
}

function requireActor(database: DemoDatabase, actorId: string) {
  const user = database.users.find((candidate) => candidate.id === actorId)
  if (!user) throw new ServiceError('Your session is no longer valid. Please sign in again.', 'UNAUTHORIZED')
  if (user.status !== 'active') throw new ServiceError('This account is suspended.', 'FORBIDDEN')
  return user
}

function requireRole(user: UserProfile, roles: UserRole[]) {
  if (!roles.includes(user.role)) {
    throw new ServiceError('You do not have permission to perform this action.', 'FORBIDDEN')
  }
}

function validateEvent(input: EventInput) {
  if (input.title.trim().length < 4) throw new ServiceError('Event title must contain at least 4 characters.', 'VALIDATION')
  if (input.description.trim().length < 20) throw new ServiceError('Add a short description of at least 20 characters.', 'VALIDATION')
  if (input.details.trim().length < 40) throw new ServiceError('Event details must contain at least 40 characters.', 'VALIDATION')
  if (!Number.isInteger(input.capacity) || input.capacity < 1 || input.capacity > 10_000) {
    throw new ServiceError('Capacity must be a whole number between 1 and 10,000.', 'VALIDATION')
  }
  if (!input.location.trim()) throw new ServiceError('Location is required.', 'VALIDATION')
  if (Number.isNaN(Date.parse(input.startAt)) || Number.isNaN(Date.parse(input.endAt))) {
    throw new ServiceError('Enter valid event dates.', 'VALIDATION')
  }
  if (new Date(input.endAt) <= new Date(input.startAt)) {
    throw new ServiceError('The event end time must be after its start time.', 'VALIDATION')
  }
}

function validateCommunityAccess(actor: UserProfile, communityId?: string) {
  if (actor.role === 'organizer' && (!communityId || !actor.managedCommunityIds.includes(communityId))) {
    throw new ServiceError('Organizers can only publish for communities they manage.', 'FORBIDDEN')
  }
}

function addActivity(database: DemoDatabase, actorName: string, action: string, targetName: string) {
  database.activities.unshift({
    id: uniqueId('activity'),
    actorName,
    action,
    targetName,
    createdAt: new Date().toISOString(),
  })
  database.activities = database.activities.slice(0, 30)
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const mockAuthService: AuthService = {
  async restoreSession() {
    await delay()
    const userId = window.localStorage.getItem(SESSION_KEY)
    if (!userId) return null
    const user = readDatabase().users.find((candidate) => candidate.id === userId)
    if (!user || user.status !== 'active') {
      window.localStorage.removeItem(SESSION_KEY)
      return null
    }
    return clone(user)
  },

  async signIn(email, password) {
    await delay()
    const database = readDatabase()
    const normalizedEmail = email.trim().toLowerCase()
    const user = database.users.find((candidate) => candidate.email.toLowerCase() === normalizedEmail)
    if (!user) throw new ServiceError('The email or password is incorrect.', 'UNAUTHORIZED')

    const validPassword = user.isDemo
      ? password === DEMO_PASSWORD
      : database.credentialHashes[normalizedEmail] === await sha256(password)

    if (!validPassword) throw new ServiceError('The email or password is incorrect.', 'UNAUTHORIZED')
    if (user.status !== 'active') throw new ServiceError('This account has been suspended. Contact Student Affairs.', 'FORBIDDEN')

    window.localStorage.setItem(SESSION_KEY, user.id)
    return clone(user)
  },

  async signUp(input: RegistrationInput) {
    await delay()
    const database = readDatabase()
    const email = input.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.edu$/i.test(email)) {
      throw new ServiceError('Use a valid university email ending in .edu.', 'VALIDATION')
    }
    if (database.users.some((user) => user.email.toLowerCase() === email)) {
      throw new ServiceError('An account already exists for this email.', 'CONFLICT')
    }
    if (input.fullName.trim().length < 2 || input.password.length < 8 || !input.department.trim() || !input.academicYear.trim()) {
      throw new ServiceError('Complete every field and use a password with at least 8 characters.', 'VALIDATION')
    }

    const user: UserProfile = {
      id: uniqueId('student'),
      email,
      fullName: input.fullName.trim(),
      role: 'student',
      status: 'active',
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(input.fullName)}&backgroundColor=dbeafe`,
      department: input.department.trim(),
      academicYear: input.academicYear,
      bio: '',
      interests: [],
      skills: [],
      managedCommunityIds: [],
      createdAt: new Date().toISOString(),
      isDemo: false,
    }
    database.users.push(user)
    database.credentialHashes[email] = await sha256(input.password)
    addActivity(database, user.fullName, 'joined the platform', 'CampusConnect')
    writeDatabase(database)
    window.localStorage.setItem(SESSION_KEY, user.id)
    return { status: 'signed-in', user: clone(user) }
  },

  async confirmSignUp() {
    throw new ServiceError('Confirmation codes are not used in local demo mode.', 'VALIDATION')
  },

  async resendSignUpCode() {
    throw new ServiceError('Confirmation codes are not used in local demo mode.', 'VALIDATION')
  },

  async signOut() {
    await delay()
    window.localStorage.removeItem(SESSION_KEY)
  },
}

export const mockCampusService: CampusService = {
  async getSnapshot() {
    await delay()
    return snapshot(readDatabase())
  },

  async resetDemoData() {
    await delay()
    const database = createDemoDatabase()
    writeDatabase(database)
    return snapshot(database)
  },

  async updateProfile(actorId: string, input: ProfileInput) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    if (input.fullName.trim().length < 2 || !input.department.trim() || !input.academicYear.trim()) {
      throw new ServiceError('Name, department, and academic year are required.', 'VALIDATION')
    }
    Object.assign(actor, {
      ...input,
      fullName: input.fullName.trim(),
      department: input.department.trim(),
      bio: input.bio.trim(),
      interests: input.interests.map((item) => item.trim()).filter(Boolean).slice(0, 12),
      skills: input.skills.map((item) => item.trim()).filter(Boolean).slice(0, 12),
    })
    addActivity(database, actor.fullName, 'updated a profile', actor.fullName)
    writeDatabase(database)
    return clone(actor)
  },

  async registerForEvent(actorId: string, eventId: string) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['student'])
    const event = database.events.find((candidate) => candidate.id === eventId)
    if (!event || event.status !== 'published') throw new ServiceError('This event is not available.', 'NOT_FOUND')
    if (new Date(event.startAt) <= new Date()) throw new ServiceError('Registration has closed for this event.', 'CONFLICT')
    if (database.registrations.some((item) => item.eventId === eventId && item.userId === actorId && item.status === 'registered')) {
      throw new ServiceError('You are already registered for this event.', 'CONFLICT')
    }
    if (event.registrationCount >= event.capacity) throw new ServiceError('This event has reached capacity.', 'CAPACITY')

    database.registrations = database.registrations.filter((item) => !(item.eventId === eventId && item.userId === actorId))
    database.registrations.push({
      eventId,
      userId: actorId,
      registeredAt: new Date().toISOString(),
      status: 'registered',
      attendance: 'pending',
    })
    event.registrationCount += 1
    database.notifications.unshift({
      id: uniqueId('notification'), userId: actorId, title: 'Registration confirmed',
      message: `You are registered for ${event.title}.`, type: 'event', link: `/events/${event.id}`,
      createdAt: new Date().toISOString(),
    })
    addActivity(database, actor.fullName, 'registered for an event', event.title)
    writeDatabase(database)
  },

  async cancelEventRegistration(actorId: string, eventId: string) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['student'])
    const event = database.events.find((candidate) => candidate.id === eventId)
    if (!event) throw new ServiceError('Event not found.', 'NOT_FOUND')
    const index = database.registrations.findIndex((item) => item.eventId === eventId && item.userId === actorId && item.status === 'registered')
    if (index === -1) throw new ServiceError('You do not have an active registration for this event.', 'NOT_FOUND')
    database.registrations.splice(index, 1)
    event.registrationCount = Math.max(0, event.registrationCount - 1)
    addActivity(database, actor.fullName, 'cancelled an event registration', event.title)
    writeDatabase(database)
  },

  async joinCommunity(actorId: string, communityId: string) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['student'])
    const community = database.communities.find((candidate) => candidate.id === communityId && candidate.status === 'approved')
    if (!community) throw new ServiceError('Community not found.', 'NOT_FOUND')
    if (database.memberships.some((item) => item.communityId === communityId && item.userId === actorId)) {
      throw new ServiceError('You already belong to this community.', 'CONFLICT')
    }
    database.memberships.push({ communityId, userId: actorId, joinedAt: new Date().toISOString(), role: 'member' })
    community.memberCount += 1
    addActivity(database, actor.fullName, 'joined a community', community.name)
    writeDatabase(database)
  },

  async leaveCommunity(actorId: string, communityId: string) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['student'])
    const community = database.communities.find((candidate) => candidate.id === communityId)
    if (!community) throw new ServiceError('Community not found.', 'NOT_FOUND')
    const index = database.memberships.findIndex((item) => item.communityId === communityId && item.userId === actorId)
    if (index === -1) throw new ServiceError('You have not joined this community.', 'NOT_FOUND')
    database.memberships.splice(index, 1)
    community.memberCount = Math.max(0, community.memberCount - 1)
    addActivity(database, actor.fullName, 'left a community', community.name)
    writeDatabase(database)
  },

  async createEvent(actorId: string, input: EventInput) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['organizer', 'admin'])
    validateEvent(input)
    if (input.communityId) {
      const community = database.communities.find((candidate) => candidate.id === input.communityId)
      if (!community) throw new ServiceError('Selected community was not found.', 'NOT_FOUND')
      validateCommunityAccess(actor, input.communityId)
    }
    const now = new Date().toISOString()
    const community = database.communities.find((candidate) => candidate.id === input.communityId)
    const event: CampusEvent = {
      ...input,
      id: uniqueId('event'),
      title: input.title.trim(),
      description: input.description.trim(),
      details: input.details.trim(),
      location: input.location.trim(),
      organizerId: actor.id,
      organizerName: community?.name ?? actor.fullName,
      registrationCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    database.events.push(event)
    addActivity(database, actor.fullName, 'created an event', event.title)
    writeDatabase(database)
    return clone(event)
  },

  async updateEvent(actorId: string, eventId: string, input: EventInput) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['organizer', 'admin'])
    const event = database.events.find((candidate) => candidate.id === eventId)
    if (!event) throw new ServiceError('Event not found.', 'NOT_FOUND')
    if (actor.role !== 'admin' && event.organizerId !== actor.id) {
      throw new ServiceError('You can only edit events you created.', 'FORBIDDEN')
    }
    validateEvent(input)
    if (input.capacity < event.registrationCount) {
      throw new ServiceError(`Capacity cannot be lower than the ${event.registrationCount} active registrations.`, 'CONFLICT')
    }
    if (input.communityId) validateCommunityAccess(actor, input.communityId)
    const community = database.communities.find((candidate) => candidate.id === input.communityId)
    Object.assign(event, {
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
      details: input.details.trim(),
      location: input.location.trim(),
      organizerName: community?.name ?? event.organizerName,
      updatedAt: new Date().toISOString(),
    })
    addActivity(database, actor.fullName, 'updated an event', event.title)
    writeDatabase(database)
    return clone(event)
  },

  async setAttendance(actorId: string, eventId: string, userId: string, attendance: AttendanceStatus) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['organizer', 'admin'])
    const event = database.events.find((candidate) => candidate.id === eventId)
    if (!event) throw new ServiceError('Event not found.', 'NOT_FOUND')
    if (actor.role !== 'admin' && event.organizerId !== actor.id) {
      throw new ServiceError('You cannot manage registrations for this event.', 'FORBIDDEN')
    }
    const registration = database.registrations.find((item) => item.eventId === eventId && item.userId === userId && item.status === 'registered')
    if (!registration) throw new ServiceError('Registration not found.', 'NOT_FOUND')
    registration.attendance = attendance
    writeDatabase(database)
  },

  async publishAnnouncement(actorId: string, input: AnnouncementInput) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['organizer', 'admin'])
    if (input.title.trim().length < 5 || input.summary.trim().length < 15 || input.body.trim().length < 30) {
      throw new ServiceError('Add a title, summary, and complete announcement body.', 'VALIDATION')
    }
    if (actor.role === 'organizer') {
      if (input.scope !== 'community') throw new ServiceError('Organizers can publish community announcements only.', 'FORBIDDEN')
      validateCommunityAccess(actor, input.communityId)
    }
    const community = database.communities.find((candidate) => candidate.id === input.communityId)
    const announcement: Announcement = {
      ...input,
      id: uniqueId('announcement'),
      title: input.title.trim(),
      summary: input.summary.trim(),
      body: input.body.trim(),
      authorId: actor.id,
      authorName: community?.name ?? actor.fullName,
      publishedAt: new Date().toISOString(),
    }
    database.announcements.unshift(announcement)
    addActivity(database, actor.fullName, 'published an announcement', announcement.title)
    writeDatabase(database)
    return clone(announcement)
  },

  async setUserStatus(actorId: string, userId: string, status: AccountStatus) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['admin'])
    if (actorId === userId) throw new ServiceError('You cannot suspend your own administrator account.', 'CONFLICT')
    const user = database.users.find((candidate) => candidate.id === userId)
    if (!user) throw new ServiceError('User not found.', 'NOT_FOUND')
    user.status = status
    addActivity(database, actor.fullName, status === 'active' ? 'activated an account' : 'suspended an account', user.fullName)
    writeDatabase(database)
  },

  async setCommunityStatus(actorId: string, communityId: string, status: CommunityStatus) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['admin'])
    const community = database.communities.find((candidate) => candidate.id === communityId)
    if (!community) throw new ServiceError('Community not found.', 'NOT_FOUND')
    community.status = status
    addActivity(database, actor.fullName, `${status} a community`, community.name)
    writeDatabase(database)
    return clone(community)
  },

  async setContentStatus(actorId: string, contentType: 'event' | 'announcement', contentId: string, status: Extract<ContentStatus, 'published' | 'hidden'>) {
    await delay()
    const database = readDatabase()
    const actor = requireActor(database, actorId)
    requireRole(actor, ['admin'])
    const collection = contentType === 'event' ? database.events : database.announcements
    const content = collection.find((candidate) => candidate.id === contentId)
    if (!content) throw new ServiceError('Content not found.', 'NOT_FOUND')
    content.status = status
    addActivity(database, actor.fullName, `${status} ${contentType} content`, content.title)
    writeDatabase(database)
  },
}
