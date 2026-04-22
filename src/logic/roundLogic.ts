import type { DistrictDefinition, DistrictId } from '../data/districts'

export type Owner = 'player' | 'ai' | 'neutral'

export interface DistrictRoundResult {
  districtId: DistrictId
  districtName: string
  playerOps: number
  aiOps: number
  previousOwner: Owner
  newOwner: Owner
  contested: boolean
  flipped: boolean
  hotZone: boolean
}

export interface RoundResolution {
  results: DistrictRoundResult[]
  flipsToPlayer: number
  flipsToAi: number
}

export const resolveRound = (
  districts: Array<DistrictDefinition & { owner: Owner; heat: number }>,
  playerDeployment: Record<DistrictId, number>,
  aiDeployment: Record<DistrictId, number>,
): RoundResolution => {
  const results: DistrictRoundResult[] = districts.map((district) => {
    const playerOps = playerDeployment[district.id] ?? 0
    const aiOps = aiDeployment[district.id] ?? 0
    const hotZone = district.heat >= 3
    const threshold = hotZone ? 2 : 1

    let newOwner: Owner = district.owner
    if (playerOps >= aiOps + threshold) {
      newOwner = 'player'
    } else if (aiOps >= playerOps + threshold) {
      newOwner = 'ai'
    }

    const contested = playerOps > 0 || aiOps > 0
    const flipped = newOwner !== district.owner && newOwner !== 'neutral'

    return {
      districtId: district.id,
      districtName: district.name,
      playerOps,
      aiOps,
      previousOwner: district.owner,
      newOwner,
      contested,
      flipped,
      hotZone,
    }
  })

  const flipsToPlayer = results.filter(
    (result) => result.previousOwner === 'ai' && result.newOwner === 'player',
  ).length
  const flipsToAi = results.filter(
    (result) => result.previousOwner === 'player' && result.newOwner === 'ai',
  ).length

  return { results, flipsToPlayer, flipsToAi }
}

export interface ScoreSummary {
  playerRoundPoints: number
  aiRoundPoints: number
  playerTotalPoints: number
  aiTotalPoints: number
  dominanceBonus: number
  flipBonus: number
  playerDistrictCount: number
  aiDistrictCount: number
}

export const scoreRound = (
  districts: Array<DistrictDefinition & { owner: Owner }>,
  currentScores: { player: number; ai: number },
  flipsToPlayer: number,
): ScoreSummary => {
  const playerDistricts = districts.filter((district) => district.owner === 'player')
  const aiDistricts = districts.filter((district) => district.owner === 'ai')

  const playerBase = playerDistricts.reduce(
    (sum, district) => sum + district.value,
    0,
  )
  const aiBase = aiDistricts.reduce((sum, district) => sum + district.value, 0)

  const dominanceBonus = playerDistricts.length >= 4 ? 2 : 0
  const flipBonus = flipsToPlayer

  const playerRoundPoints = playerBase + dominanceBonus + flipBonus
  const aiRoundPoints = aiBase

  return {
    playerRoundPoints,
    aiRoundPoints,
    playerTotalPoints: currentScores.player + playerRoundPoints,
    aiTotalPoints: currentScores.ai + aiRoundPoints,
    dominanceBonus,
    flipBonus,
    playerDistrictCount: playerDistricts.length,
    aiDistrictCount: aiDistricts.length,
  }
}
