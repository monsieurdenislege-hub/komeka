import { callOpenRouter, MODELS } from '@/lib/openrouter'
import { getLearningSystemPrompt, getLearningUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { subject } = await req.json()

  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })
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
      return NextResponse.json({ error: 'Erreur IA' }, { status: 500 })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
