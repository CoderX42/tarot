import type { DrawResponse } from '../types/api'

export async function postDraw(body: {
  question?: string
  spread?: 'single' | 'three'
  count?: number
  seed?: number
}): Promise<DrawResponse> {
  const res = await fetch('/api/draw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || res.statusText)
  }
  return res.json() as Promise<DrawResponse>
}
