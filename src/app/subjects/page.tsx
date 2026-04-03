'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SUBJECT_CATEGORIES } from '@/lib/subjects'
import AppShell from '@/components/AppShell'

export default function SubjectsPage() {
  const [activeCategory, setActiveCategory] = useState(SUBJECT_CATEGORIES[0].id)
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)
  const router = useRouter()

  const category = SUBJECT_CATEGORIES.find((c) => c.id === activeCategory)!

  return (
    <AppShell>
      <div className="pt-12 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-6">
          <h1 className="text-xl font-bold text-[#F0F0F5]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Sujets populaires
          </h1>
          <div className="text-[#9A9BB0]">
            <SearchIcon />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {SUBJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setExpandedSubject(null) }}
              className={`
                flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${activeCategory === cat.id
                  ? 'bg-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.4)]'
                  : 'bg-[#1E2030] text-[#9A9BB0] border border-[rgba(255,255,255,0.07)] hover:text-[#F0F0F5]'
                }
              `}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Subjects list */}
        <div className="px-4 space-y-2 mt-2">
          {category.subjects.map((subject, idx) => (
            <div key={idx} className="bg-[#1E2030] rounded-xl border border-[rgba(255,255,255,0.07)] overflow-hidden">
              <button
                onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <span
                  className="text-sm text-[#F0F0F5] italic flex-1 pr-3 leading-snug"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {subject}
                </span>
                <span className={`text-[#9A9BB0] text-xs transition-transform duration-200 ${expandedSubject === subject ? 'rotate-90' : ''}`}>
                  ›
                </span>
              </button>

              {expandedSubject === subject && (
                <div className="px-4 pb-4 flex gap-2 border-t border-[rgba(255,255,255,0.05)]">
                  <button
                    onClick={() => router.push(`/generate?subject=${encodeURIComponent(subject)}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] text-[#F5A623] text-sm font-medium hover:bg-[rgba(245,166,35,0.15)] transition-colors"
                  >
                    ✍️ Générer
                  </button>
                  <button
                    onClick={() => router.push(`/learn?subject=${encodeURIComponent(subject)}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[rgba(76,175,130,0.1)] border border-[rgba(76,175,130,0.2)] text-[#4CAF82] text-sm font-medium hover:bg-[rgba(76,175,130,0.15)] transition-colors"
                  >
                    🎙️ Apprendre
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Count */}
        <p className="text-center text-xs text-[#9A9BB0] mt-4">
          {category.subjects.length} sujets dans &quot;{category.label}&quot;
        </p>
      </div>
    </AppShell>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
