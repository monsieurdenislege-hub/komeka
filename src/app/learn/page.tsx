'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import WaveformAnimation from '@/components/WaveformAnimation'
import AppShell from '@/components/AppShell'

const STEPS = [
  { label: 'Accroche', icon: '🎯' },
  { label: 'Définition & Reformulation', icon: '📖' },
  { label: 'Problématique', icon: '❓' },
  { label: 'Développement I', icon: '📝' },
  { label: 'Développement II', icon: '📝' },
  { label: 'Conclusion', icon: '✅' },
]

function LearnContent() {
  const searchParams = useSearchParams()
  const [subject, setSubject] = useState(searchParams.get('subject') ?? '')
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [content, setContent] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content])

  // Detect current step from content
  useEffect(() => {
    const stepKeywords = ['ÉTAPE 1', 'ÉTAPE 2', 'ÉTAPE 3', 'ÉTAPE 4', 'ÉTAPE 5', 'ÉTAPE 6']
    let detected = 0
    stepKeywords.forEach((kw, i) => {
      if (content.includes(kw)) detected = i
    })
    setCurrentStep(detected)
  }, [content])

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/learn', {
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
        setError(data.error ?? 'Erreur')
        setLoading(false)
        return
      }

      setStarted(true)
      setStreaming(true)
      setLoading(false)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      const sentencesToSpeak: string[] = []

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

                // Collect sentences for TTS
                const sentences = accumulated.split(/(?<=[.!?])\s+/)
                const newSentences = sentences.slice(sentencesToSpeak.length, -1)
                newSentences.forEach((s) => sentencesToSpeak.push(s))
              }
            } catch { /* skip */ }
          }
        }
      }

      setStreaming(false)
      speakContent(accumulated)
    } catch (err) {
      console.error(err)
      setError('Erreur réseau')
      setLoading(false)
    }
  }

  function speakContent(text: string) {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    // Clean text for speech (remove markdown, step labels, etc.)
    const cleanText = text
      .replace(/---ÉTAPE \d+---/g, '')
      .replace(/\*\*/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[#*_]/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'fr-FR'
    utterance.rate = 0.9
    utterance.pitch = 1.0

    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices()
    const frVoice = voices.find((v) => v.lang.startsWith('fr'))
    if (frVoice) utterance.voice = frVoice

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => { setSpeaking(false); setPaused(false) }
    utterance.onerror = () => setSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  function togglePause() {
    if (!window.speechSynthesis) return
    if (paused) {
      window.speechSynthesis.resume()
      setPaused(false)
    } else {
      window.speechSynthesis.pause()
      setPaused(true)
    }
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  function formatContent(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.match(/---ÉTAPE \d+---/)) {
        return (
          <div key={i} className="mt-6 mb-3 flex items-center gap-2">
            <div className="flex-1 h-px bg-[rgba(76,175,130,0.2)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#4CAF82] px-3">
              {line.replace(/---/g, '').trim()}
            </span>
            <div className="flex-1 h-px bg-[rgba(76,175,130,0.2)]" />
          </div>
        )
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-[#F0F0F5] mt-3">{line.replace(/\*\*/g, '')}</p>
      }
      if (line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-sm text-[#E8E8F0] leading-relaxed">{line}</p>
    })
  }

  return (
    <AppShell>
      <div className="px-4 pt-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-[#9A9BB0] hover:text-[#F0F0F5]">
            <ArrowIcon />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#F0F0F5]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Apprendre à disserter
            </h1>
          </div>
          <span className="text-xs bg-[rgba(76,175,130,0.15)] text-[#4CAF82] px-2 py-0.5 rounded-full">
            🎙️ Mode vocal IA
          </span>
        </div>

        {!started ? (
          /* Input form */
          <form onSubmit={handleStart} className="flex flex-col gap-4">
            <div className="bg-[#1E2030] rounded-2xl border border-[rgba(76,175,130,0.2)] p-5">
              <p className="text-sm text-[#9A9BB0] mb-3">
                Entre un sujet et laisse Legebot t&apos;enseigner comment le traiter étape par étape, avec une voix IA.
              </p>
              <div className="bg-[#161820] rounded-xl border border-[rgba(255,255,255,0.07)] focus-within:border-[#4CAF82] transition-colors mb-4">
                <textarea
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Quel sujet veux-tu apprendre à traiter ?"
                  rows={3}
                  className="w-full bg-transparent text-[#F0F0F5] placeholder-[#9A9BB0] resize-none focus:outline-none p-4 font-mono text-sm"
                  style={{ fontFamily: "'Courier New', Courier, monospace" }}
                />
              </div>

              {error && (
                <p className="text-[#E05252] text-sm mb-3 text-center">{error}</p>
              )}

              <Button type="submit" variant="green" fullWidth size="lg" loading={loading}>
                🎙️ Démarrer la leçon vocale
              </Button>
            </div>

            <p className="text-xs text-[#9A9BB0] text-center">
              📊 1 session vocale gratuite par jour
            </p>
          </form>
        ) : (
          /* Active session */
          <div>
            {/* Waveform */}
            <div className="flex justify-center mb-4">
              <WaveformAnimation active={speaking && !paused} />
            </div>

            {/* Step progress */}
            <div className="bg-[#1E2030] rounded-xl border border-[rgba(255,255,255,0.07)] p-4 mb-4">
              <p className="text-xs text-[#9A9BB0] mb-2">
                📍 Étape {currentStep + 1} sur {STEPS.length} — {STEPS[currentStep]?.label}
              </p>
              <div className="flex gap-1.5">
                {STEPS.map((s, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: i <= currentStep ? '#4CAF82' : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                {STEPS.map((s, i) => (
                  <span key={i} className={`text-xs ${i <= currentStep ? 'text-[#4CAF82]' : 'text-[#9A9BB0]'}`}>
                    {i < currentStep ? '✅' : i === currentStep ? '🔄' : '⭕'} {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="bg-[rgba(76,175,130,0.05)] border border-[rgba(76,175,130,0.15)] rounded-xl p-3 mb-3">
              <p className="text-xs text-[#9A9BB0]">Sujet :</p>
              <p className="text-sm text-[#F0F0F5] italic" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {subject}
              </p>
            </div>

            {/* Transcription */}
            <div
              ref={contentRef}
              className="bg-[#161820] rounded-xl border-l-4 border-[#4CAF82] p-4 max-h-64 overflow-y-auto mb-4 shadow-[0_0_20px_rgba(76,175,130,0.05)]"
            >
              {formatContent(content)}
              {streaming && <span className="cursor-blink" />}
            </div>

            {/* Controls */}
            {speaking && (
              <div className="flex gap-3 justify-center mb-4">
                <button
                  onClick={togglePause}
                  className="w-12 h-12 rounded-full bg-[#1E2030] border border-[rgba(76,175,130,0.3)] flex items-center justify-center text-[#4CAF82] hover:border-[#4CAF82] transition-colors"
                >
                  {paused ? '▶' : '⏸'}
                </button>
                <button
                  onClick={stopSpeaking}
                  className="w-12 h-12 rounded-full bg-[#1E2030] border border-[rgba(224,82,82,0.3)] flex items-center justify-center text-[#E05252] hover:border-[#E05252] transition-colors"
                >
                  ⏹
                </button>
              </div>
            )}

            {!streaming && !speaking && content && (
              <Button
                variant="green"
                fullWidth
                onClick={() => { setStarted(false); setContent(''); setSubject('') }}
              >
                🔄 Recommencer avec un autre sujet
              </Button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0E0F14] flex items-center justify-center">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#4CAF82] dot-1" />
          <span className="w-3 h-3 rounded-full bg-[#4CAF82] dot-2" />
          <span className="w-3 h-3 rounded-full bg-[#4CAF82] dot-3" />
        </div>
      </div>
    }>
      <LearnContent />
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
