'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { ScoreFeedback } from '@/types'
import AppShell from '@/components/AppShell'

export default function CorrectPage() {
  const [subject, setSubject] = useState('')
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<ScoreFeedback | null>(null)
  const [showAdvice, setShowAdvice] = useState(false)

  async function handleCorrect(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !essay.trim()) return

    setLoading(true)
    setError('')
    setFeedback(null)

    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, essay }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erreur de correction')
        return
      }

      setFeedback(data.feedback)
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return '#4CAF82'
    if (score >= 60) return '#F5A623'
    return '#E05252'
  }

  function getCircleDashOffset(score: number) {
    const circumference = 283 // 2 * PI * 45
    return circumference - (score / 100) * circumference
  }

  return (
    <AppShell>
      <div className="px-4 pt-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-[#9A9BB0] hover:text-[#F0F0F5]">
            <ArrowIcon />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#F0F0F5]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Correction IA
            </h1>
            <span className="text-xs bg-[rgba(76,175,130,0.15)] text-[#4CAF82] px-2 py-0.5 rounded-full">
              🔓 Gratuit &amp; illimité
            </span>
          </div>
        </div>

        {!feedback ? (
          <form onSubmit={handleCorrect} className="flex flex-col gap-4">
            <Input
              label="Ton sujet"
              placeholder="Ex : La femme est le pilier de la société"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <Textarea
              label="Ta dissertation"
              placeholder="Colle ou tape ta dissertation ici..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              rows={10}
              mono
              counter
              hint="Minimum 150 mots recommandés"
              required
            />

            {error && (
              <div className="bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] rounded-xl p-3">
                <p className="text-[#E05252] text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
              🔍 Analyser et corriger
            </Button>
          </form>
        ) : (
          <div className="fade-in">
            {/* Score card */}
            <div className="bg-[#1E2030] rounded-2xl border border-[rgba(255,255,255,0.07)] p-6 mb-4 flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke={getScoreColor(feedback.score)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={getCircleDashOffset(feedback.score)}
                    className="score-circle"
                    style={{ '--dash-offset': getCircleDashOffset(feedback.score) } as React.CSSProperties}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: getScoreColor(feedback.score) }}>
                    {feedback.score}
                  </span>
                  <span className="text-xs text-[#9A9BB0]">/100</span>
                </div>
              </div>
              <p className="text-[#F0F0F5] font-semibold text-lg">{feedback.mention}</p>
              <p className="text-[#9A9BB0] text-sm mt-1 text-center italic" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {subject}
              </p>
            </div>

            {/* Points positifs / négatifs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[rgba(76,175,130,0.07)] border border-[rgba(76,175,130,0.2)] rounded-xl p-4">
                <p className="text-xs font-bold text-[#4CAF82] uppercase tracking-wider mb-3">✅ Points positifs</p>
                <ul className="space-y-2">
                  {feedback.positifs.map((p, i) => (
                    <li key={i} className="text-xs text-[#F0F0F5] leading-snug flex gap-2">
                      <span className="text-[#4CAF82] mt-0.5">—</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[rgba(224,82,82,0.07)] border border-[rgba(224,82,82,0.2)] rounded-xl p-4">
                <p className="text-xs font-bold text-[#E05252] uppercase tracking-wider mb-3">❌ À améliorer</p>
                <ul className="space-y-2">
                  {feedback.negatifs.map((n, i) => (
                    <li key={i} className="text-xs text-[#F0F0F5] leading-snug flex gap-2">
                      <span className="text-[#E05252] mt-0.5">—</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Conseils */}
            {feedback.conseils?.length > 0 && (
              <div className="bg-[#1E2030] rounded-xl border border-[rgba(255,255,255,0.07)] overflow-hidden mb-4">
                <button
                  onClick={() => setShowAdvice(!showAdvice)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#F0F0F5] hover:bg-[rgba(255,255,255,0.03)]"
                >
                  <span>💡 Conseils personnalisés</span>
                  <span className="text-[#9A9BB0]">{showAdvice ? '▲' : '▼'}</span>
                </button>
                {showAdvice && (
                  <div className="px-4 pb-4 border-t border-[rgba(255,255,255,0.07)]">
                    <ul className="space-y-2 mt-3">
                      {feedback.conseils.map((c, i) => (
                        <li key={i} className="text-sm text-[#9A9BB0] flex gap-2">
                          <span className="text-[#F5A623]">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outlined"
              fullWidth
              onClick={() => { setFeedback(null); setSubject(''); setEssay('') }}
            >
              Corriger une autre dissertation
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
