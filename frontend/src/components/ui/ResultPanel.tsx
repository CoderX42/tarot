import { useCallback, useEffect, useState } from 'react'

import type { DrawResponse } from '../../types/api'
import { StardustSweep } from './StardustSweep'

type Props = {
  data: DrawResponse
  onNewDraw: () => void
}

const STAGGER_MS = 420
const HEAD_MS = 280

/**
 * 需求：依次呈现单牌解读与综合指引。
 * revealStep：0 仅标题区；1..n 逐张显示牌；n+1 显示综合指引。
 */
export function ResultPanel({ data, onNewDraw }: Props) {
  const n = data.per_card.length
  const [revealStep, setRevealStep] = useState(0)

  useEffect(() => {
    const timers: number[] = []
    let t = HEAD_MS
    for (let i = 0; i < n; i++) {
      const step = i + 1
      timers.push(window.setTimeout(() => setRevealStep(step), t))
      t += STAGGER_MS
    }
    timers.push(window.setTimeout(() => setRevealStep(n + 1), t + 320))
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [data, n])

  const saveText = useCallback(() => {
    const lines = [
      data.title,
      data.question ? `问：${data.question}` : '',
      ...data.per_card.map(
        (c) => `${c.name}（${c.orientation}）：${c.interpretation}`,
      ),
      data.synthesis,
    ].filter(Boolean)
    void navigator.clipboard.writeText(lines.join('\n\n'))
  }, [data])

  const share = useCallback(async () => {
    const text = `${data.title}\n${data.synthesis}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Stellar Tarot', text })
        return
      } catch {
        /* fall through */
      }
    }
    void navigator.clipboard.writeText(text)
  }, [data])

  const hero = data.per_card[0]

  return (
    <div className="result">
      <div className="result__bg" aria-hidden />
      <StardustSweep />
      <div className="result__panel">
        {hero ? (
          <div className="result__hero">
            <div className="result__hero-cardwrap">
              <img
                className="result__hero-img"
                src="/assets/ref/card-front-style-slice.jpg"
                alt=""
                width={220}
                height={352}
              />
              <div className="result__hero-caption">
                {hero.name}
                <span className="result__hero-ori">{hero.orientation}</span>
              </div>
            </div>
          </div>
        ) : null}
        <h2 className="result__title">{data.title}</h2>
        {data.question ? (
          <p className="result__question">「{data.question}」</p>
        ) : null}

        <div className="result__cards">
          {data.per_card.map((c, i) => (
            <article
              key={c.id + c.orientation}
              className={`result__card-block ${revealStep > i ? 'is-revealed' : ''}`}
              aria-hidden={revealStep <= i}
            >
              <h3 className="result__card-name">
                {c.name}
                <span className="result__ori">{c.orientation}</span>
              </h3>
              <p className="result__interp">{c.interpretation}</p>
            </article>
          ))}
        </div>

        <p
          className={`result__synth ${revealStep > n ? 'is-revealed' : ''}`}
          aria-hidden={revealStep <= n}
        >
          <span className="result__synth-label">综合指引</span>
          {data.synthesis}
        </p>

        <nav className="result__actions">
          <button type="button" className="result__link" onClick={onNewDraw}>
            重新抽牌
          </button>
          <button type="button" className="result__link" onClick={saveText}>
            保存解读
          </button>
          <button type="button" className="result__link" onClick={share}>
            分享
          </button>
        </nav>
      </div>
    </div>
  )
}
