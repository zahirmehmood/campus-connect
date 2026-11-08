import type {
  AccountStatus,
  Announcement,
  AnnouncementInput,
  AttendanceStatus,
  CampusEvent,
  CampusSnapshot,
  Community,
  CommunityStatus,
  ContentStatus,
  EventInput,
  ProfileInput,
  RegistrationInput,
  UserProfile,
} from '@/types'

export type SignUpResult =
  | { status: 'signed-in'; user: UserProfile }
  | { status: 'confirmation-required'; email: string }

export interface AuthService {
  restoreSession(): Promise<UserProfile | null>
  signIn(email: string, password: string): Promise<UserProfile>
  signUp(input: RegistrationInput): Promise<SignUpResult>
  confirmSignUp(email: string, code: string, password: string): Promise<UserProfile>
  resendSignUpCode(email: string): Promise<void>
  signOut(): Promise<void>
}

export interface CampusService {
  getSnapshot(): Promise<CampusSnapshot>
  resetDemoData(): Promise<CampusSnapshot>
  updateProfile(actorId: string, input: ProfileInput): Promise<UserProfile>
  registerForEvent(actorId: string, eventId: string): Promise<void>
  cancelEventRegistration(actorId: string, eventId: string): Promise<void>
  joinCommunity(actorId: string, communityId: string): Promise<void>
  leaveCommunity(actorId: string, communityId: string): Promise<void>
  createEvent(actorId: string, input: EventInput): Promise<CampusEvent>
  updateEvent(actorId: string, eventId: string, input: EventInput): Promise<CampusEvent>
  setAttendance(actorId: string, eventId: string, userId: string, attendance: AttendanceStatus): Promise<void>
  publishAnnouncement(actorId: string, input: AnnouncementInput): Promise<Announcement>
  setUserStatus(actorId: string, userId: string, status: AccountStatus): Promise<void>
  setCommunityStatus(actorId: string, communityId: string, status: CommunityStatus): Promise<Community>
  setContentStatus(actorId: string, contentType: 'event' | 'announcement', contentId: string, status: Extract<ContentStatus, 'published' | 'hidden'>): Promise<void>
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'CAPACITY' | 'VALIDATION' | 'CONFIGURATION',
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}
