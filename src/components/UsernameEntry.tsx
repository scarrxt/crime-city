import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const UsernameEntry = () => {
  const phase = useGameStore((state) => state.phase)
  const setPlayerName = useGameStore((state) => state.setPlayerName)
  const [name, setName] = useState('')

  if (phase !== 'USERNAME_ENTRY') {
    return null
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/90 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b12] p-6 text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="font-display text-xl uppercase tracking-[0.3em] text-amber-200">
          Crime City
        </div>
        <div className="mt-3 text-sm text-slate-300">What's your name, Boss?</div>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter mob boss name"
          className="mt-4 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-200 focus:outline-none"
        />
        <button
          className="mt-4 w-full rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => setPlayerName(name)}
          disabled={name.trim().length === 0}
        >
          Enter the City
        </button>
      </div>
    </div>
  )
}

export default UsernameEntry
