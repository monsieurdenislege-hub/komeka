'use client'

interface WaveformAnimationProps {
  active: boolean
}

export default function WaveformAnimation({ active }: WaveformAnimationProps) {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Pulsing rings */}
      {active && (
        <>
          <div
            className="absolute w-32 h-32 rounded-full border-2 border-[#4CAF82] ring-1"
            style={{ opacity: 0.6 }}
          />
          <div
            className="absolute w-32 h-32 rounded-full border border-[#4CAF82] ring-2"
            style={{ opacity: 0.4 }}
          />
          <div
            className="absolute w-32 h-32 rounded-full border border-[#4CAF82] ring-3"
            style={{ opacity: 0.2 }}
          />
        </>
      )}

      {/* Center circle */}
      <div
        className={`
          w-20 h-20 rounded-full flex items-center justify-center z-10
          ${active
            ? 'bg-[rgba(76,175,130,0.2)] border-2 border-[#4CAF82] shadow-[0_0_30px_rgba(76,175,130,0.4)]'
            : 'bg-[#1E2030] border-2 border-[rgba(255,255,255,0.1)]'
          }
          transition-all duration-300
        `}
      >
        {/* Microphone icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={active ? '#4CAF82' : '#9A9BB0'}
          strokeWidth="1.5"
          className="w-8 h-8"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </div>
    </div>
  )
}
