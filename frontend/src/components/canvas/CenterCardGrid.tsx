import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

type Props = {
  visible: boolean
}

const COLS = 3
const ROWS = 4

/** 参考图 9797 中心清晰牌阵：3×4 背面网格 */
export function CenterCardGrid({ visible }: Props) {
  const group = useRef<THREE.Group>(null)
  const tex = useTexture('/assets/ref/card-back-slice.jpg', (t) => {
    t.colorSpace = THREE.SRGBColorSpace
  })

  const layout = useMemo(() => {
    const w = 0.26
    const h = 0.42
    const gx = 0.14
    const gy = 0.12
    const items: { x: number; y: number; z: number; ry: number }[] = []
    let k = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const jitter = ((k * 7) % 10) * 0.01 - 0.05
        items.push({
          x: (c - (COLS - 1) / 2) * (w + gx),
          y: ((ROWS - 1) / 2 - r) * (h + gy),
          z: 0.55 + jitter,
          ry: jitter * 2,
        })
        k++
      }
    }
    return { items, w, h }
  }, [])

  useFrame((_, delta) => {
    if (!group.current || !visible) return
    group.current.rotation.y += delta * 0.06
    const t = performance.now() * 0.001
    group.current.children.forEach((ch, i) => {
      ch.position.y = layout.items[i]!.y + Math.sin(t * 1.2 + i * 0.4) * 0.012
    })
  })

  return (
    <group ref={group} visible={visible} position={[0, 0.05, 0]}>
      {layout.items.map((it, i) => (
        <mesh
          key={i}
          position={[it.x, it.y, it.z]}
          rotation={[0, it.ry, 0]}
          frustumCulled={false}
        >
          <planeGeometry args={[layout.w, layout.h]} />
          <meshStandardMaterial
            map={tex}
            transparent
            opacity={visible ? 0.98 : 0}
            roughness={0.35}
            metalness={0.55}
            emissive="#3d2a1a"
            emissiveIntensity={0.35}
            envMapIntensity={1}
          />
        </mesh>
      ))}
    </group>
  )
}
