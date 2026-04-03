'use client'

import Link from 'next/link'
import { UserProfile, Essay } from '@/types'
import AppShell from '@/components/AppShell'

interface Props {
  profile: UserProfile | null
  usage: { generation_count: number; learning_count: number }
  recentEssays: Partial<Essay>[]
}

export default function ProfileClient({ profile, usage, recentEssays }: Props) {
  const FREE_GEN_LIMIT = 2
  const FREE_LEARN_LIMIT = 1

  return (
    <AppShell>
      <div className="px-4 pt-12">
        {/* Profile header */}
        <div className="bg-[#1E2030] rounded-2xl border border-[rgba(255,255,255,0.07)] p-6 mb-4 text-center">
          <div className="w-20 h-20 rounded-full bg-[rgba(245,166,35,0.15)] border-2 border-[rgba(245,166,35,0.3)] flex items-center justify-center text-[#F5A623] font-bold text-2xl mx-auto mb-3">
            👤
          </div>
          <h2 className="text-lg font-bold text-[#F0F0F5]">Utilisateur Démo</h2>
          <p className="text-[#9A9BB0] text-sm">demo@legebot.cd</p>
          <div className="mt-2 inline-block">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-[rgba(255,255,255,0.07)] text-[#9A9BB0] border border-[rgba(255,255,255,0.1)]">
              Plan Gratuit
            </span>
          </div>
        </div>

        {/* Usage stats */}
        <div className="bg-[#1E2030] rounded-xl border border-[rgba(255,255,255,0.07)] p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9BB0] mb-3">
            Utilisation aujourd&apos;hui
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#F0F0F5]">Dissertations générées</span>
                <span className="text-[#F5A623]">{usage.generation_count}/{FREE_GEN_LIMIT}</span>
              </div>
              <div className="h-2 bg-[rgba(255,255,255,0.07)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5A623] rounded-full transition-all duration-700"
                  style={{ width: `${(usage.generation_count / FREE_GEN_LIMIT) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#F0F0F5]">Leçons vocales</span>
                <span className="text-[#4CAF82]">{usage.learning_count}/{FREE_LEARN_LIMIT}</span>
              </div>
              <div className="h-2 bg-[rgba(255,255,255,0.07)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4CAF82] rounded-full transition-all duration-700"
                  style={{ width: `${(usage.learning_count / FREE_LEARN_LIMIT) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-[#1E2030] rounded-xl border border-[rgba(255,255,255,0.07)] overflow-hidden mb-4">
          <SettingItem href="/subscription" label="Mon abonnement" icon="💳" />
          <SettingItem href="#" label="Notifications" icon="🔔" />
          <SettingItem href="#" label="Langue" icon="🌍" value="Français" />
          <SettingItem href="#" label="Conditions d'utilisation" icon="📄" />
        </div>

        <div className="bg-[rgba(245,166,35,0.05)] border border-[rgba(245,166,35,0.1)] rounded-xl p-4 mb-8 text-center">
          <p className="text-xs text-[#9A9BB0]">
            🔒 Authentification désactivée — Mode démo actif
          </p>
          <Link href="/subscription" className="text-xs text-[#F5A623] hover:underline mt-1 block">
            Voir les abonnements →
          </Link>
        </div>
      </div>
    </AppShell>
  )
}

function SettingItem({ href, label, icon, value }: { href: string; label: string; icon: string; value?: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <div className="flex items-center gap-3">
          <span>{icon}</span>
          <span className="text-sm text-[#F0F0F5]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {value && <span className="text-xs text-[#9A9BB0]">{value}</span>}
          <span className="text-[#9A9BB0]">›</span>
        </div>
      </div>
    </Link>
  )
}
