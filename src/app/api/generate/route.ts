import { callOpenRouter, MODELS } from '@/lib/openrouter'
import { getEssaySystemPrompt, getEssayUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { subject } = await req.json()
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey === 'placeholder_openrouter_key') {
    return NextResponse.json({
      error: 'Clé API OpenRouter manquante. Ajoutez OPENROUTER_API_KEY dans les variables d\'environnement Vercel.'
    }, { status: 500 })
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
      const errText = await response.text()
      console.error('OpenRouter error:', response.status, errText)
      let errMsg = 'Erreur du service IA'
      try {
        const parsed = JSON.parse(errText)
        errMsg = parsed.error?.message || parsed.message || errMsg
      } catch { /* ignore */ }
      return NextResponse.json({ error: errMsg }, { status: 500 })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Erreur réseau vers le service IA' }, { status: 500 })
  }
}
