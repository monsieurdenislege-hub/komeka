import { getLearningSystemPrompt, getLearningUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Modèles pas chers, classés du moins cher au plus cher
const MODELS = [
  'deepseek/deepseek-chat',           // ~$0.07/M tokens — le moins cher
  'google/gemini-flash-1.5',          // ~$0.075/M tokens
  'google/gemini-flash-1.5-8b',       // encore moins cher
  'meta-llama/llama-3.1-8b-instruct', // ~$0.05/M tokens
  'mistralai/mistral-7b-instruct',    // ~$0.06/M tokens
  'anthropic/claude-haiku-4-5',       // ~$0.25/M tokens — meilleure qualité
  'openai/gpt-4o-mini',               // ~$0.15/M tokens
]

export async function POST(req: NextRequest) {
  const { subject } = await req.json()
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey.startsWith('placeholder')) {
    return NextResponse.json({ error: 'Clé API manquante — configurez OPENROUTER_API_KEY sur Vercel' }, { status: 500 })
  }

  const messages = [
    { role: 'system' as const, content: getLearningSystemPrompt() },
    { role: 'user' as const, content: getLearningUserPrompt(subject) },
  ]

  for (const model of MODELS) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://legebot.vercel.app',
          'X-Title': 'Legebot',
        },
        body: JSON.stringify({ model, messages, stream: true, temperature: 0.7, max_tokens: 3000 }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(`Model ${model} failed (${response.status}):`, errText)
        continue
      }

      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
        },
      })
    } catch (err) {
      console.error(`Model ${model} threw:`, err)
      continue
    }
  }

  return NextResponse.json({ error: 'Service IA indisponible, réessayez.' }, { status: 503 })
}
