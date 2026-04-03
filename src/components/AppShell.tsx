'use client'

import Navbar from './Navbar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0E0F14] flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full pb-20">
        {children}
      </main>
      <Navbar />
    </div>
  )
}
