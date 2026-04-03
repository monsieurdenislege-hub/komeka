import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EssayViewerClient from './EssayViewerClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EssayViewerPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: essay } = await supabase
    .from('essays')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!essay) notFound()

  return <EssayViewerClient essay={essay} />
}
