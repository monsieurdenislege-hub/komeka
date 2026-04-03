'use client'

import { SubscriptionPlan } from '@/types'
import Button from './ui/Button'

interface SubscriptionCardProps {
  plan: SubscriptionPlan
  onSelect?: (plan: SubscriptionPlan) => void
}

export default function SubscriptionCard({ plan, onSelect }: SubscriptionCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl border p-6
        ${plan.featured
          ? 'border-[#F5A623] bg-[rgba(245,166,35,0.05)] shadow-[0_0_30px_rgba(245,166,35,0.15)]'
          : 'border-[rgba(255,255,255,0.07)] bg-[#1E2030]'
        }
      `}
    >
      {plan.badge && (
        <span className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-[#F5A623] text-[#0E0F14]">
          {plan.badge}
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-2xl mb-1">{plan.emoji}</div>
          <h3 className="font-semibold text-[#F0F0F5] text-lg">{plan.name}</h3>
          <p className="text-[#9A9BB0] text-sm mt-1">{plan.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#F5A623]">
            {plan.price.toLocaleString()} {plan.currency}
          </div>
        </div>
      </div>

      <Button
        variant={plan.featured ? 'primary' : 'outlined'}
        fullWidth
        onClick={() => onSelect?.(plan)}
      >
        Choisir ce plan
      </Button>
    </div>
  )
}
