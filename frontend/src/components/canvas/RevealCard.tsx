import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTexture } from '@react-three/drei'
import { Group } from 'three'
import gsap from 'gsap'
import * as THREE from 'three'

import type { DrawnCardResponse } from '../../types/api'

type Props = {
  card: DrawnCardResponse
  onComplete: () => void
}

const W = 0.62
const H = 1.02
const CW = 512
const CH = 896

function composeFrontTexture(
  img: HTMLImageElement,
  name: string,
  upright: boolean,
): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = CW
  c.height = CH
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, CW, CH)
  const g = ctx.createLinearGradient(0, CH * 0.58, 0, CH)
  g.addColorStop(0, 'rgba(12, 4, 28, 0)')
  g.addColorStop(0.55, 'rgba(18, 8, 40, 0.45)')
  g.addColorStop(1, 'rgba(6, 2, 18, 0.72)')
  ctx.fillStyle = g
  ctx.fillRect(0, CH * 0.52, CW, CH * 0.48)
  ctx.fillStyle = '#f9efd8'
  ctx.font = 'bold 44px Cinzel, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,0,0,0.65)'
  ctx.shadowBlur = 8
  ctx.fillText(name, CW / 2, CH * 0.8)
  ctx.shadowBlur = 0
  ctx.font = '22px "DM Sans", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255, 215, 120, 0.95)'
  ctx.fillText(upright ? '正位' : '逆位', CW / 2, CH * 0.9)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

export function RevealCard({ card, onComplete }: Props) {
  const root = useRef<Group>(null)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const [backMap, styleMap] = useTexture(
    ['/assets/ref/card-back-slice.jpg', '/assets/ref/card-front-style-slice.jpg'],
    ([back, style]) => {
      back.colorSpace = THREE.SRGBColorSpace
      style.colorSpace = THREE.SRGBColorSpace
    },
  )

  const [frontMap, setFrontMap] = useState<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    const img = styleMap.image as HTMLImageElement
    const apply = () => {
      setFrontMap((prev) => {
        prev?.dispose()
        return composeFrontTexture(img, card.name, card.upright)
      })
    }
    if (img.complete && img.naturalWidth) apply()
    else img.addEventListener('load', apply)
    return () => {
      img.removeEventListener('load', apply)
    }
  }, [styleMap, card.name, card.upright])

  useEffect(
    () => () => {
      setFrontMap((prev) => {
        prev?.dispose()
        return null
      })
    },
    [],
  )

  const fallbackTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#2a1848'
    ctx.fillRect(0, 0, 64, 64)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  useLayoutEffect(() => {
    const g = root.current
    if (!g) return
    const ctx = gsap.context(() => {
      g.position.set(2.4, 0.4, 0.5)
      g.rotation.set(0.2, -0.6, 0.08)
      g.scale.setScalar(0.35)

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => onCompleteRef.current(),
      })
      tl.to(g.position, { x: 0, y: 0, z: 2.65, duration: 1.35 }, 0)
        .to(g.rotation, { x: 0, y: 0, z: (15 * Math.PI) / 180, duration: 1.2 }, 0)
        .to(g.scale, { x: 1, y: 1, z: 1, duration: 1.25 }, 0)
        .to(g.rotation, { y: Math.PI, duration: 0.85, ease: 'power1.inOut' }, 0.75)
    }, root)
    return () => ctx.revert()
  }, [card])

  const front = frontMap ?? fallbackTex

  return (
    <group ref={root}>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          map={backMap}
          roughness={0.32}
          metalness={0.55}
          emissive="#6b4420"
          emissiveIntensity={0.18}
        />
      </mesh>
      <mesh position={[0, 0, -0.004]} rotation={[0, Math.PI, 0]} key={front.uuid}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          map={front}
          roughness={0.28}
          metalness={0.48}
          emissive="#3d2060"
          emissiveIntensity={0.22}
        />
      </mesh>
    </group>
  )
}
