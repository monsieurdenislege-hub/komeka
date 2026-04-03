'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const supabase = createClient()

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0E0F14] flex items-center justify-center p-4">
        <div className="bg-[#1E2030] rounded-2xl border border-[rgba(76,175,130,0.3)] p-8 max-w-md w-full text-center shadow-[0_4px_40px_rgba(0,0,0,0.5)]">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Compte créé !
          </h2>
          <p className="text-[#9A9BB0] mb-6">
            Un email de confirmation a été envoyé à <strong className="text-[#F0F0F5]">{email}</strong>.
            Vérifiez votre boîte mail pour activer votre compte.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" fullWidth>Se connecter</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0E0F14] flex items-center justify-center p-4">
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-[rgba(245,166,35,0.05)] blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#F5A623]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Legebot
          </h1>
          <p className="text-[#9A9BB0] text-sm mt-1">Créer un compte</p>
        </div>

        <div className="bg-[#1E2030] rounded-2xl border border-[rgba(255,255,255,0.07)] p-8 shadow-[0_4px_40px_rgba(0,0,0,0.5)]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#F0F0F5]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Rejoindre Legebot
            </h2>
            <p className="text-[#9A9BB0] text-sm mt-2">
              Créez votre compte gratuitement
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1a1a] rounded-full py-3 px-4 font-medium text-sm hover:bg-gray-100 transition-all duration-200 active:scale-95 disabled:opacity-60 mb-4"
          >
            {googleLoading ? 'Connexion...' : (
              <>
                <GoogleIcon />
                S&apos;inscrire avec Google
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
            <span className="text-[#9A9BB0] text-xs">ou</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Input
              placeholder="Votre nom complet"
              label="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="votre@email.com"
              label="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="••••••••"
              label="Mot de passe"
              hint="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <p className="text-[#E05252] text-sm text-center bg-[rgba(224,82,82,0.1)] rounded-lg p-3">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-[#9A9BB0] text-sm mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-[#F5A623] hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>

        <p className="text-center text-[#9A9BB0] text-xs mt-6">
          Pour les élèves et enseignants de la RDC 🇨🇩
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
