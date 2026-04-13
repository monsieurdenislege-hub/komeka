import { callOpenRouter, MODELS } from '@/lib/openrouter'
import { getCorrectionSystemPrompt, getCorrectionUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { subject, essay } = await req.json()

  if (!subject?.trim() || !essay?.trim()) {
    return NextResponse.json({ error: 'Sujet et dissertation requis' }, { status: 400 })
  }
  if (essay.length < 100) {
    return NextResponse.json({ error: 'La dissertation est trop courte (minimum 100 caractères)' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey === 'placeholder_openrouter_key') {
    return NextResponse.json({
      error: 'Clé API OpenRouter manquante dans les variables d\'environnement Vercel.'
    }, { status: 500 })
  }

  try {
    const response = await callOpenRouter(
      [
        { role: 'system', content: getCorrectionSystemPrompt() },
        { role: 'user', content: getCorrectionUserPrompt(subject, essay) },
      ],
      MODELS.correction,
      false
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', response.status, errText)
      return NextResponse.json({ error: 'Erreur du service IA de correction' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse IA invalide, réessayez' }, { status: 500 })
    }

    const feedback = JSON.parse(jsonMatch[0])
    return NextResponse.json({ feedback })
  } catch (err) {
    console.error('Correct error:', err)
    return NextResponse.json({ error: 'Erreur réseau vers le service IA' }, { status: 500 })
  }
}
