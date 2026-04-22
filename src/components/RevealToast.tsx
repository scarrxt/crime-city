import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const RevealToast = () => {
  const lastToast = useGameStore((state) => state.lastToast)
  const clearToast = useGameStore((state) => state.clearToast)

  useEffect(() => {
    if (!lastToast) {
      return
    }
    const timer = window.setTimeout(() => {
      clearToast()
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [lastToast, clearToast])

  if (!lastToast) {
    return null
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-full border border-amber-200/40 bg-black/70 px-6 py-2 text-xs uppercase tracking-[0.3em] text-amber-200 shadow-[0_0_20px_rgba(255,178,59,0.35)]">
      {lastToast.text}
    </div>
  )
}

export default RevealToast
