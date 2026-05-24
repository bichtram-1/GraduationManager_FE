import { NextResponse } from 'next/server'

export function GET(req: Request) {
  const cookie = req.headers.get('cookie') || null
  return NextResponse.json({ cookie })
}
