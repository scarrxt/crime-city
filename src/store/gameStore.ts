import { create } from 'zustand'
import {
  districtDefinitions,
  type DistrictDefinition,
  type DistrictId,
} from '../data/districts'
import {
  type AiMode,
  getAiFlavorText,
  getAiModeForRound,
  computeAiDeployment,
} from '../logic/aiLogic'
import {
  resolveRound,
  scoreRound,
  type Owner,
  type DistrictRoundResult,
} from '../logic/roundLogic'

export type Phase =
  | 'USERNAME_ENTRY'
  | 'ROUND_START'
  | 'DEPLOYMENT'
  | 'REVEAL'
  | 'SCORING'
  | 'GAME_OVER'

export interface DistrictState extends DistrictDefinition {
  owner: Owner
  heat: number
  operativesThisRound: {
    player: number
    ai: number
  }
}

interface RoundSummary {
  playerRoundPoints: number
  aiRoundPoints: number
  dominanceBonus: number
  flipBonus: number
  playerDistrictCount: number
  aiDistrictCount: number
  changes: string[]
}

interface ToastMessage {
  id: number
  text: string
}

interface GameState {
  phase: Phase
  round: number
  playerName: string
  aiName: string
  aiMode: AiMode
  aiFlavorText: string
  scores: { player: number; ai: number }
  districts: DistrictState[]
  selectedDistrictId: DistrictId | null
  hoveredDistrictId: DistrictId | null
  playerDeployment: Record<DistrictId, number>
  aiDeployment: Record<DistrictId, number>
  previousPlayerDeployment?: Record<DistrictId, number>
  revealIndex: number
  roundResults: DistrictRoundResult[]
  roundSummary: RoundSummary | null
  lastToast: ToastMessage | null
  winner: Owner | null
  title: string

  setPlayerName: (name: string) => void
  beginDeployment: () => void
  setHoveredDistrict: (id: DistrictId | null) => void
  selectDistrict: (id: DistrictId | null) => void
  adjustDeployment: (id: DistrictId, delta: number) => void
  autoAssignRemaining: () => void
  confirmDeployment: () => void
  applyRevealStep: () => void
  finishReveal: () => void
  nextRound: () => void
  resetGame: () => void
  clearToast: () => void
}

const TOTAL_OPERATIVES = 7

const buildDeployment = (): Record<DistrictId, number> =>
  Object.fromEntries(
    districtDefinitions.map((district) => [district.id, 0]),
  ) as Record<DistrictId, number>

const buildDistricts = (): DistrictState[] =>
  districtDefinitions.map((district) => ({
    ...district,
    owner: 'neutral',
    heat: 0,
    operativesThisRound: { player: 0, ai: 0 },
  }))

const getTotalDeployment = (deployment: Record<DistrictId, number>): number =>
  Object.values(deployment).reduce((sum, value) => sum + value, 0)

const updateOperativesOnDistricts = (
  districts: DistrictState[],
  playerDeployment: Record<DistrictId, number>,
  aiDeployment: Record<DistrictId, number>,
): DistrictState[] =>
  districts.map((district) => ({
    ...district,
    operativesThisRound: {
      player: playerDeployment[district.id] ?? 0,
      ai: aiDeployment[district.id] ?? 0,
    },
  }))

const updateHeat = (
  districts: DistrictState[],
  playerDeployment: Record<DistrictId, number>,
  aiDeployment: Record<DistrictId, number>,
): DistrictState[] =>
  districts.map((district) => {
    const contested =
      (playerDeployment[district.id] ?? 0) > 0 ||
      (aiDeployment[district.id] ?? 0) > 0
    const nextHeat = contested ? Math.min(5, district.heat + 1) : 0
    return { ...district, heat: nextHeat }
  })

const createToast = (text: string): ToastMessage => ({ id: Date.now(), text })

