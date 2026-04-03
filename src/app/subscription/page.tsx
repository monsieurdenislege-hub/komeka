'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SubscriptionCard from '@/components/SubscriptionCard'
import { SubscriptionPlan } from '@/types'

const PLANS: SubscriptionPlan[] = [
  {
    id: 'eleve',
    name: 'Abonnement Élève',
    emoji: '🎓',
    price: 5000,
    currency: 'CDF',
    description: '20 travaux sur toutes les fonctionnalités',
    credits: 20,
    badge: 'Idéal pour les étudiants',
  },
  {
    id: 'enseignant',
    name: 'Abonnement Enseignant',
    emoji: '👨‍🏫',
    price: 20000,
    currency: 'CDF',
    description: '1 000 travaux sur toutes les fonctionnalités',
    credits: 1000,
    badge: '⭐ Recommandé',
    featured: true,
  },
  {
    id: 'ecole',
    name: 'Abonnement École',
    emoji: '🏫',
    price: 50000,
    currency: 'CDF',
    description: 'Utilisation illimitée — valable 3 mois',
    credits: 'unlimited',
    badge: 'Pour les établissements scolaires',
  },
]

function SubscriptionContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')
  const router = useRouter()

  function handleSelect(plan: SubscriptionPlan) {
    // TODO: Integrate payment gateway (Mobile Money, etc.)
    alert(`Paiement ${plan.name} — ${plan.price.toLocaleString()} ${plan.currency}\n\nFonctionnalité de paiement à intégrer (Mobile Money, etc.)`)
  }

  return (
    <div className="min-h-screen bg-[#0E0F14] flex flex-col max-w-lg mx-auto px-4 py-12">
      {/* Lock illustration */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center shadow-[0_0_40px_rgba(245,166,35,0.1)]">
            <span className="text-4xl">📚</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#0E0F14]">
            🔒
          </div>
        </div>

        {reason === 'quota' && (
          <div className="bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.2)] rounded-xl px-4 py-2 mb-4">
            <p className="text-[#E05252] text-sm text-center font-medium">Limite atteinte</p>
          </div>
        )}

        <h1
          className="text-3xl font-bold text-[#F0F0F5] text-center mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Tu as atteint ta limite gratuite
        </h1>
        <p className="text-[#9A9BB0] text-sm text-center leading-relaxed">
          Pour continuer à utiliser Legebot, choisissez un abonnement adapté à vos besoins.
        </p>
      </div>

      {/* Plans */}
      <div className="flex flex-col gap-4 mb-8">
        {PLANS.map((plan) => (
          <SubscriptionCard key={plan.id} plan={plan} onSelect={handleSelect} />
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-[#9A9BB0] text-sm text-center hover:text-[#F0F0F5] transition-colors"
      >
        ← Retour
      </button>

      <p className="text-center text-[#9A9BB0] text-xs mt-4">
        Paiement sécurisé · Géré par Legebot
      </p>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0E0F14] flex items-center justify-center">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-1" />
          <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-2" />
          <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-3" />
        </div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  )
}
