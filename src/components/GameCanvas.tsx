import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import District from './District'

const WATER_COLOR = '#0d1b2a'

const GameCanvas = () => {
  const districts = useGameStore((state) => state.districts)
  const hoveredDistrictId = useGameStore((state) => state.hoveredDistrictId)
  const selectedDistrictId = useGameStore((state) => state.selectedDistrictId)
  const setHoveredDistrict = useGameStore((state) => state.setHoveredDistrict)
  const selectDistrict = useGameStore((state) => state.selectDistrict)

  const pointLights = useMemo(
    () =>
      districts.map((district) => ({
        id: district.id,
        position: [
          district.position[0],
          district.position[1] + 6,
          district.position[2],
        ] as [number, number, number],
      })),
    [districts],
  )

  return (
    <Canvas
      camera={{ position: [18, 36, 18], fov: 45, near: 0.1, far: 200 }}
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#0b0b12']} />
      <ambientLight color="#1a1aff" intensity={0.15} />
      {pointLights.map((light) => (
        <pointLight
          key={light.id}
          position={light.position}
          color="#ff6b35"
          intensity={0.4}
          distance={18}
        />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[60, 45]} />
        <meshStandardMaterial color="#0f0f14" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, -0.18, 14]}>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color={WATER_COLOR} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 14]}>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color={WATER_COLOR} />
      </mesh>
      {districts.map((district) => (
        <District
          key={district.id}
          district={district}
          isHovered={hoveredDistrictId === district.id}
          isSelected={selectedDistrictId === district.id}
          onHover={setHoveredDistrict}
          onSelect={selectDistrict}
        />
      ))}
      <OrbitControls
        enableRotate={false}
        enableZoom
        enablePan
        minDistance={26}
        maxDistance={40}
        target={[0, 0, 2]}
      />
    </Canvas>
  )
}

export default GameCanvas
