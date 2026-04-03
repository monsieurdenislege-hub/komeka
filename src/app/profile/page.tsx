import ProfileClient from './ProfileClient'

export default function ProfilePage() {
  return (
    <ProfileClient
      profile={null}
      usage={{ generation_count: 0, learning_count: 0 }}
      recentEssays={[]}
    />
  )
}
