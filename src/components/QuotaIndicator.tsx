'use client'

import Link from 'next/link'
import { GenerationLimits } from '@/types'

interface Props {
  limits: GenerationLimits
  type: 'generation' | 'learning'
}

export default function QuotaIndicator({ limits, type }: Props) {
  const quota = type === 'generation' ? limits.generation : limits.learning
  const canUse = type === 'generation' ? limits.canGenerate : limits.canLearn

  if (limits.isSubscribed) {
    return (
      <p className="text-xs text-[#4CAF82] text-center">
        ✅ Abonnement actif —{' '}
        {quota.max === Infinity ? 'illimité' : `${quota.max} crédits restants`}
      </p>
    )
  }

  if (!canUse) {
    return (
      <p className="text-xs text-[#E05252] text-center">
        ⚠️ Quota épuisé —{' '}
        <Link href="/subscription" className="underline font-medium hover:text-[#F5A623]">
          Voir les abonnements
        </Link>
      </p>
    )
  }

  const remaining = quota.max - quota.used
  return (
    <p className="text-xs text-[#F5A623] text-center">
      💡 {remaining} génération{remaining > 1 ? 's' : ''} gratuite{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} aujourd&apos;hui
    </p>
  )
}
