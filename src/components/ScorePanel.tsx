import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'

const ScorePanel = () => {
  const phase = useGameStore((state) => state.phase)
  const roundSummary = useGameStore((state) => state.roundSummary)
  const scores = useGameStore((state) => state.scores)
  const aiFlavorText = useGameStore((state) => state.aiFlavorText)
  const nextRound = useGameStore((state) => state.nextRound)

  const changes = useMemo(
    () => roundSummary?.changes ?? [],
    [roundSummary],
  )

  if (phase !== 'SCORING' || !roundSummary) {
    return null
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b0b12] p-6 text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="font-display text-lg uppercase tracking-[0.3em] text-amber-200">
          Round Summary
        </div>
        <div className="mt-2 text-sm text-slate-300">{aiFlavorText}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Territory</div>
            <ul className="mt-2 space-y-1 text-sm">
              {changes.length === 0 && <li>No territory changes.</li>}
              {changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Points Earned</div>
            <div className="mt-2 text-sm">
              Player: +{roundSummary.playerRoundPoints} (bonus {roundSummary.dominanceBonus + roundSummary.flipBonus})
            </div>
            <div className="text-sm">Syndicate: +{roundSummary.aiRoundPoints}</div>
            <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">Totals</div>
            <div className="mt-1 text-sm">Player: {scores.player}</div>
            <div className="text-sm">Syndicate: {scores.ai}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="rounded-full bg-amber-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black"
            onClick={nextRound}
          >
            Next Round
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScorePanel
