import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing'
import * as THREE from 'three'

import { CHROMA_OFFSET } from './postFxConstants'

import type { DrawnCardResponse } from '../../types/api'
import { CenterCardGrid } from './CenterCardGrid'
import { GodRays } from './GodRays'
import { OrbitalCards } from './OrbitalCards'
import { ParticleSpiral } from './ParticleSpiral'
import { RevealCard } from './RevealCard'
import { SceneBackdrop } from './SceneBackdrop'

export type DrawPhase = 'ceremony' | 'reveal'

type Props = {
  phase: DrawPhase
  primary: DrawnCardResponse | null
  onCeremonyEnd: () => void
  onRevealEnd: () => void
}

const CEREMONY_MS = 4800

export function SceneDraw({ phase, primary, onCeremonyEnd, onRevealEnd }: Props) {
  const onCeremonyEndRef = useRef(onCeremonyEnd)
  useEffect(() => {
    onCeremonyEndRef.current = onCeremonyEnd
  }, [onCeremonyEnd])

  useEffect(() => {
    if (phase !== 'ceremony') return
    const t = window.setTimeout(() => {
      onCeremonyEndRef.current()
    }, CEREMONY_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  return (
    <div className="scene-draw">
      <Canvas
        dpr={[1, 2]}
        gl={{
          alpha: false,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ position: [0, 0.15, 5.8], fov: 42, near: 0.1, far: 80 }}
      >
        <color attach="background" args={['#00050a']} />
        <fog attach="fog" args={['#050818', 4, 22]} />
        <ambientLight intensity={0.22} />
        <directionalLight position={[3, 6, 4]} intensity={0.55} color="#b8c8ff" />
        <pointLight position={[-2, 1, 3]} intensity={1.2} color="#ffd700" />
        <Suspense fallback={null}>
          <SceneBackdrop />
          <ParticleSpiral />
          <GodRays intensity={phase === 'ceremony' ? 1 : 0.45} />
          <CenterCardGrid visible={phase === 'ceremony'} />
          <OrbitalCards visible={phase === 'ceremony'} spinBoost={phase === 'ceremony' ? 1.25 : 1} />
          {phase === 'reveal' && primary ? (
            <RevealCard card={primary} onComplete={onRevealEnd} />
          ) : null}
          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={0.22}
              luminanceSmoothing={0.25}
              intensity={phase === 'ceremony' ? 1.35 : 0.95}
              radius={0.55}
              mipmapBlur
            />
            <ChromaticAberration offset={CHROMA_OFFSET} />
            <Vignette eskil={false} offset={0.12} darkness={0.62} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
