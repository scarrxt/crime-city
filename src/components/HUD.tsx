import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'

const OWNER_BADGE: Record<string, { label: string; color: string }> = {
  player: { label: 'Player', color: 'bg-emerald-500/20 text-emerald-200' },
  ai: { label: 'Syndicate', color: 'bg-rose-500/20 text-rose-200' },
  neutral: { label: 'Neutral', color: 'bg-slate-500/20 text-slate-200' },
}

const HUD = () => {
  const playerName = useGameStore((state) => state.playerName)
  const aiName = useGameStore((state) => state.aiName)
  const scores = useGameStore((state) => state.scores)
  const round = useGameStore((state) => state.round)
  const phase = useGameStore((state) => state.phase)
  const selectedDistrictId = useGameStore((state) => state.selectedDistrictId)
  const districts = useGameStore((state) => state.districts)

  const selectedDistrict = useMemo(
    () => districts.find((district) => district.id === selectedDistrictId),
    [districts, selectedDistrictId],
  )

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case 'DEPLOYMENT':
        return 'DEPLOYMENT PHASE'
      case 'REVEAL':
        return 'REVEALING MOVES'
      case 'SCORING':
        return 'SCORING'
      case 'GAME_OVER':
        return 'FINAL OUTCOME'
      default:
        return 'PREPARING'
    }
  }, [phase])

  return (
    <>
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/40 px-6 py-4 text-sm uppercase tracking-[0.2em]">
        <div className="font-display text-emerald-200">
          {playerName || 'BOSS'} - {scores.player} pts
        </div>
        <div className="font-display text-slate-200">
          ROUND {round} / {phaseLabel}
        </div>
        <div className="font-display text-rose-200">{aiName} - {scores.ai} pts</div>
      </div>

      {selectedDistrict && (
        <div className="pointer-events-auto absolute right-6 top-24 z-10 w-64 rounded-xl border border-white/10 bg-black/60 p-4 text-sm text-slate-100 shadow-[0_0_24px_rgba(0,0,0,0.4)]">
          <div className="font-display text-lg text-amber-200">
            {selectedDistrict.name}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            {'*'.repeat(selectedDistrict.value)}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Owner</span>
            <span
              className={`rounded-full px-2 py-1 text-xs uppercase tracking-[0.2em] ${
                OWNER_BADGE[selectedDistrict.owner].color
              }`}
            >
              {OWNER_BADGE[selectedDistrict.owner].label}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Heat</span>
            <span className="text-amber-300">
              {selectedDistrict.heat > 0 ? '🔥'.repeat(selectedDistrict.heat) : '-'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Operatives
            </div>
            <div className="mt-1 text-xs text-slate-300">
              {phase === 'REVEAL' || phase === 'SCORING' || phase === 'GAME_OVER'
                ? `You: ${selectedDistrict.operativesThisRound.player} / Rival: ${selectedDistrict.operativesThisRound.ai}`
                : 'Hidden until reveal'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HUD