const computeTitle = (player: number, ai: number): string => {
  const margin = player - ai
  if (margin >= 5) {
    return 'The Godfather'
  }
  if (margin <= 2) {
    return 'Lucky Bastard'
  }
  return 'Crime Lord'
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'USERNAME_ENTRY',
  round: 1,
  playerName: '',
  aiName: 'THE SYNDICATE',
  aiMode: 'GREEDY',
  aiFlavorText: '',
  scores: { player: 0, ai: 0 },
  districts: buildDistricts(),
  selectedDistrictId: null,
  hoveredDistrictId: null,
  playerDeployment: buildDeployment(),
  aiDeployment: buildDeployment(),
  previousPlayerDeployment: undefined,
  revealIndex: 0,
  roundResults: [],
  roundSummary: null,
  lastToast: null,
  winner: null,
  title: '',

  setPlayerName: (name) => {
    set({
      playerName: name.trim(),
      phase: 'ROUND_START',
      round: 1,
      scores: { player: 0, ai: 0 },
      districts: buildDistricts(),
      playerDeployment: buildDeployment(),
      aiDeployment: buildDeployment(),
      previousPlayerDeployment: undefined,
      roundResults: [],
      roundSummary: null,
      winner: null,
      title: '',
      lastToast: null,
    })
  },

  beginDeployment: () => {
    set((state) => ({
      phase: 'DEPLOYMENT',
      aiMode: getAiModeForRound(state.round),
      playerDeployment: buildDeployment(),
      aiDeployment: buildDeployment(),
      districts: updateOperativesOnDistricts(
        state.districts,
        buildDeployment(),
        buildDeployment(),
      ),
      selectedDistrictId: null,
      hoveredDistrictId: null,
      roundResults: [],
      roundSummary: null,
      lastToast: null,
      revealIndex: 0,
      aiFlavorText: '',
    }))
  },

  setHoveredDistrict: (id) => set({ hoveredDistrictId: id }),
  selectDistrict: (id) => set({ selectedDistrictId: id }),

  adjustDeployment: (id, delta) => {
    const { phase } = get()
    if (phase !== 'DEPLOYMENT') {
      return
    }

    set((state) => {
      const current = state.playerDeployment[id]
      const total = getTotalDeployment(state.playerDeployment)
      const next = Math.max(0, current + delta)
      const nextTotal = total - current + next
      if (nextTotal > TOTAL_OPERATIVES) {
        return state
      }

      const playerDeployment = {
        ...state.playerDeployment,
        [id]: next,
      }
      return {
        playerDeployment,
        districts: updateOperativesOnDistricts(
          state.districts,
          playerDeployment,
          state.aiDeployment,
        ),
      }
    })
  },

  autoAssignRemaining: () => {
    const { phase } = get()
    if (phase !== 'DEPLOYMENT') {
      return
    }

    set((state) => {
      const total = getTotalDeployment(state.playerDeployment)
      let remaining = TOTAL_OPERATIVES - total
      if (remaining <= 0) {
        return state
      }

      const ordered = [...state.districts].sort((a, b) => {
        if (a.owner === 'neutral' && b.owner !== 'neutral') return -1
        if (a.owner !== 'neutral' && b.owner === 'neutral') return 1
        return b.value - a.value
      })

      const playerDeployment = { ...state.playerDeployment }
      let index = 0
      while (remaining > 0) {
        const target = ordered[index % ordered.length].id
        playerDeployment[target] += 1
        remaining -= 1
        index += 1
      }

      return {
        playerDeployment,
        districts: updateOperativesOnDistricts(
          state.districts,
          playerDeployment,
          state.aiDeployment,
        ),
      }
    })
  },

  confirmDeployment: () => {
    const { phase } = get()
    if (phase !== 'DEPLOYMENT') {
      return
    }

    set((state) => {
      const total = getTotalDeployment(state.playerDeployment)
      if (total !== TOTAL_OPERATIVES) {
        return state
      }

      const aiMode = getAiModeForRound(state.round)
      const owners = Object.fromEntries(
        state.districts.map((district) => [district.id, district.owner]),
      ) as Record<DistrictId, Owner>

      const aiDeployment = computeAiDeployment({
        round: state.round,
        mode: aiMode,
        districts: districtDefinitions,
        owners,
        previousPlayerDeployment: state.previousPlayerDeployment,
      })

      const districtsWithOps = updateOperativesOnDistricts(
        state.districts,
        state.playerDeployment,
        aiDeployment,
      )

      const { results } = resolveRound(
        districtsWithOps,
        state.playerDeployment,
        aiDeployment,
      )

      return {
        aiMode,
        aiFlavorText: getAiFlavorText(aiMode),
        aiDeployment,
        districts: districtsWithOps,
        roundResults: results,
        revealIndex: 0,
        previousPlayerDeployment: state.playerDeployment,
        phase: 'REVEAL',
      }
    })
  },

  applyRevealStep: () => {
    const { phase } = get()
    if (phase !== 'REVEAL') {
      return
    }

    set((state) => {
      const result = state.roundResults[state.revealIndex]
      if (!result) {
        return state
      }

      const districts = state.districts.map((district) => {
        if (district.id !== result.districtId) {
          return district
        }
        return {
          ...district,
          owner: result.newOwner,
        }
      })

      let toastText = `${result.districtName.toUpperCase()} HOLDS`
      if (result.newOwner === 'player' && result.previousOwner !== 'player') {
        toastText = `${state.playerName || 'PLAYER'} WINS ${result.districtName.toUpperCase()}`
      } else if (result.newOwner === 'ai' && result.previousOwner !== 'ai') {
        toastText = `${state.aiName} CLAIMS ${result.districtName.toUpperCase()}`
      }

      return {
        districts,
        revealIndex: state.revealIndex + 1,
        lastToast: createToast(toastText),
      }
    })
  },

  finishReveal: () => {
    const { phase } = get()
    if (phase !== 'REVEAL') {
      return
    }

    set((state) => {
      const districtsWithHeat = updateHeat(
        state.districts,
        state.playerDeployment,
        state.aiDeployment,
      )
      const flipsToPlayer = state.roundResults.filter(
        (result) => result.previousOwner === 'ai' && result.newOwner === 'player',
      ).length
      const summary = scoreRound(districtsWithHeat, state.scores, flipsToPlayer)
      const changes = state.roundResults
        .filter((result) => result.previousOwner !== result.newOwner)
        .map((result) =>
          `${result.districtName} (${result.previousOwner} -> ${result.newOwner})`,
        )

      const winner: Owner | null =
        summary.playerTotalPoints >= 15 || summary.aiTotalPoints >= 15
          ? summary.playerTotalPoints >= summary.aiTotalPoints
            ? 'player'
            : 'ai'
          : null

      return {
        districts: districtsWithHeat,
        scores: { player: summary.playerTotalPoints, ai: summary.aiTotalPoints },
        phase: winner ? 'GAME_OVER' : 'SCORING',
        roundSummary: {
          playerRoundPoints: summary.playerRoundPoints,
          aiRoundPoints: summary.aiRoundPoints,
          dominanceBonus: summary.dominanceBonus,
          flipBonus: summary.flipBonus,
          playerDistrictCount: summary.playerDistrictCount,
          aiDistrictCount: summary.aiDistrictCount,
          changes,
        },
        winner,
        title: winner === 'player' ? computeTitle(summary.playerTotalPoints, summary.aiTotalPoints) : '',
      }
    })
  },

  nextRound: () => {
    set((state) => ({
      round: state.round + 1,
      phase: 'ROUND_START',
      playerDeployment: buildDeployment(),
      aiDeployment: buildDeployment(),
      revealIndex: 0,
      roundResults: [],
      roundSummary: null,
      lastToast: null,
      aiFlavorText: '',
    }))
  },

  resetGame: () => {
    set((state) => ({
      phase: 'ROUND_START',
      round: 1,
      scores: { player: 0, ai: 0 },
      districts: buildDistricts(),
      playerDeployment: buildDeployment(),
      aiDeployment: buildDeployment(),
      previousPlayerDeployment: undefined,
      roundResults: [],
      roundSummary: null,
      lastToast: null,
      winner: null,
      title: '',
      aiFlavorText: '',
      selectedDistrictId: null,
      hoveredDistrictId: null,
      playerName: state.playerName,
    }))
  },

  clearToast: () => set({ lastToast: null }),
}))
