import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

type Props = {
  visible: boolean
  spinBoost?: number
}

const N = 22

export function OrbitalCards({ visible, spinBoost = 1 }: Props) {
  const group = useRef<THREE.Group>(null)
  const tex = useTexture('/assets/ref/card-back-slice.jpg', (t) => {
    t.colorSpace = THREE.SRGBColorSpace
  })

  const slots = useMemo(() => {
    const s: { angle: number; r: number; y: number; tilt: number; speed: number }[] = []
    for (let i = 0; i < N; i++) {
      const t = i / N
      s.push({
        angle: t * Math.PI * 2,
        r: 2.05 + (i % 4) * 0.42,
        y: Math.sin(t * 9) * 0.42,
        tilt: (i % 6) * 0.11 - 0.28,
        speed: 0.42 + (i % 5) * 0.11,
      })
    }
    return s
  }, [])

  useFrame((_, delta) => {
    if (!group.current || !visible) return
    group.current.rotation.y += delta * 0.52 * spinBoost
    group.current.children.forEach((child, i) => {
      const slot = slots[i]
      if (!slot || !child) return
      const t = group.current!.rotation.y * slot.speed + slot.angle
      child.position.x = Math.cos(t) * slot.r
      child.position.z = Math.sin(t) * slot.r
      child.position.y = slot.y + Math.sin(t * 3.2) * 0.08
      child.rotation.y = -t + Math.PI / 2 + slot.tilt
    })
  })

  const w = 0.52
  const h = 0.84

  return (
    <group ref={group} visible={visible}>
      {slots.map((slot, i) => (
        <mesh key={i} frustumCulled={false}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={tex}
            transparent
            opacity={visible ? (slot.r > 2.55 ? 0.76 : 0.93) : 0}
            roughness={0.28}
            metalness={0.62}
            emissive="#c9883a"
            emissiveIntensity={0.14}
          />
        </mesh>
      ))}
    </group>
  )
}
