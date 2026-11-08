import { Amplify } from 'aws-amplify'
import { confirmSignUp as confirmCognitoSignUp, fetchAuthSession, getCurrentUser, resendSignUpCode, signIn, signOut, signUp } from 'aws-amplify/auth'
import { assertAwsConfiguration, env } from '@/config/env'
import type {
  AccountStatus,
  AnnouncementInput,
  AttendanceStatus,
  CommunityStatus,
  ContentStatus,
  EventInput,
  ProfileInput,
  RegistrationInput,
  UserProfile,
} from '@/types'
import { ServiceError, type AuthService, type CampusService } from './contracts'

let configured = false

function configureAmplify() {
  if (configured) return
  assertAwsConfiguration()
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: env.userPoolId,
        userPoolClientId: env.userPoolClientId,
        loginWith: { email: true },
      },
    },
  })
  configured = true
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  configureAmplify()
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken.toString()
  if (!token) throw new ServiceError('Your session has expired. Please sign in again.', 'UNAUTHORIZED')

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })
  const payload = await response.json().catch(() => ({})) as { message?: string } & T
  if (!response.ok) {
    const code = response.status === 401 ? 'UNAUTHORIZED'
      : response.status === 403 ? 'FORBIDDEN'
        : response.status === 404 ? 'NOT_FOUND'
          : response.status === 409 ? 'CONFLICT'
            : 'VALIDATION'
    throw new ServiceError(payload.message ?? 'The request could not be completed.', code)
  }
  return payload
}

async function publicApiRequest<T>(path: string): Promise<T> {
  configureAmplify()
  const response = await fetch(`${env.apiBaseUrl}${path}`, { headers: { 'Content-Type': 'application/json' } })
  const payload = await response.json().catch(() => ({})) as { message?: string } & T
  if (!response.ok) throw new ServiceError(payload.message ?? 'The request could not be completed.', response.status === 404 ? 'NOT_FOUND' : 'CONFIGURATION')
  return payload
}

const body = (value: unknown): Pick<RequestInit, 'body'> => ({ body: JSON.stringify(value) })

export function createAwsAuthService(): AuthService {
  configureAmplify()
  return {
    async restoreSession() {
      try {
        await getCurrentUser()
        return apiRequest<UserProfile>('/me')
      } catch {
        return null
      }
    },
    async signIn(email, password) {
      const result = await signIn({ username: email.trim().toLowerCase(), password })
      if (!result.isSignedIn) throw new ServiceError('Additional sign-in verification is required.', 'UNAUTHORIZED')
      return apiRequest<UserProfile>('/me')
    },
    async signUp(input: RegistrationInput) {
      const email = input.email.trim().toLowerCase()
      const result = await signUp({
        username: email,
        password: input.password,
        options: {
          userAttributes: {
            email,
            name: input.fullName,
            'custom:department': input.department,
            'custom:academicYear': input.academicYear,
          },
          autoSignIn: true,
        },
      })
      if (!result.isSignUpComplete) {
        return { status: 'confirmation-required', email } as const
      }
      const user = await apiRequest<UserProfile>('/me')
      return { status: 'signed-in', user } as const
    },
    async confirmSignUp(email, code, password) {
      await confirmCognitoSignUp({ username: email.trim().toLowerCase(), confirmationCode: code.trim() })
      const result = await signIn({ username: email.trim().toLowerCase(), password })
      if (!result.isSignedIn) throw new ServiceError('Your email is confirmed, but sign-in requires another verification step.', 'UNAUTHORIZED')
      return apiRequest<UserProfile>('/me')
    },
    async resendSignUpCode(email) {
      await resendSignUpCode({ username: email.trim().toLowerCase() })
    },
    async signOut() {
      await signOut()
    },
  }
}

export function createAwsCampusService(): CampusService {
  configureAmplify()
  return {
    getSnapshot: async () => {
      try {
        const session = await fetchAuthSession()
        if (session.tokens?.accessToken) return apiRequest('/bootstrap')
      } catch { /* A public visitor has no Cognito session. */ }
      return publicApiRequest('/public/bootstrap')
    },
    resetDemoData: async () => { throw new ServiceError('Demo reset is available only in mock mode.', 'FORBIDDEN') },
    updateProfile: (_actorId: string, input: ProfileInput) => apiRequest('/me', { method: 'PUT', ...body(input) }),
    registerForEvent: (_actorId: string, eventId: string) => apiRequest(`/events/${eventId}/registrations`, { method: 'POST' }),
    cancelEventRegistration: (_actorId: string, eventId: string) => apiRequest(`/events/${eventId}/registrations/me`, { method: 'DELETE' }),
    joinCommunity: (_actorId: string, communityId: string) => apiRequest(`/communities/${communityId}/memberships`, { method: 'POST' }),
    leaveCommunity: (_actorId: string, communityId: string) => apiRequest(`/communities/${communityId}/memberships/me`, { method: 'DELETE' }),
    createEvent: (_actorId: string, input: EventInput) => apiRequest('/events', { method: 'POST', ...body(input) }),
    updateEvent: (_actorId: string, eventId: string, input: EventInput) => apiRequest(`/events/${eventId}`, { method: 'PUT', ...body(input) }),
    setAttendance: (_actorId: string, eventId: string, userId: string, attendance: AttendanceStatus) => apiRequest(`/events/${eventId}/registrations/${userId}`, { method: 'PATCH', ...body({ attendance }) }),
    publishAnnouncement: (_actorId: string, input: AnnouncementInput) => apiRequest('/announcements', { method: 'POST', ...body(input) }),
    setUserStatus: (_actorId: string, userId: string, status: AccountStatus) => apiRequest(`/admin/users/${userId}`, { method: 'PATCH', ...body({ status }) }),
    setCommunityStatus: (_actorId: string, communityId: string, status: CommunityStatus) => apiRequest(`/admin/communities/${communityId}`, { method: 'PATCH', ...body({ status }) }),
    setContentStatus: (_actorId: string, contentType: 'event' | 'announcement', contentId: string, status: Extract<ContentStatus, 'published' | 'hidden'>) => apiRequest(`/admin/content/${contentType}/${contentId}`, { method: 'PATCH', ...body({ status }) }),
  }
}
