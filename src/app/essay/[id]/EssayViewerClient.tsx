'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Essay } from '@/types'

interface Props {
  essay: Essay
}

export default function EssayViewerClient({ essay }: Props) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function handleCopy() {
    await navigator.clipboard.writeText(essay.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette dissertation définitivement ?')) return
    await fetch(`/api/essays?id=${essay.id}`, { method: 'DELETE' })
    router.push('/essays')
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `Dissertation : ${essay.subject}`,
        text: essay.content,
      })
    }
  }

  function formatContent(text: string) {
    const sections = ['INTRODUCTION', 'DÉVELOPPEMENT', 'PARTIE I', 'PARTIE II', 'PARTIE III', 'CONCLUSION']
    const lines = text.split('\n')

    return lines.map((line, i) => {
      const upper = line.trim().toUpperCase()
      const isSection = sections.some((s) => upper.includes(s))

      if (isSection && line.trim().length > 0) {
        return (
          <div key={i} className="mt-8 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5A623] border-b border-[rgba(245,166,35,0.4)] pb-1">
              {line.trim().replace(/\*\*/g, '')}
            </span>
          </div>
        )
      }

      if (line.trim() === '') return <div key={i} className="h-3" />

      // Highlight problématique lines (lines with question mark near end)
      const isProblematique = line.includes('?') && line.length > 50 &&
        (upper.includes('PEUT-ON') || upper.includes('DÈS LORS') || upper.includes('AINSI,') ||
         upper.includes('EN DÉFINITIVE') || upper.includes('PROBLÉMATIQUE'))

      if (isProblematique) {
        return (
          <p
            key={i}
            className="my-2 px-3 py-2 rounded-lg text-sm leading-relaxed italic font-medium"
            style={{
              background: 'rgba(245,166,35,0.08)',
              borderLeft: '3px solid #F5A623',
              fontFamily: "'Courier New', Courier, monospace",
              color: '#F0F0F5',
            }}
          >
            {line}
          </p>
        )
      }

      return (
        <p
          key={i}
          className="text-sm text-[#E8E8F0] leading-[1.9]"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {line}
        </p>
      )
    })
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#0E0F14] flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-[rgba(255,255,255,0.07)]">
        <button
          onClick={() => router.back()}
          className="text-[#9A9BB0] hover:text-[#F0F0F5] transition-colors"
        >
          <ArrowIcon />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#F0F0F5]">Dissertation sauvegardée</p>
          <p className="text-xs text-[#9A9BB0]">{formatDate(essay.created_at)}</p>
        </div>
        <button
          onClick={handleShare}
          className="text-[#9A9BB0] hover:text-[#F0F0F5] transition-colors"
        >
          <ShareIcon />
        </button>
      </div>

      {/* Subject */}
      <div className="mx-4 mt-4">
        <div className="bg-[#1E2030] rounded-xl border border-[rgba(245,166,35,0.3)] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9BB0] mb-1">Sujet</p>
          <p
            className="text-[#F0F0F5] text-sm italic"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {essay.subject}
          </p>
          {essay.score && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[#9A9BB0]">Note :</span>
              <span
                className="text-sm font-bold"
                style={{ color: essay.score >= 80 ? '#4CAF82' : essay.score >= 60 ? '#F5A623' : '#E05252' }}
              >
                {essay.score}/100
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Essay content */}
      <div className="mx-4 mt-4 flex-1">
        <div className="bg-[#161820] rounded-xl border-l-4 border-[#6C8EF5] p-5 shadow-[0_0_20px_rgba(108,142,245,0.06)]">
          {formatContent(essay.content)}
        </div>
        <p className="text-xs text-[#9A9BB0] text-center mt-3">
          ✅ Norme EXETAT RDC · Problématique surlignée en or
        </p>
      </div>

      {/* Bottom actions */}
      <div className="px-4 py-4 pb-8 border-t border-[rgba(255,255,255,0.07)] flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 py-3 rounded-full bg-[#1E2030] border border-[rgba(255,255,255,0.07)] text-sm font-medium text-[#F0F0F5] hover:border-[#F5A623] hover:text-[#F5A623] transition-all"
        >
          {copied ? '✅ Copié' : '📋 Copier'}
        </button>
        <button
          onClick={handleDelete}
          className="py-3 px-6 rounded-full bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.2)] text-[#E05252] text-sm font-medium hover:bg-[rgba(224,82,82,0.15)] transition-all"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
