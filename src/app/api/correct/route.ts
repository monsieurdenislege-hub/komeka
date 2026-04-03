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
      return NextResponse.json({ error: 'Erreur de correction IA' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse IA invalide' }, { status: 500 })
    }

    const feedback = JSON.parse(jsonMatch[0])
    return NextResponse.json({ feedback })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
