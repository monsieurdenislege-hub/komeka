import { getCorrectionSystemPrompt, getCorrectionUserPrompt } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

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
  const { subject, essay } = await req.json()

  if (!subject?.trim() || !essay?.trim()) {
    return NextResponse.json({ error: 'Sujet et dissertation requis' }, { status: 400 })
  }
  if (essay.length < 100) {
    return NextResponse.json({ error: 'Dissertation trop courte (min. 100 caractères)' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey.startsWith('placeholder')) {
    return NextResponse.json({ error: 'Clé API manquante — configurez OPENROUTER_API_KEY sur Vercel' }, { status: 500 })
  }

  const messages = [
    { role: 'system' as const, content: getCorrectionSystemPrompt() },
    { role: 'user' as const, content: getCorrectionUserPrompt(subject, essay) },
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
        body: JSON.stringify({ model, messages, stream: false, temperature: 0.5, max_tokens: 1500 }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(`Model ${model} failed (${response.status}):`, errText)
        continue
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content ?? ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const feedback = JSON.parse(jsonMatch[0])
      return NextResponse.json({ feedback })
    } catch (err) {
      console.error(`Model ${model} threw:`, err)
      continue
    }
  }

  return NextResponse.json({ error: 'Service IA indisponible, réessayez.' }, { status: 503 })
}
