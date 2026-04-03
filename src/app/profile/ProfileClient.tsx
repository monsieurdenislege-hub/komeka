'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, Essay } from '@/types'
import AppShell from '@/components/AppShell'
import { getSubscriptionLabel } from '@/lib/usage'

interface Props {
  profile: UserProfile | null
  usage: { generation_count: number; learning_count: number }
  recentEssays: Partial<Essay>[]
}

export default function ProfileClient({ profile, usage, recentEssays }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isSubscribed = profile?.subscription_type !== 'free'
  const subscriptionLabel = getSubscriptionLabel(profile?.subscription_type ?? 'free')

  const FREE_GEN_LIMIT = 2
  const FREE_LEARN_LIMIT = 1

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <AppShell>
      <div className="px-4 pt-12">
        {/* Profile header */}
        <div className="bg-[#1E2030] rounded-2xl border border-[rgba(255,255,255,0.07)] p-6 mb-4 text-center">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-3 border-[rgba(245,166,35,0.3)] mx-auto mb-3 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[rgba(245,166,35,0.15)] border-2 border-[rgba(245,166,35,0.3)] flex items-center justify-center text-[#F5A623] font-bold text-2xl mx-auto mb-3">
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <h2 className="text-lg font-bold text-[#F0F0F5]">{profile?.full_name ?? 'Utilisateur'}</h2>
          <p className="text-[#9A9BB0] text-sm">{profile?.email}</p>
          <div className="mt-2 inline-block">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              isSubscribed
                ? 'bg-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.3)]'
                : 'bg-[rgba(255,255,255,0.07)] text-[#9A9BB0] border border-[rgba(255,255,255,0.1)]'
            }`}>
              {subscriptionLabel}
            </span>
          </div>
        </div>

        {/* Usage stats */}
        {!isSubscribed && (
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
        )}

        {/* Recent essays */}
        {recentEssays.length > 0 && (
          <div className="bg-[#1E2030] rounded-xl border border-[rgba(255,255,255,0.07)] p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9BB0]">
                Mes dernières dissertations
              </p>
              <Link href="/essays" className="text-xs text-[#F5A623] hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="space-y-2">
              {recentEssays.map((essay) => (
                <Link key={essay.id} href={`/essay/${essay.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] -mx-1 px-1 rounded">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm text-[#F0F0F5] italic truncate"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {essay.subject}
                      </p>
                      <p className="text-xs text-[#9A9BB0]">{essay.created_at ? formatDate(essay.created_at) : ''}</p>
                    </div>
                    <span className="text-[#F5A623] text-sm ml-2">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-[#1E2030] rounded-xl border border-[rgba(255,255,255,0.07)] overflow-hidden mb-4">
          <SettingItem href="/subscription" label="Mon abonnement" icon="💳" />
          <SettingItem href="#" label="Notifications" icon="🔔" />
          <SettingItem href="#" label="Langue" icon="🌍" value="Français" />
          <SettingItem href="#" label="Conditions d'utilisation" icon="📄" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 text-[#E05252] text-sm font-medium hover:bg-[rgba(224,82,82,0.07)] rounded-xl border border-[rgba(224,82,82,0.1)] transition-all duration-200 mb-8"
        >
          Se déconnecter
        </button>
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
