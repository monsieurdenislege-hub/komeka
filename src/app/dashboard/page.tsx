import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await supabase
    .from('daily_usage')
    .select('generation_count, learning_count')
    .eq('user_id', user.id)
    .eq('usage_date', today)
    .single()

  return (
    <DashboardClient
      profile={profile}
      usage={usage ?? { generation_count: 0, learning_count: 0 }}
    />
  )
}
