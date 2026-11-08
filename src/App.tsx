import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LoadingState } from '@/components/loading-state'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { PublicLayout } from '@/layouts/public-layout'

const LandingPage = lazy(() => import('@/pages/landing-page').then((module) => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('@/pages/auth/login-page').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/register-page').then((module) => ({ default: module.RegisterPage })))
const EventsPage = lazy(() => import('@/pages/events/events-page').then((module) => ({ default: module.EventsPage })))
const EventDetailPage = lazy(() => import('@/pages/events/event-detail-page').then((module) => ({ default: module.EventDetailPage })))
const CommunitiesPage = lazy(() => import('@/pages/communities/communities-page').then((module) => ({ default: module.CommunitiesPage })))
const CommunityDetailPage = lazy(() => import('@/pages/communities/community-detail-page').then((module) => ({ default: module.CommunityDetailPage })))
const AnnouncementsPage = lazy(() => import('@/pages/announcements/announcements-page').then((module) => ({ default: module.AnnouncementsPage })))
const AnnouncementDetailPage = lazy(() => import('@/pages/announcements/announcement-detail-page').then((module) => ({ default: module.AnnouncementDetailPage })))
const ProfilePage = lazy(() => import('@/pages/profile-page').then((module) => ({ default: module.ProfilePage })))
const StudentDashboard = lazy(() => import('@/pages/student/student-dashboard').then((module) => ({ default: module.StudentDashboard })))
const MyEventsPage = lazy(() => import('@/pages/student/my-events-page').then((module) => ({ default: module.MyEventsPage })))
const MyCommunitiesPage = lazy(() => import('@/pages/student/my-communities-page').then((module) => ({ default: module.MyCommunitiesPage })))
const OrganizerDashboard = lazy(() => import('@/pages/organizer/organizer-dashboard').then((module) => ({ default: module.OrganizerDashboard })))
const OrganizerEventsPage = lazy(() => import('@/pages/organizer/organizer-events-page').then((module) => ({ default: module.OrganizerEventsPage })))
const EventFormPage = lazy(() => import('@/pages/organizer/event-form-page').then((module) => ({ default: module.EventFormPage })))
const ParticipantsPage = lazy(() => import('@/pages/organizer/participants-page').then((module) => ({ default: module.ParticipantsPage })))
const AnnouncementFormPage = lazy(() => import('@/pages/organizer/announcement-form-page').then((module) => ({ default: module.AnnouncementFormPage })))
const AdminDashboard = lazy(() => import('@/pages/admin/admin-dashboard').then((module) => ({ default: module.AdminDashboard })))
const AdminUsersPage = lazy(() => import('@/pages/admin/admin-users-page').then((module) => ({ default: module.AdminUsersPage })))
const AdminCommunitiesPage = lazy(() => import('@/pages/admin/admin-communities-page').then((module) => ({ default: module.AdminCommunitiesPage })))
const AdminContentPage = lazy(() => import('@/pages/admin/admin-content-page').then((module) => ({ default: module.AdminContentPage })))
const NotFoundPage = lazy(() => import('@/pages/not-found-page').then((module) => ({ default: module.NotFoundPage })))

export default function App() {
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" label="Opening CampusConnect…" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="communities/:id" element={<CommunityDetailPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}><Route path="profile" element={<ProfilePage />} /></Route>
        </Route>

        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="my-events" element={<MyEventsPage />} />
            <Route path="my-communities" element={<MyCommunitiesPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['organizer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="organizer" element={<OrganizerDashboard />} />
            <Route path="organizer/events" element={<OrganizerEventsPage />} />
            <Route path="organizer/events/new" element={<EventFormPage />} />
            <Route path="organizer/events/:id/edit" element={<EventFormPage />} />
            <Route path="organizer/events/:id/participants" element={<ParticipantsPage />} />
            <Route path="organizer/announcements/new" element={<AnnouncementFormPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/communities" element={<AdminCommunitiesPage />} />
            <Route path="admin/content" element={<AdminContentPage />} />
            <Route path="admin/announcements/new" element={<AnnouncementFormPage />} />
            <Route path="admin/events/:id/participants" element={<ParticipantsPage />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}><Route path="*" element={<NotFoundPage />} /></Route>
      </Routes>
    </Suspense>
  )
}
