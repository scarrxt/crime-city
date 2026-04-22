import type { DistrictDefinition, DistrictId } from '../data/districts'

export type AiMode = 'GREEDY' | 'SHADOW' | 'SCATTER'

export interface AiContext {
  round: number
  mode: AiMode
  districts: DistrictDefinition[]
  owners: Record<DistrictId, 'player' | 'ai' | 'neutral'>
  previousPlayerDeployment?: Record<DistrictId, number>
}

export const AI_MODES: AiMode[] = ['GREEDY', 'SHADOW', 'SCATTER']

export const getAiModeForRound = (round: number): AiMode => {
  const index = Math.floor((round - 1) / 2) % AI_MODES.length
  return AI_MODES[index]
}

export const getAiFlavorText = (mode: AiMode): string => {
  switch (mode) {
    case 'GREEDY':
      return 'Your rival played it greedy this round.'
    case 'SHADOW':
      return 'Your rival was watching your every move.'
    case 'SCATTER':
      return 'Your rival scattered forces across the city.'
    default:
      return ''
  }
}

const allocateByOrder = (
  order: DistrictId[],
  total: number,
): Record<DistrictId, number> => {
  const deployment = Object.fromEntries(order.map((id) => [id, 0])) as Record<
    DistrictId,
    number
  >
  const pattern = [3, 2, 1, 1]
  let remaining = total
  let idx = 0

  while (remaining > 0) {
    const allot = Math.min(pattern[idx % pattern.length], remaining)
    const target = order[idx % order.length]
    deployment[target] += allot
    remaining -= allot
    idx += 1
  }

  return deployment
}

const pickWeighted = (weights: Array<[DistrictId, number]>): DistrictId => {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = Math.random() * total
  for (const [id, weight] of weights) {
    roll -= weight
    if (roll <= 0) {
      return id
    }
  }
  return weights[weights.length - 1][0]
}

export const computeAiDeployment = (context: AiContext): Record<DistrictId, number> => {
  const { districts, owners, previousPlayerDeployment } = context
  const total = 7

  if (context.mode === 'SHADOW' && previousPlayerDeployment) {
    const ids = districts.map((district) => district.id)
    const rotated = ids.map((_, index) =>
      ids[(index - 1 + ids.length) % ids.length],
    )
    const deployment = Object.fromEntries(
      ids.map((id) => [id, previousPlayerDeployment[id] ?? 0]),
    ) as Record<DistrictId, number>
    const shifted = Object.fromEntries(
      ids.map((id, index) => [id, deployment[rotated[index]] ?? 0]),
    ) as Record<DistrictId, number>
    return shifted
  }

  if (context.mode === 'GREEDY') {
    const sorted = [...districts]
      .filter((district) => owners[district.id] !== 'ai')
      .sort((a, b) => b.value - a.value)
    const order = (sorted.length ? sorted : districts).map(
      (district) => district.id,
    )
    return allocateByOrder(order, total)
  }

  const deployment = Object.fromEntries(
    districts.map((district) => [district.id, 0]),
  ) as Record<DistrictId, number>
  for (let i = 0; i < total; i += 1) {
    const weights = districts.map((district) => {
      const neutralBoost = owners[district.id] === 'neutral' ? 2 : 1
      return [district.id, district.value * neutralBoost] as [DistrictId, number]
    })
    const pick = pickWeighted(weights)
    deployment[pick] += 1
  }

  return deployment
}
