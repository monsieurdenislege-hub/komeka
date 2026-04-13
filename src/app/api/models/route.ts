import { NextResponse } from 'next/server'

export const maxDuration = 30

// Diagnostic endpoint: fetches available free models from OpenRouter
// Visit /api/models to see which models your API key can use
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey.startsWith('placeholder')) {
    return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 })
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: text, status: response.status }, { status: 502 })
    }

    const data = await response.json()
    const models = data.data ?? []

    // Return all models, highlighting free ones
    const free = models
      .filter((m: { id: string; pricing?: { prompt: string } }) =>
        m.id.endsWith(':free') ||
        m.pricing?.prompt === '0' ||
        m.pricing?.prompt === '0.0'
      )
      .map((m: { id: string; name?: string; pricing?: { prompt: string; completion: string } }) => ({
        id: m.id,
        name: m.name,
        pricing: m.pricing,
      }))

    return NextResponse.json({ total: models.length, free_count: free.length, free_models: free })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
