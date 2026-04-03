import { createClient } from '@/lib/supabase/client'
import { UserProfile, GenerationLimits } from '@/types'

const FREE_GENERATION_LIMIT = 2
const FREE_LEARNING_LIMIT = 1

export async function getUsageLimits(profile: UserProfile | null): Promise<GenerationLimits> {
  if (!profile) {
    return {
      generation: { used: 0, max: FREE_GENERATION_LIMIT },
      learning: { used: 0, max: FREE_LEARNING_LIMIT },
      canGenerate: false,
      canLearn: false,
      isSubscribed: false,
    }
  }

  const supabase = createClient()

  // Subscribed users (non-free)
  if (profile.subscription_type !== 'free') {
    // École = unlimited for 3 months
    if (profile.subscription_type === 'ecole') {
      const expired = profile.subscription_expires_at
        ? new Date(profile.subscription_expires_at) < new Date()
        : true
      if (!expired) {
        return {
          generation: { used: 0, max: Infinity },
          learning: { used: 0, max: Infinity },
          canGenerate: true,
          canLearn: true,
          isSubscribed: true,
        }
      }
    }

    // Élève & Enseignant = credit-based
    const credits = profile.subscription_credits ?? 0
    const expired = profile.subscription_expires_at
      ? new Date(profile.subscription_expires_at) < new Date()
      : false

    if (credits > 0 && !expired) {
      return {
        generation: { used: 0, max: credits },
        learning: { used: 0, max: credits },
        canGenerate: true,
        canLearn: true,
        isSubscribed: true,
      }
    }
  }

  // Free user — check daily usage
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await supabase
    .from('daily_usage')
    .select('generation_count, learning_count')
    .eq('user_id', profile.id)
    .eq('usage_date', today)
    .single()

  const genUsed = usage?.generation_count ?? 0
  const learnUsed = usage?.learning_count ?? 0

  return {
    generation: { used: genUsed, max: FREE_GENERATION_LIMIT },
    learning: { used: learnUsed, max: FREE_LEARNING_LIMIT },
    canGenerate: genUsed < FREE_GENERATION_LIMIT,
    canLearn: learnUsed < FREE_LEARNING_LIMIT,
    isSubscribed: false,
  }
}

export async function incrementUsage(
  userId: string,
  type: 'generation' | 'learning'
): Promise<void> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const field = type === 'generation' ? 'generation_count' : 'learning_count'

  const { data: existing } = await supabase
    .from('daily_usage')
    .select('id, generation_count, learning_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single()

  if (existing) {
    await supabase
      .from('daily_usage')
      .update({ [field]: (existing[field as keyof typeof existing] as number) + 1 })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('daily_usage')
      .insert({ user_id: userId, usage_date: today, [field]: 1 })
  }
}

export async function decrementSubscriptionCredit(userId: string): Promise<void> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('users_profile')
    .select('subscription_credits')
    .eq('id', userId)
    .single()

  if (profile && profile.subscription_credits > 0) {
    await supabase
      .from('users_profile')
      .update({ subscription_credits: profile.subscription_credits - 1 })
      .eq('id', userId)
  }
}

export function getSubscriptionLabel(type: string): string {
  switch (type) {
    case 'eleve': return '🎓 Élève'
    case 'enseignant': return '👨‍🏫 Enseignant'
    case 'ecole': return '🏫 École'
    default: return 'Plan Gratuit'
  }
}
