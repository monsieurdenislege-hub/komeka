const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Models ordered by preference — fallback automatically if first fails
export const MODELS = {
  essay: 'meta-llama/llama-3.1-8b-instruct:free',
  correction: 'meta-llama/llama-3.1-8b-instruct:free',
  learning: 'meta-llama/llama-3.1-8b-instruct:free',
} as const

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function callOpenRouter(
  messages: ChatMessage[],
  model: string = MODELS.essay,
  stream = false
): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey === 'placeholder_openrouter_key') {
    throw new Error('CLÉ_MANQUANTE')
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://legebot.vercel.app',
      'X-Title': 'Legebot',
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 3000,
    }),
  })

  // If primary model fails, retry with fallback
  if (!response.ok && model !== 'mistralai/mistral-7b-instruct:free') {
    console.warn(`Model ${model} failed (${response.status}), trying fallback...`)
    return fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://legebot.vercel.app',
        'X-Title': 'Legebot',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages,
        stream,
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })
  }

  return response
}
