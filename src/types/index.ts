export type SubscriptionType = 'free' | 'eleve' | 'enseignant' | 'ecole'

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  subscription_type: SubscriptionType
  subscription_expires_at: string | null
  subscription_credits: number
  created_at: string
  updated_at: string
}

export interface Essay {
  id: string
  user_id: string
  subject: string
  content: string
  type: 'generated' | 'corrected' | 'learned'
  score: number | null
  score_feedback: ScoreFeedback | null
  created_at: string
}

export interface ScoreFeedback {
  score: number
  mention: string
  positifs: string[]
  negatifs: string[]
  conseils: string[]
}

export interface DailyUsage {
  id: string
  user_id: string
  usage_date: string
  generation_count: number
  learning_count: number
}

export interface SubjectCategory {
  id: string
  label: string
  emoji: string
  subjects: string[]
}

export interface SubscriptionPlan {
  id: SubscriptionType
  name: string
  emoji: string
  price: number
  currency: string
  description: string
  credits: number | 'unlimited'
  badge?: string
  featured?: boolean
}

export interface GenerationLimits {
  generation: { used: number; max: number }
  learning: { used: number; max: number }
  canGenerate: boolean
  canLearn: boolean
  isSubscribed: boolean
}
