import { createClient } from '@/lib/supabase/server'
import { callOpenRouter, MODELS } from '@/lib/openrouter'
import { getLearningSystemPrompt, getLearningUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

const FREE_LEARN_LIMIT = 1

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { subject } = await req.json()
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })
  }

  // Check quota
  const { data: profile } = await supabase
    .from('users_profile')
    .select('subscription_type, subscription_credits')
    .eq('id', user.id)
    .single()

  const isSubscribed = profile?.subscription_type !== 'free'

  if (!isSubscribed) {
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('learning_count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .single()

    if ((usage?.learning_count ?? 0) >= FREE_LEARN_LIMIT) {
      return NextResponse.json({ error: 'quota_exceeded', message: 'Limite quotidienne atteinte' }, { status: 429 })
    }

    if (usage) {
      await supabase
        .from('daily_usage')
        .update({ learning_count: usage.learning_count + 1 })
        .eq('user_id', user.id)
        .eq('usage_date', today)
    } else {
      await supabase
        .from('daily_usage')
        .insert({ user_id: user.id, usage_date: today, learning_count: 1 })
    }
  } else if (profile?.subscription_type !== 'ecole') {
    if ((profile?.subscription_credits ?? 0) <= 0) {
      return NextResponse.json({ error: 'quota_exceeded', message: 'Crédits épuisés' }, { status: 429 })
    }
    await supabase
      .from('users_profile')
      .update({ subscription_credits: profile!.subscription_credits - 1 })
      .eq('id', user.id)
  }

  try {
    const response = await callOpenRouter(
      [
        { role: 'system', content: getLearningSystemPrompt() },
        { role: 'user', content: getLearningUserPrompt(subject) },
      ],
      MODELS.learning,
      true
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Erreur IA' }, { status: 500 })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
