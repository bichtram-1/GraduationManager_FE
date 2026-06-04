import { NextResponse } from 'next/server'

type Stored = Record<string, any>

// Simple in-memory store for dev/mock purposes. Resets when server restarts.
const store: Stored = {}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const group = url.searchParams.get('group')
  if (!group) return NextResponse.json({ error: 'missing group param' }, { status: 400 })
  const data = store[group] ?? { rows: null }
  return NextResponse.json({ ok: true, data })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { group, rows } = body
    if (!group) return NextResponse.json({ error: 'missing group' }, { status: 400 })
    store[group] = { rows, updatedAt: new Date().toISOString() }
    return NextResponse.json({ ok: true, stored: store[group] })
  } catch (err) {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
}
