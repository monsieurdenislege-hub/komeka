'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Essay } from '@/types'
import AppShell from '@/components/AppShell'

export default function EssaysPage() {
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEssays()
  }, [])

  async function fetchEssays() {
    try {
      const res = await fetch('/api/essays')
      const data = await res.json()
      setEssays(data.essays ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteEssay(id: string) {
    if (!confirm('Supprimer cette dissertation ?')) return
    await fetch(`/api/essays?id=${id}`, { method: 'DELETE' })
    setEssays((prev) => prev.filter((e) => e.id !== id))
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'generated': return { label: '✍️ Générée', color: '#F5A623' }
      case 'corrected': return { label: '✏️ Corrigée', color: '#6C8EF5' }
      case 'learned': return { label: '📖 Apprise', color: '#4CAF82' }
      default: return { label: type, color: '#9A9BB0' }
    }
  }

  return (
    <AppShell>
      <div className="px-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#F0F0F5]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Mes dissertations
          </h1>
          <span className="text-xs text-[#9A9BB0] bg-[#1E2030] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.07)]">
            {essays.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-1" />
              <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-2" />
              <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-3" />
            </div>
          </div>
        ) : essays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-[#F0F0F5] mb-2">Aucune dissertation</h2>
            <p className="text-[#9A9BB0] text-sm mb-6">
              Génère ta première dissertation depuis l&apos;accueil
            </p>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#F5A623] text-[#0E0F14] rounded-full font-semibold text-sm hover:brightness-110 transition-all"
            >
              Commencer
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {essays.map((essay) => {
              const typeInfo = getTypeLabel(essay.type)
              return (
                <div
                  key={essay.id}
                  className="bg-[#1E2030] rounded-xl border border-[rgba(255,255,255,0.07)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm text-[#F0F0F5] italic truncate mb-1"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {essay.subject}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: typeInfo.color }}
                        >
                          {typeInfo.label}
                        </span>
                        {essay.score && (
                          <span className="text-xs text-[#9A9BB0]">
                            · Note: <span className="text-[#F5A623] font-medium">{essay.score}/100</span>
                          </span>
                        )}
                        <span className="text-xs text-[#9A9BB0]">· {formatDate(essay.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/essay/${essay.id}`}
                        className="text-xs text-[#F5A623] hover:underline font-medium px-2 py-1"
                      >
                        Voir →
                      </Link>
                      <button
                        onClick={() => deleteEssay(essay.id)}
                        className="text-xs text-[#9A9BB0] hover:text-[#E05252] transition-colors px-2 py-1"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
