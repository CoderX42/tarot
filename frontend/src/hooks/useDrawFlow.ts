import { useCallback, useState } from 'react'

import { postDraw } from '../api/client'
import type { DrawResponse } from '../types/api'

export type FlowPhase = 'landing' | 'ceremony' | 'reveal' | 'result'

export function useDrawFlow() {
  const [phase, setPhase] = useState<FlowPhase>('landing')
  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<'single' | 'three'>('single')
  const [data, setData] = useState<DrawResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const beginCeremony = useCallback(async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await postDraw({
        question: question.trim(),
        spread,
      })
      setData(res)
      setPhase('ceremony')
    } catch (e) {
      setErr(e instanceof Error ? e.message : '仪式未能开始')
    } finally {
      setLoading(false)
    }
  }, [question, spread])

  const onCeremonyEnd = useCallback(() => {
    setPhase('reveal')
  }, [])

  const onRevealEnd = useCallback(() => {
    setPhase('result')
  }, [])

  const drawAgain = useCallback(() => {
    setData(null)
    setPhase('landing')
    setErr(null)
  }, [])

  return {
    phase,
    question,
    setQuestion,
    spread,
    setSpread,
    data,
    loading,
    err,
    beginCeremony,
    onCeremonyEnd,
    onRevealEnd,
    drawAgain,
  }
}
