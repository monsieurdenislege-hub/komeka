import { callOpenRouter, MODELS } from '@/lib/openrouter'
import { getEssaySystemPrompt, getEssayUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { subject } = await req.json()
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })
  }

  try {
    const response = await callOpenRouter(
      [
        { role: 'system', content: getEssaySystemPrompt() },
        { role: 'user', content: getEssayUserPrompt(subject) },
      ],
      MODELS.essay,
      true
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter error:', err)
      return NextResponse.json({ error: 'Erreur de génération IA' }, { status: 500 })
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
