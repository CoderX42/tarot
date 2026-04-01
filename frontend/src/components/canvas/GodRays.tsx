import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Props = { intensity?: number }

export function GodRays({ intensity = 1 }: Props) {
  const group = useRef<THREE.Group>(null)

  const meshes = useMemo(() => {
    const n = 20
    const out: { rot: number; w: number }[] = []
    for (let i = 0; i < n; i++) {
      out.push({ rot: (i / n) * Math.PI * 2, w: 0.12 + (i % 4) * 0.035 })
    }
    return out
  }, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.z = t * 0.05
    group.current.children.forEach((ch, i) => {
      const m = ch as THREE.Mesh
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = (0.1 + Math.sin(t * 2.2 + i) * 0.05) * intensity
    })
  })

  return (
    <group ref={group}>
      {meshes.map((m, i) => (
        <mesh key={i} rotation={[0, 0, m.rot]}>
          <planeGeometry args={[m.w, 11]} />
          <meshBasicMaterial
            color="#fff6d8"
            transparent
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
