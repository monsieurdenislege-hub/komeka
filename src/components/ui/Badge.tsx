interface BadgeProps {
  children: React.ReactNode
  variant?: 'amber' | 'green' | 'blue' | 'danger' | 'default'
  size?: 'sm' | 'md'
}

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    amber: 'bg-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.3)]',
    green: 'bg-[rgba(76,175,130,0.15)] text-[#4CAF82] border border-[rgba(76,175,130,0.3)]',
    blue: 'bg-[rgba(108,142,245,0.15)] text-[#6C8EF5] border border-[rgba(108,142,245,0.3)]',
    danger: 'bg-[rgba(224,82,82,0.15)] text-[#E05252] border border-[rgba(224,82,82,0.3)]',
    default: 'bg-[rgba(255,255,255,0.07)] text-[#9A9BB0] border border-[rgba(255,255,255,0.1)]',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
