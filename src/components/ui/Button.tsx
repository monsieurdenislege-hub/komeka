'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'danger' | 'green' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 cursor-pointer select-none relative overflow-hidden'

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variants = {
    primary:
      'bg-[#F5A623] text-[#0E0F14] hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(245,166,35,0.2)]',
    secondary:
      'bg-[#1E2030] text-[#F0F0F5] border border-[rgba(255,255,255,0.1)] hover:border-[#F5A623] hover:text-[#F5A623] active:scale-95',
    outlined:
      'bg-transparent text-[#F5A623] border border-[#F5A623] hover:bg-[rgba(245,166,35,0.1)] active:scale-95',
    danger:
      'bg-[#E05252] text-white hover:brightness-110 active:scale-95',
    green:
      'bg-[#4CAF82] text-[#0E0F14] hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(76,175,130,0.2)]',
    ghost:
      'bg-transparent text-[#9A9BB0] hover:text-[#F0F0F5] active:scale-95',
  }

  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        ${base}
        ${sizes[size]}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'primary' || variant === 'green' ? 'btn-shimmer' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <span className="flex gap-1 mr-1">
          <span className="w-1.5 h-1.5 rounded-full bg-current dot-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-current dot-2" />
          <span className="w-1.5 h-1.5 rounded-full bg-current dot-3" />
        </span>
      )}
      {children}
    </button>
  )
}
