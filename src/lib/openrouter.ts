const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Cheap but capable models for essay tasks
export const MODELS = {
  essay: 'google/gemma-2-9b-it:free',
  correction: 'mistralai/mistral-7b-instruct:free',
  learning: 'google/gemma-2-9b-it:free',
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
    throw new Error('OPENROUTER_API_KEY non configurée. Veuillez ajouter votre clé dans .env.local')
  }

  return fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
}

export async function streamOpenRouter(
  messages: ChatMessage[],
  model: string = MODELS.essay
): Promise<ReadableStream<string>> {
  const response = await callOpenRouter(messages, model, true)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${error}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream<string>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              controller.close()
              return
            }
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) controller.enqueue(content)
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }
    },
  })
}
