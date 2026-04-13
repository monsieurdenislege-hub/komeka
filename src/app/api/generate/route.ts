import { getEssaySystemPrompt, getEssayUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

// Extend Vercel function timeout to 60s
export const maxDuration = 60

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.2-1b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'microsoft/phi-3-medium-128k-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'huggingfaceh4/zephyr-7b-beta:free',
  'openchat/openchat-7b:free',
  'deepseek/deepseek-r1-distill-qwen-7b:free',
  'nousresearch/nous-capybara-7b:free',
]

export async function POST(req: NextRequest) {
  const { subject } = await req.json()
  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Sujet requis' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey.startsWith('placeholder')) {
    return NextResponse.json({
      error: 'Clé API manquante — ajoutez OPENROUTER_API_KEY dans Vercel → Settings → Environment Variables'
    }, { status: 500 })
  }

  const messages = [
    { role: 'system' as const, content: getEssaySystemPrompt() },
    { role: 'user' as const, content: getEssayUserPrompt(subject) },
  ]

  // Try each model until one works
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
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 3000,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(`Model ${model} failed (${response.status}):`, errText)
        continue // Try next model
      }

      // Stream directly to client
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
          'Transfer-Encoding': 'chunked',
        },
      })
    } catch (err) {
      console.error(`Model ${model} threw:`, err)
      continue // Try next model
    }
  }

  return NextResponse.json({
    error: 'Tous les modèles IA sont indisponibles. Réessayez dans quelques instants.'
  }, { status: 503 })
}
