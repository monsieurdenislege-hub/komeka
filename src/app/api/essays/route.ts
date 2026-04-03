import { NextResponse } from 'next/server'

// Mode démo — pas de BDD
export async function GET() {
  return NextResponse.json({ essays: [] })
}

export async function POST() {
  return NextResponse.json({ essay: { id: 'demo', subject: '', content: '', type: 'generated', created_at: new Date().toISOString() } })
}

export async function DELETE() {
  return NextResponse.json({ success: true })
}
