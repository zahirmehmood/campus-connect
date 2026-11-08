import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().trim().min(4).max(100),
  description: z.string().trim().min(20).max(240),
  details: z.string().trim().min(40).max(10_000),
  communityId: z.string().min(1).optional(),
  category: z.enum(['Technology', 'Hackathons', 'Workshops', 'Career Development', 'Entrepreneurship', 'Cultural Events', 'Competitions']),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().trim().min(2).max(200),
  format: z.enum(['In person', 'Hybrid', 'Online']),
  capacity: z.number().int().min(1).max(10_000),
  imageUrl: z.string().url().max(2_000),
  status: z.enum(['draft', 'published']),
  featured: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
}).refine((value) => new Date(value.endAt) > new Date(value.startAt), { message: 'Event end time must be after its start time.', path: ['endAt'] })

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  department: z.string().trim().min(2).max(100),
  academicYear: z.string().trim().min(2).max(50),
  bio: z.string().trim().max(400),
  interests: z.array(z.string().trim().min(1).max(50)).max(12),
  skills: z.array(z.string().trim().min(1).max(50)).max(12),
  avatarUrl: z.string().max(2_000),
})

export const announcementSchema = z.object({
  title: z.string().trim().min(5).max(120),
  summary: z.string().trim().min(15).max(240),
  body: z.string().trim().min(30).max(20_000),
  category: z.enum(['Academic', 'Campus Life', 'Events', 'Opportunities', 'Important']),
  scope: z.enum(['campus', 'community']),
  communityId: z.string().min(1).optional(),
  priority: z.enum(['normal', 'important']),
  status: z.enum(['draft', 'published']),
}).refine((value) => value.scope !== 'community' || Boolean(value.communityId), { message: 'A community is required for a community announcement.', path: ['communityId'] })

export const attendanceSchema = z.object({ attendance: z.enum(['pending', 'attended', 'no-show']) })
export const accountStatusSchema = z.object({ status: z.enum(['active', 'suspended']) })
export const communityStatusSchema = z.object({ status: z.enum(['pending', 'approved', 'rejected']) })
export const contentStatusSchema = z.object({ status: z.enum(['published', 'hidden']) })
export const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  size: z.number().int().positive().max(5 * 1024 * 1024),
  purpose: z.enum(['profile', 'event', 'community', 'document']),
})
