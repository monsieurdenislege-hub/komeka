'use client'

import React from 'react'

interface InputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  counter?: boolean
  mono?: boolean
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({ label, hint, error, counter, mono, className = '', ...props }: InputProps) {
  const value = props.value as string ?? ''
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-[#9A9BB0]">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`
          w-full bg-[#161820] border border-[rgba(255,255,255,0.07)] rounded-xl
          text-[#F0F0F5] placeholder-[#9A9BB0] resize-none
          focus:outline-none focus:border-[#F5A623] focus:shadow-[0_0_0_2px_rgba(245,166,35,0.1)]
          transition-all duration-200 p-4
          ${mono ? 'font-mono text-sm leading-relaxed' : 'text-base'}
          ${error ? 'border-[#E05252]' : ''}
          ${className}
        `}
      />
      <div className="flex justify-between items-center">
        {(hint || error) && (
          <span className={`text-xs ${error ? 'text-[#E05252]' : 'text-[#9A9BB0]'}`}>
            {error || hint}
          </span>
        )}
        {counter && (
          <span className="text-xs text-[#9A9BB0] ml-auto">
            {value.length} car.
          </span>
        )}
      </div>
    </div>
  )
}

export function Input({ label, hint, error, className = '', ...props }: TextInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-[#9A9BB0]">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full bg-[#161820] border border-[rgba(255,255,255,0.07)] rounded-xl
          text-[#F0F0F5] placeholder-[#9A9BB0]
          focus:outline-none focus:border-[#F5A623] focus:shadow-[0_0_0_2px_rgba(245,166,35,0.1)]
          transition-all duration-200 px-4 py-3 text-base
          ${error ? 'border-[#E05252]' : ''}
          ${className}
        `}
      />
      {(hint || error) && (
        <span className={`text-xs ${error ? 'text-[#E05252]' : 'text-[#9A9BB0]'}`}>
          {error || hint}
        </span>
      )}
    </div>
  )
}
