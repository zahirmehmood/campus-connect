import { isMockMode } from '@/config/env'
import type { AuthService, CampusService } from './contracts'
import { mockAuthService, mockCampusService } from './mock-service'

let awsServices: Promise<{ auth: AuthService; campus: CampusService }> | undefined

function loadAwsServices() {
  awsServices ??= import('./aws-service').then((module) => ({
    auth: module.createAwsAuthService(),
    campus: module.createAwsCampusService(),
  }))
  return awsServices
}

const lazyAwsAuthService: AuthService = {
  restoreSession: async () => (await loadAwsServices()).auth.restoreSession(),
  signIn: async (email, password) => (await loadAwsServices()).auth.signIn(email, password),
  signUp: async (input) => (await loadAwsServices()).auth.signUp(input),
  confirmSignUp: async (email, code, password) => (await loadAwsServices()).auth.confirmSignUp(email, code, password),
  resendSignUpCode: async (email) => (await loadAwsServices()).auth.resendSignUpCode(email),
  signOut: async () => (await loadAwsServices()).auth.signOut(),
}

const lazyAwsCampusService: CampusService = {
  getSnapshot: async () => (await loadAwsServices()).campus.getSnapshot(),
  resetDemoData: async () => (await loadAwsServices()).campus.resetDemoData(),
  updateProfile: async (actorId, input) => (await loadAwsServices()).campus.updateProfile(actorId, input),
  registerForEvent: async (actorId, eventId) => (await loadAwsServices()).campus.registerForEvent(actorId, eventId),
  cancelEventRegistration: async (actorId, eventId) => (await loadAwsServices()).campus.cancelEventRegistration(actorId, eventId),
  joinCommunity: async (actorId, communityId) => (await loadAwsServices()).campus.joinCommunity(actorId, communityId),
  leaveCommunity: async (actorId, communityId) => (await loadAwsServices()).campus.leaveCommunity(actorId, communityId),
  createEvent: async (actorId, input) => (await loadAwsServices()).campus.createEvent(actorId, input),
  updateEvent: async (actorId, eventId, input) => (await loadAwsServices()).campus.updateEvent(actorId, eventId, input),
  setAttendance: async (actorId, eventId, userId, attendance) => (await loadAwsServices()).campus.setAttendance(actorId, eventId, userId, attendance),
  publishAnnouncement: async (actorId, input) => (await loadAwsServices()).campus.publishAnnouncement(actorId, input),
  setUserStatus: async (actorId, userId, status) => (await loadAwsServices()).campus.setUserStatus(actorId, userId, status),
  setCommunityStatus: async (actorId, communityId, status) => (await loadAwsServices()).campus.setCommunityStatus(actorId, communityId, status),
  setContentStatus: async (actorId, contentType, contentId, status) => (await loadAwsServices()).campus.setContentStatus(actorId, contentType, contentId, status),
}

export const authService = isMockMode ? mockAuthService : lazyAwsAuthService
export const campusService = isMockMode ? mockCampusService : lazyAwsCampusService
export { ServiceError } from './contracts'
