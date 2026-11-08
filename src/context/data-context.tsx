import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { campusService } from '@/services'
import type {
  AccountStatus,
  Announcement,
  AnnouncementInput,
  AttendanceStatus,
  CampusEvent,
  CampusSnapshot,
  CommunityStatus,
  ContentStatus,
  EventInput,
  ProfileInput,
} from '@/types'
import { useAuth } from './auth-context'
import { useToast } from './toast-context'

interface DataContextValue {
  data: CampusSnapshot | null
  loading: boolean
  pending: string | null
  reload: () => Promise<void>
  resetDemoData: () => Promise<void>
  updateProfile: (input: ProfileInput) => Promise<void>
  registerForEvent: (eventId: string) => Promise<void>
  cancelEventRegistration: (eventId: string) => Promise<void>
  joinCommunity: (communityId: string) => Promise<void>
  leaveCommunity: (communityId: string) => Promise<void>
  createEvent: (input: EventInput) => Promise<CampusEvent>
  updateEvent: (eventId: string, input: EventInput) => Promise<CampusEvent>
  setAttendance: (eventId: string, userId: string, status: AttendanceStatus) => Promise<void>
  publishAnnouncement: (input: AnnouncementInput) => Promise<Announcement>
  setUserStatus: (userId: string, status: AccountStatus) => Promise<void>
  setCommunityStatus: (communityId: string, status: CommunityStatus) => Promise<void>
  setContentStatus: (type: 'event' | 'announcement', id: string, status: Extract<ContentStatus, 'published' | 'hidden'>) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CampusSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<string | null>(null)
  const { user, syncUser } = useAuth()
  const { showToast } = useToast()

  const reload = useCallback(async () => {
    const next = await campusService.getSnapshot()
    setData(next)
  }, [])

  useEffect(() => {
    let active = true
    campusService.getSnapshot()
      .then((next) => { if (active) setData(next) })
      .catch((error) => {
        if (active) showToast({ title: 'Could not load CampusConnect', description: error instanceof Error ? error.message : 'Try refreshing the page.', tone: 'error' })
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [showToast, user?.id])

  const actorId = useCallback(() => {
    if (!user) throw new Error('Sign in to complete this action.')
    return user.id
  }, [user])

  const run = useCallback(async <T,>(key: string, action: () => Promise<T>, success: string): Promise<T> => {
    setPending(key)
    try {
      const result = await action()
      await reload()
      showToast({ title: success, tone: 'success' })
      return result
    } catch (error) {
      showToast({ title: 'Action not completed', description: error instanceof Error ? error.message : 'Please try again.', tone: 'error' })
      throw error
    } finally {
      setPending(null)
    }
  }, [reload, showToast])

  const resetDemoData = useCallback(async () => {
    setPending('reset')
    try {
      const next = await campusService.resetDemoData()
      setData(next)
      const refreshedUser = user ? next.users.find((candidate) => candidate.id === user.id) : null
      if (refreshedUser) syncUser(refreshedUser)
      showToast({ title: 'Demo data restored', description: 'Local changes were replaced with the original sample data.', tone: 'success' })
    } catch (error) {
      showToast({ title: 'Reset failed', description: error instanceof Error ? error.message : 'Please try again.', tone: 'error' })
      throw error
    } finally {
      setPending(null)
    }
  }, [showToast, syncUser, user])

  const updateProfile = useCallback(async (input: ProfileInput) => {
    const updated = await run('profile', () => campusService.updateProfile(actorId(), input), 'Profile updated')
    syncUser(updated)
  }, [actorId, run, syncUser])

  const registerForEvent = useCallback((eventId: string) =>
    run(`register:${eventId}`, () => campusService.registerForEvent(actorId(), eventId), 'You are registered'), [actorId, run])

  const cancelEventRegistration = useCallback((eventId: string) =>
    run(`cancel:${eventId}`, () => campusService.cancelEventRegistration(actorId(), eventId), 'Registration cancelled'), [actorId, run])

  const joinCommunity = useCallback((communityId: string) =>
    run(`join:${communityId}`, () => campusService.joinCommunity(actorId(), communityId), 'Community joined'), [actorId, run])

  const leaveCommunity = useCallback((communityId: string) =>
    run(`leave:${communityId}`, () => campusService.leaveCommunity(actorId(), communityId), 'You left the community'), [actorId, run])

  const createEvent = useCallback((input: EventInput) =>
    run('event:create', () => campusService.createEvent(actorId(), input), 'Event created'), [actorId, run])

  const updateEvent = useCallback((eventId: string, input: EventInput) =>
    run(`event:update:${eventId}`, () => campusService.updateEvent(actorId(), eventId, input), 'Event updated'), [actorId, run])

  const setAttendance = useCallback((eventId: string, userId: string, status: AttendanceStatus) =>
    run(`attendance:${userId}`, () => campusService.setAttendance(actorId(), eventId, userId, status), 'Attendance updated'), [actorId, run])

  const publishAnnouncement = useCallback((input: AnnouncementInput) =>
    run('announcement:create', () => campusService.publishAnnouncement(actorId(), input), 'Announcement published'), [actorId, run])

  const setUserStatus = useCallback((userId: string, status: AccountStatus) =>
    run(`user:${userId}`, () => campusService.setUserStatus(actorId(), userId, status), 'Account status updated'), [actorId, run])

  const setCommunityStatus = useCallback(async (communityId: string, status: CommunityStatus) => {
    await run(`community:${communityId}`, () => campusService.setCommunityStatus(actorId(), communityId, status), 'Community status updated')
  }, [actorId, run])

  const setContentStatus = useCallback((type: 'event' | 'announcement', id: string, status: Extract<ContentStatus, 'published' | 'hidden'>) =>
    run(`content:${id}`, () => campusService.setContentStatus(actorId(), type, id, status), 'Content status updated'), [actorId, run])

  const value = useMemo<DataContextValue>(() => ({
    data, loading, pending, reload, resetDemoData, updateProfile, registerForEvent, cancelEventRegistration,
    joinCommunity, leaveCommunity, createEvent, updateEvent, setAttendance, publishAnnouncement,
    setUserStatus, setCommunityStatus, setContentStatus,
  }), [data, loading, pending, reload, resetDemoData, updateProfile, registerForEvent, cancelEventRegistration, joinCommunity, leaveCommunity, createEvent, updateEvent, setAttendance, publishAnnouncement, setUserStatus, setCommunityStatus, setContentStatus])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useCampusData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useCampusData must be used inside DataProvider')
  return context
}
