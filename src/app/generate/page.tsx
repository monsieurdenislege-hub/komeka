'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

function GenerateContent() {
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') ?? ''
  const router = useRouter()

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!subject) { router.push('/dashboard'); return }
    startGeneration()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject])

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight
    }
  }, [content])

  async function startGeneration() {
    setLoading(true)
    setContent('')
    setDone(false)
    setError('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      })

      if (res.status === 429) {
        router.push('/subscription?reason=quota')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erreur de génération')
        setLoading(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const text = parsed.choices?.[0]?.delta?.content
              if (text) {
                accumulated += text
                setContent(accumulated)
              }
            } catch { /* skip */ }
          }
        }
      }

      setDone(true)
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!content || saved) return
    try {
      await fetch('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content, type: 'generated' }),
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function formatEssayContent(text: string) {
    const sections = ['INTRODUCTION', 'DÉVELOPPEMENT', 'PARTIE I', 'PARTIE II', 'PARTIE III', 'CONCLUSION', 'TRANSITION']
    const lines = text.split('\n')

    return lines.map((line, i) => {
      const upper = line.trim().toUpperCase()
      const isSection = sections.some((s) => upper.includes(s))
      const isBold = line.startsWith('**') && line.endsWith('**')

      if (isSection && line.trim().length > 0) {
        return (
          <div key={i} className="mt-6 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5A623] border-b border-[rgba(245,166,35,0.3)] pb-1">
              {line.trim().replace(/\*\*/g, '')}
            </span>
          </div>
        )
      }

      if (isBold) {
        return (
          <p key={i} className="font-semibold text-[#F0F0F5] mt-3 mb-1">
            {line.replace(/\*\*/g, '')}
          </p>
        )
      }

      if (line.trim() === '') return <div key={i} className="h-2" />

      return (
        <p key={i} className="text-[#E8E8F0] leading-relaxed">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="min-h-screen bg-[#0E0F14] flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-[rgba(255,255,255,0.07)]">
        <Link href="/dashboard" className="text-[#9A9BB0] hover:text-[#F0F0F5] transition-colors">
          <ArrowIcon />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-[#F0F0F5]">
            {loading ? 'Rédaction en cours...' : done ? 'Dissertation générée ✅' : 'Rédaction'}
          </h1>
        </div>
        {loading && (
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] dot-1" />
            <span className="w-2 h-2 rounded-full bg-[#F5A623] dot-2" />
            <span className="w-2 h-2 rounded-full bg-[#F5A623] dot-3" />
          </div>
        )}
      </div>

      {/* Subject card */}
      <div className="mx-4 mt-4">
        <div className="bg-[#1E2030] rounded-xl border border-[rgba(245,166,35,0.3)] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9BB0] mb-1">Sujet</p>
          <p className="text-[#F0F0F5] font-mono text-sm italic" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            {subject}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] rounded-xl p-4">
          <p className="text-[#E05252] text-sm">{error}</p>
          <button onClick={startGeneration} className="text-[#F5A623] text-sm mt-2 hover:underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Essay content */}
      {(content || loading) && (
        <div className="mx-4 mt-4 flex-1">
          <div
            ref={textRef}
            className="bg-[#161820] rounded-xl border-l-4 border-[#6C8EF5] p-5 shadow-[0_0_20px_rgba(108,142,245,0.08)] max-h-[60vh] overflow-y-auto"
          >
            <div
              className="text-sm leading-7"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              {formatEssayContent(content)}
              {loading && <span className="cursor-blink" />}
            </div>
          </div>

          {/* EXETAT note */}
          <p className="text-xs text-[#9A9BB0] text-center mt-2">
            ✅ Respecte les normes EXETAT RDC · Introduction · Problématique · Développement · Conclusion
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && !content && (
        <div className="flex flex-col items-center justify-center flex-1 py-16">
          <div className="flex gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-1" />
            <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-2" />
            <span className="w-3 h-3 rounded-full bg-[#F5A623] dot-3" />
          </div>
          <p className="text-[#9A9BB0] text-sm">Legebot réfléchit...</p>
        </div>
      )}

      {/* Actions */}
      {done && (
        <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.07)] flex gap-3">
          <Button
            variant="secondary"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? '✅ Copié !' : '📋 Copier'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saved}
            className="flex-1"
          >
            {saved ? '✅ Sauvegardé' : '💾 Sauvegarder'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function GeneratePage() {
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
      <GenerateContent />
    </Suspense>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
