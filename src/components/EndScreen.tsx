import { useGameStore } from '../store/gameStore'

const EndScreen = () => {
  const phase = useGameStore((state) => state.phase)
  const winner = useGameStore((state) => state.winner)
  const scores = useGameStore((state) => state.scores)
  const title = useGameStore((state) => state.title)
  const round = useGameStore((state) => state.round)
  const playerName = useGameStore((state) => state.playerName)
  const aiName = useGameStore((state) => state.aiName)
  const resetGame = useGameStore((state) => state.resetGame)

  if (phase !== 'GAME_OVER') {
    return null
  }

  const headline =
    winner === 'player'
      ? `${playerName || 'Boss'} rules Crime City.`
      : `${aiName} seized the night.`

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b12] p-6 text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
        <div className="font-display text-xl uppercase tracking-[0.3em] text-amber-200">
          Game Over
        </div>
        <div className="mt-3 text-lg text-slate-100">{headline}</div>
        {winner === 'player' && (
          <div className="mt-2 text-sm text-emerald-200">Title earned: {title}</div>
        )}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Final Score</div>
          <div className="mt-2 text-sm">Player: {scores.player}</div>
          <div className="text-sm">{aiName}: {scores.ai}</div>
          <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
            Rounds played: {round}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="rounded-full bg-amber-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black"
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default EndScreen
