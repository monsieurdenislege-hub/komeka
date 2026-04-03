import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  accentColor?: string
  hoverable?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', accentColor, hoverable, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#1E2030] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]
        border border-[rgba(255,255,255,0.07)]
        relative overflow-hidden
        ${hoverable ? 'cursor-pointer transition-transform duration-200 hover:scale-[1.02] hover:border-[rgba(245,166,35,0.3)]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {accentColor && (
        <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      )}
      {children}
    </div>
  )
}
