import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'

const TIMER_SECONDS = 20

const DeploymentPanel = () => {
  const phase = useGameStore((state) => state.phase)
  const districts = useGameStore((state) => state.districts)
  const playerDeployment = useGameStore((state) => state.playerDeployment)
  const adjustDeployment = useGameStore((state) => state.adjustDeployment)
  const confirmDeployment = useGameStore((state) => state.confirmDeployment)
  const autoAssignRemaining = useGameStore((state) => state.autoAssignRemaining)

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)

  const totalUsed = useMemo(
    () => Object.values(playerDeployment).reduce((sum, value) => sum + value, 0),
    [playerDeployment],
  )
  const remaining = 7 - totalUsed
  const canConfirm = remaining === 0

  useEffect(() => {
    if (phase !== 'DEPLOYMENT') {
      return
    }

    setTimeLeft(TIMER_SECONDS)
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'DEPLOYMENT') {
      return
    }

    if (timeLeft > 0) {
      return
    }

    autoAssignRemaining()
    confirmDeployment()
  }, [timeLeft, phase, autoAssignRemaining, confirmDeployment])

  if (phase !== 'DEPLOYMENT') {
    return null
  }

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-10 w-[90vw] max-w-3xl -translate-x-1/2 rounded-2xl border border-white/10 bg-black/70 p-4 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-display text-sm uppercase tracking-[0.2em] text-amber-200">
          Operatives remaining: {remaining}
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Countdown: {timeLeft}s
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {districts.map((district) => {
          const assigned = playerDeployment[district.id] ?? 0
          return (
            <div
              key={district.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <div>
                <div className="text-sm text-slate-100">{district.name}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {'*'.repeat(district.value)}
                  {district.heat >= 3 ? ' 🔥 Hot Zone' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="h-7 w-7 rounded-full border border-white/20 text-slate-200 hover:border-amber-200"
                  onClick={() => adjustDeployment(district.id, -1)}
                >
                  -
                </button>
                <span className="w-6 text-center text-sm text-amber-200">
                  {assigned}
                </span>
                <button
                  className="h-7 w-7 rounded-full border border-white/20 text-slate-200 hover:border-amber-200"
                  onClick={() => adjustDeployment(district.id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-end">
        <button
          className="rounded-full bg-amber-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black disabled:cursor-not-allowed disabled:opacity-40"
          onClick={confirmDeployment}
          disabled={!canConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

export default DeploymentPanel
