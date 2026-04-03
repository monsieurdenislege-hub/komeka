import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  return (
    <DashboardClient
      profile={null}
      usage={{ generation_count: 0, learning_count: 0 }}
    />
  )
}
