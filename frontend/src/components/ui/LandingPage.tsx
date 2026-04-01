import { LandingStardust } from './LandingStardust'

type Props = {
  question: string
  onQuestion: (v: string) => void
  spread: 'single' | 'three'
  onSpread: (v: 'single' | 'three') => void
  loading: boolean
  error: string | null
  onBegin: () => void
}

export function LandingPage({
  question,
  onQuestion,
  spread,
  onSpread,
  loading,
  error,
  onBegin,
}: Props) {
  return (
    <main className="landing">
      <div className="landing__nebula" aria-hidden />
      <LandingStardust />
      <div className="landing__stars" aria-hidden />
      <div className="landing__x" aria-hidden />
      <div className="landing__x landing__x--glow" aria-hidden />

      <header className="landing__header">
        <h1 className="landing__title">Stellar Tarot</h1>
        <p className="landing__subtitle">星幕下的仪式</p>
      </header>

      <div className="landing__input-wrap">
        <span className="landing__stardust-label">星尘输入</span>
        <label className="sr-only" htmlFor="q">
          你的问题
        </label>
        <textarea
          id="q"
          className="landing__input"
          rows={3}
          placeholder="在此输入你的问题（可选）…"
          value={question}
          onChange={(e) => onQuestion(e.target.value)}
          maxLength={400}
        />
      </div>

      <div className="landing__spread" role="group" aria-label="牌阵">
        <button
          type="button"
          className={`landing__chip ${spread === 'single' ? 'is-on' : ''}`}
          onClick={() => onSpread('single')}
        >
          单牌
        </button>
        <button
          type="button"
          className={`landing__chip ${spread === 'three' ? 'is-on' : ''}`}
          onClick={() => onSpread('three')}
        >
          三牌
        </button>
      </div>

      {error ? <p className="landing__err">{error}</p> : null}

      <button
        type="button"
        className="landing__cta"
        onClick={onBegin}
        disabled={loading}
      >
        {loading ? '星轨对齐中…' : '开始仪式'}
      </button>
    </main>
  )
}
