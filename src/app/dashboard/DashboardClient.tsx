'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserProfile } from '@/types'
import AppShell from '@/components/AppShell'
import Button from '@/components/ui/Button'

interface Props {
  profile: UserProfile | null
  usage: { generation_count: number; learning_count: number }
}

const FREE_GEN_LIMIT = 2
const FREE_LEARN_LIMIT = 1

export default function DashboardClient({ profile, usage }: Props) {
  const [subject, setSubject] = useState('')
  const router = useRouter()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'là'
  const isSubscribed = profile?.subscription_type !== 'free'
  const genUsed = usage.generation_count
  const canGenerate = isSubscribed || genUsed < FREE_GEN_LIMIT

  function handleGenerate() {
    if (!subject.trim()) return
    if (!canGenerate) {
      router.push('/subscription')
      return
    }
    router.push(`/generate?subject=${encodeURIComponent(subject.trim())}`)
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-[#F5A623]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Legebot
        </h1>
        <div className="flex items-center gap-3">
          <button className="relative text-[#9A9BB0] hover:text-[#F0F0F5]">
            <BellIcon />
          </button>
          <Link href="/profile">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-9 h-9 rounded-full border-2 border-[rgba(245,166,35,0.3)] object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[rgba(245,166,35,0.2)] border-2 border-[rgba(245,166,35,0.3)] flex items-center justify-center text-[#F5A623] font-bold text-sm">
                {firstName[0]?.toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Hero section */}
      <div className="relative mx-4 rounded-2xl bg-gradient-to-br from-[#1E2030] to-[#0E0F14] border border-[rgba(255,255,255,0.07)] p-6 mb-6 overflow-hidden">
        {/* Constellation orb */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[rgba(245,166,35,0.07)] blur-3xl float-orb" />

        <h2 className="text-2xl font-bold text-[#F0F0F5] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Bonjour, {firstName} 👋
        </h2>
        <p className="text-[#9A9BB0] text-sm mb-5">Que veux-tu faire aujourd&apos;hui ?</p>

        {/* Main input */}
        <div className="bg-[#161820] rounded-xl border border-[rgba(255,255,255,0.07)] focus-within:border-[#F5A623] focus-within:shadow-[0_0_0_2px_rgba(245,166,35,0.1)] transition-all duration-200 mb-3">
          <textarea
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Tape ton sujet de dissertation ici..."
            rows={3}
            className="w-full bg-transparent text-[#F0F0F5] placeholder-[#9A9BB0] resize-none focus:outline-none p-4 font-mono text-sm"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate()
            }}
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleGenerate}
          disabled={!subject.trim()}
        >
          ✍️ Générer ma dissertation
        </Button>

        {/* Quota indicator */}
        <div className="mt-3 text-center">
          {!canGenerate ? (
            <Link href="/subscription" className="text-xs text-[#E05252] hover:underline">
              ⚠️ Quota épuisé — Voir les abonnements
            </Link>
          ) : isSubscribed ? (
            <p className="text-xs text-[#4CAF82]">
              ✅ Abonnement {profile?.subscription_type} actif
              {profile?.subscription_credits ? ` — ${profile.subscription_credits} crédits` : ''}
            </p>
          ) : (
            <p className="text-xs text-[#F5A623]">
              💡 {FREE_GEN_LIMIT - genUsed} génération{FREE_GEN_LIMIT - genUsed > 1 ? 's' : ''} gratuite{FREE_GEN_LIMIT - genUsed > 1 ? 's' : ''} restante{FREE_GEN_LIMIT - genUsed > 1 ? 's' : ''} aujourd&apos;hui
            </p>
          )}
        </div>
      </div>

      {/* Feature grid */}
      <div className="px-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9BB0] mb-3">
          Autres fonctionnalités
        </p>
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            href="/learn"
            emoji="📖"
            title="Apprendre à disserter"
            subtitle="Une voix IA t'enseigne étape par étape"
            accentColor="#4CAF82"
            badge="1 session/jour"
          />
          <FeatureCard
            href="/correct"
            emoji="✏️"
            title="Corriger ma dissertation"
            subtitle="Note sur 100 + points positifs et négatifs"
            accentColor="#6C8EF5"
            badge="Gratuit & illimité"
            badgeVariant="green"
          />
          <FeatureCard
            href="/subjects"
            emoji="🔎"
            title="Trouver des sujets"
            subtitle="Sujets populaires classés par catégorie"
            accentColor="#F5A623"
          />
          <FeatureCard
            href="/subscription"
            emoji="👑"
            title="Mes abonnements"
            subtitle="Élève · Enseignant · École"
            accentColor="#F5A623"
            gradient
          />
        </div>
      </div>
    </AppShell>
  )
}

interface FeatureCardProps {
  href: string
  emoji: string
  title: string
  subtitle: string
  accentColor: string
  badge?: string
  badgeVariant?: 'amber' | 'green'
  gradient?: boolean
}

function FeatureCard({ href, emoji, title, subtitle, accentColor, badge, badgeVariant = 'amber', gradient }: FeatureCardProps) {
  return (
    <Link href={href}>
      <div className="bg-[#1E2030] rounded-2xl border border-[rgba(255,255,255,0.07)] overflow-hidden hover:scale-[1.02] transition-transform duration-200 hover:border-[rgba(245,166,35,0.2)] h-full cursor-pointer">
        <div
          className="h-1"
          style={{
            background: gradient
              ? `linear-gradient(90deg, ${accentColor}, #F0B429)`
              : accentColor,
          }}
        />
        <div className="p-4">
          <div className="text-2xl mb-2">{emoji}</div>
          <p className="text-sm font-semibold text-[#F0F0F5] leading-tight">{title}</p>
          <p className="text-xs text-[#9A9BB0] mt-1 leading-snug">{subtitle}</p>
          {badge && (
            <span
              className={`inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                badgeVariant === 'green'
                  ? 'bg-[rgba(76,175,130,0.15)] text-[#4CAF82]'
                  : 'bg-[rgba(245,166,35,0.15)] text-[#F5A623]'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
