import { UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CommunityCard } from '@/components/community-card'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'

export function MyCommunitiesPage() {
  const { user } = useAuth()
  const { data, loading, pending, leaveCommunity } = useCampusData()
  const navigate = useNavigate()
  if (!user) return null
  if (loading || !data) return <LoadingState label="Loading your communities…" />
  const ids = new Set(data.memberships.filter((item) => item.userId === user.id).map((item) => item.communityId))
  const communities = data.communities.filter((item) => ids.has(item.id))
  return <div><PageHeader eyebrow="Your network" title="My communities" description="Keep up with the societies you have joined and discover their next events." actions={<Button onClick={() => navigate('/communities')}>Explore communities</Button>} />{communities.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{communities.map((community) => <CommunityCard key={community.id} community={community} joined canJoin upcomingEvents={data.events.filter((event) => event.communityId === community.id && event.status === 'published').length} pending={pending === `leave:${community.id}`} onToggle={() => void leaveCommunity(community.id).catch(() => undefined)} />)}</div> : <EmptyState icon={UsersRound} title="Your community list is empty" description="Join a student society to see it here." actionLabel="Find a community" onAction={() => navigate('/communities')} />}</div>
}
