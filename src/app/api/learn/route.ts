import { callOpenRouter, MODELS } from '@/lib/openrouter'
import { getLearningSystemPrompt, getLearningUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { subject } = await req.json()
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })
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
        { role: 'system', content: getLearningSystemPrompt() },
        { role: 'user', content: getLearningUserPrompt(subject) },
      ],
      MODELS.learning,
      true
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', response.status, errText)
      return NextResponse.json({ error: 'Erreur du service IA vocal' }, { status: 500 })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Learn error:', err)
    return NextResponse.json({ error: 'Erreur réseau vers le service IA' }, { status: 500 })
  }
}
