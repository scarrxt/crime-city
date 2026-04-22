import { useEffect } from 'react'
import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import DeploymentPanel from './components/DeploymentPanel'
import RevealToast from './components/RevealToast'
import ScorePanel from './components/ScorePanel'
import EndScreen from './components/EndScreen'
import UsernameEntry from './components/UsernameEntry'
import { useGameStore } from './store/gameStore'

const App = () => {
  const phase = useGameStore((state) => state.phase)
  const round = useGameStore((state) => state.round)
  const beginDeployment = useGameStore((state) => state.beginDeployment)
  const revealIndex = useGameStore((state) => state.revealIndex)
  const roundResults = useGameStore((state) => state.roundResults)
  const applyRevealStep = useGameStore((state) => state.applyRevealStep)
  const finishReveal = useGameStore((state) => state.finishReveal)

  useEffect(() => {
    if (phase !== 'ROUND_START') {
      return
    }
    const timer = window.setTimeout(() => {
      beginDeployment()
    }, 700)
    return () => window.clearTimeout(timer)
  }, [phase, beginDeployment])

  useEffect(() => {
    if (phase !== 'REVEAL') {
      return
    }
    if (revealIndex < roundResults.length) {
      const timer = window.setTimeout(() => {
        applyRevealStep()
      }, 400)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => {
      finishReveal()
    }, 500)
    return () => window.clearTimeout(timer)
  }, [phase, revealIndex, roundResults.length, applyRevealStep, finishReveal])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0b0b12] font-noir text-slate-100">
      <GameCanvas />
      <HUD />
      <DeploymentPanel />
      <RevealToast />
      <ScorePanel />
      <EndScreen />
      <UsernameEntry />
      {phase === 'ROUND_START' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full border border-amber-200/40 bg-black/70 px-8 py-3 text-xs uppercase tracking-[0.4em] text-amber-200">
            ROUND {round}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
