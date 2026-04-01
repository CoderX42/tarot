import './styles/tokens.css'
import './App.css'

import { SceneDraw } from './components/canvas/SceneDraw'
import { LandingPage } from './components/ui/LandingPage'
import { ResultPanel } from './components/ui/ResultPanel'
import { useDrawFlow } from './hooks/useDrawFlow'

export default function App() {
  const flow = useDrawFlow()
  const showCanvas = flow.phase === 'ceremony' || flow.phase === 'reveal'
  const primary = flow.data?.cards[0] ?? null

  return (
    <div className="app-root">
      {flow.phase === 'landing' ? (
        <LandingPage
          question={flow.question}
          onQuestion={flow.setQuestion}
          spread={flow.spread}
          onSpread={flow.setSpread}
          loading={flow.loading}
          error={flow.err}
          onBegin={() => void flow.beginCeremony()}
        />
      ) : null}

      {showCanvas && flow.data ? (
        <SceneDraw
          phase={flow.phase === 'ceremony' ? 'ceremony' : 'reveal'}
          primary={primary}
          onCeremonyEnd={flow.onCeremonyEnd}
          onRevealEnd={flow.onRevealEnd}
        />
      ) : null}

      {flow.phase === 'result' && flow.data ? (
        <ResultPanel
          key={flow.data.per_card.map((c) => `${c.id}-${c.orientation}`).join('|')}
          data={flow.data}
          onNewDraw={flow.drawAgain}
        />
      ) : null}
    </div>
  )
}
