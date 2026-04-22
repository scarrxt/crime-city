export type DistrictId =
  | 'docks'
  | 'casino'
  | 'downtown'
  | 'blackmarket'
  | 'slums'
  | 'harbor'
  | 'precinct'

export type DistrictProfile =
  | 'industrial'
  | 'casino'
  | 'downtown'
  | 'market'
  | 'slums'
  | 'harbor'
  | 'precinct'

export interface DistrictDefinition {
  id: DistrictId
  name: string
  value: 1 | 2 | 3
  position: [number, number, number]
  profile: DistrictProfile
  radius: number
  buildingCount: number
  heightRange: [number, number]
}

export const districtDefinitions: DistrictDefinition[] = [
  {
    id: 'docks',
    name: 'The Docks',
    value: 2,
    position: [-14, 0, 10],
    profile: 'industrial',
    radius: 5.5,
    buildingCount: 12,
    heightRange: [0.6, 2.2],
  },
  {
    id: 'casino',
    name: 'The Casino',
    value: 3,
    position: [10, 0, 2],
    profile: 'casino',
    radius: 4.8,
    buildingCount: 10,
    heightRange: [2.4, 6.0],
  },
  {
    id: 'downtown',
    name: 'Downtown',
    value: 3,
    position: [0, 0, 0],
    profile: 'downtown',
    radius: 6.4,
    buildingCount: 16,
    heightRange: [2.6, 6.8],
  },
  {
    id: 'blackmarket',
    name: 'The Black Market',
    value: 2,
    position: [-12, 0, -8],
    profile: 'market',
    radius: 4.6,
    buildingCount: 14,
    heightRange: [1.2, 3.6],
  },
  {
    id: 'slums',
    name: 'The Slums',
    value: 1,
    position: [12, 0, 10],
    profile: 'slums',
    radius: 5.0,
    buildingCount: 10,
    heightRange: [0.5, 2.0],
  },
  {
    id: 'harbor',
    name: 'The Harbor',
    value: 2,
    position: [0, 0, 12],
    profile: 'harbor',
    radius: 5.8,
    buildingCount: 12,
    heightRange: [0.6, 2.4],
  },
  {
    id: 'precinct',
    name: 'The Precinct',
    value: 3,
    position: [0, 0, -10],
    profile: 'precinct',
    radius: 4.4,
    buildingCount: 9,
    heightRange: [2.2, 5.0],
  },
]
