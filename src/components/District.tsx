import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DistrictState } from '../store/gameStore'
import type { DistrictId } from '../data/districts'

const OWNER_EMISSIVE: Record<string, string> = {
  player: '#00ff9f',
  ai: '#ff3860',
  neutral: '#888888',
}

const PROFILE_FOOTPRINT: Record<string, [number, number]> = {
  industrial: [2.8, 1.6],
  casino: [1.8, 1.4],
  downtown: [2.0, 2.0],
  market: [1.8, 1.6],
  slums: [1.6, 1.4],
  harbor: [2.8, 1.8],
  precinct: [2.2, 1.8],
}

interface BuildingData {
  position: [number, number, number]
  size: [number, number, number]
  windows: Array<{ position: [number, number, number]; size: [number, number, number] }>
}

interface DistrictProps {
  district: DistrictState
  isHovered: boolean
  isSelected: boolean
  onHover: (id: DistrictId | null) => void
  onSelect: (id: DistrictId) => void
}

const hashSeed = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) + 1
}

const seededRandom = (seed: number) => {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const District = ({
  district,
  isHovered,
  isSelected,
  onHover,
  onSelect,
}: DistrictProps) => {
  const baseGeometry = useMemo(() => {
    const rng = seededRandom(hashSeed(`${district.id}-shape`))
    const points: THREE.Vector2[] = []
    const steps = 7
    const radius = district.radius * (0.9 + rng() * 0.2)
    for (let i = 0; i < steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2
      const jitter = 0.7 + rng() * 0.6
      points.push(
        new THREE.Vector2(
          Math.cos(angle) * radius * jitter,
          Math.sin(angle) * radius * jitter,
        ),
      )
    }
    const shape = new THREE.Shape(points)
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.2,
      bevelEnabled: false,
    })
  }, [district.id, district.radius])

  const center = district.position
  const buildings = useMemo<BuildingData[]>(() => {
    const rng = seededRandom(hashSeed(district.id))
    const [minHeight, maxHeight] = district.heightRange
    const [baseX, baseZ] = PROFILE_FOOTPRINT[district.profile]

    return Array.from({ length: district.buildingCount }, () => {
      const angle = rng() * Math.PI * 2
      const radius = rng() * district.radius
      const offsetX = Math.cos(angle) * radius
      const offsetZ = Math.sin(angle) * radius
      const height = minHeight + rng() * (maxHeight - minHeight)
      const sizeX = baseX * (0.6 + rng() * 0.9)
      const sizeZ = baseZ * (0.6 + rng() * 0.9)
      const buildingPosition: [number, number, number] = [
        center[0] + offsetX,
        height / 2,
        center[2] + offsetZ,
      ]

      const windows = Array.from({ length: 2 }, (_, windowIndex) => {
        const side = windowIndex % 2 === 0 ? 1 : -1
        return {
          position: [
            buildingPosition[0] + (sizeX / 2 + 0.05) * side,
            buildingPosition[1] * (0.6 + rng() * 0.2),
            buildingPosition[2] + (rng() - 0.5) * sizeZ * 0.6,
          ] as [number, number, number],
          size: [0.18, 0.18, 0.05] as [number, number, number],
        }
      })

      return {
        position: buildingPosition,
        size: [sizeX, height, sizeZ],
        windows,
      }
    })
  }, [
    district.id,
    district.radius,
    district.heightRange,
    district.buildingCount,
    district.profile,
    center,
  ])

  const materialRefs = useRef<THREE.MeshStandardMaterial[]>([])

  const windowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8e68c',
        emissive: '#f8e68c',
        emissiveIntensity: 0.9,
        roughness: 0.4,
      }),
    [],
  )

  const emissiveColor = useMemo(() => new THREE.Color(), [])
  const ownerColor = useMemo(
    () => new THREE.Color(OWNER_EMISSIVE[district.owner]),
    [district.owner],
  )
  const hotColor = useMemo(() => new THREE.Color('#ff6b35'), [])
  const selectedColor = useMemo(() => new THREE.Color('#f5c518'), [])

  useFrame((state) => {
    let intensity = district.owner === 'neutral' ? 0.2 : 0.45
    if (isHovered || isSelected) {
      emissiveColor.copy(selectedColor)
      intensity = 0.7
    } else if (district.heat >= 3) {
      const pulse = (Math.sin(state.clock.getElapsedTime() * 2) + 1) / 2
      emissiveColor.copy(ownerColor).lerp(hotColor, pulse)
      intensity = 0.55
    } else {
      emissiveColor.copy(ownerColor)
    }

    materialRefs.current.forEach((material) => {
      if (!material) {
        return
      }
      material.emissive.copy(emissiveColor)
      material.emissiveIntensity = intensity
    })
  })

  const areaSize = district.radius * 2.2

  return (
    <group>
      <mesh
        position={[district.position[0], 0.05, district.position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={baseGeometry}
        onPointerOver={() => onHover(district.id)}
        onPointerOut={() => onHover(null)}
        onClick={() => onSelect(district.id)}
      >
        <meshStandardMaterial color="#10101a" />
      </mesh>
      <mesh
        position={[district.position[0], 0.2, district.position[2]]}
        visible={false}
        onPointerOver={() => onHover(district.id)}
        onPointerOut={() => onHover(null)}
        onClick={() => onSelect(district.id)}
      >
        <boxGeometry args={[areaSize * 1.1, 2, areaSize * 1.1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {buildings.map((building, index) => (
        <mesh
          key={`${district.id}-b-${index}`}
          position={building.position}
        >
          <boxGeometry args={building.size} />
          <meshStandardMaterial
            ref={(ref) => {
              if (ref) {
                materialRefs.current[index] = ref
              }
            }}
            color="#1a1a2e"
            emissive="#888888"
            emissiveIntensity={0.35}
            roughness={0.6}
          />
        </mesh>
      ))}
      {buildings.flatMap((building, index) =>
        building.windows.map((window, windowIndex) => (
          <mesh
            key={`${district.id}-w-${index}-${windowIndex}`}
            position={window.position}
            material={windowMaterial}
          >
            <boxGeometry args={window.size} />
          </mesh>
        )),
      )}
    </group>
  )
}

export default District
