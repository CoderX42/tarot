import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function SpiralPoints({
  count,
  turns,
  rMin,
  rMax,
  yScale,
  spin,
  pointSize,
  opacity,
}: {
  count: number
  turns: number
  rMin: number
  rMax: number
  yScale: number
  spin: number
  pointSize: number
  opacity: number
}) {
  const ref = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const c1 = new THREE.Color('#ffd700')
    const c2 = new THREE.Color('#fff8e1')
    const c3 = new THREE.Color('#daa520')
    for (let i = 0; i < count; i++) {
      const t = i / count
      const angle = t * Math.PI * 2 * turns
      const r = rMin + t * (rMax - rMin)
      const y = (t - 0.5) * yScale + Math.sin(t * 22) * 0.06
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(angle) * r
      const jitter = (i * 19 + (i % 11) * 0.11) % 1
      const mix = c2.clone().lerpColors(c1, c3, jitter)
      colors[i * 3] = mix.r
      colors[i * 3 + 1] = mix.g
      colors[i * 3 + 2] = mix.b
    }
    return { positions, colors }
  }, [count, rMax, rMin, turns, yScale])

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * spin
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

/** 双螺旋金尘：内圈 + 外环，贴近参考图 9797 / 9799 */
export function ParticleSpiral() {
  return (
    <>
      <SpiralPoints
        count={4000}
        turns={7}
        rMin={0.35}
        rMax={3.15}
        yScale={2.5}
        spin={0.13}
        pointSize={0.036}
        opacity={0.88}
      />
      <SpiralPoints
        count={1800}
        turns={5}
        rMin={2.0}
        rMax={4.6}
        yScale={1.2}
        spin={-0.1}
        pointSize={0.028}
        opacity={0.55}
      />
    </>
  )
}
