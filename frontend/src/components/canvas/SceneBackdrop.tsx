import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/** 参考图 9797 实拍作为深空远景，增强氛围与景深 */
export function SceneBackdrop() {
  const tex = useTexture('/assets/ref/ceremony-bg.jpg', (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  })

  return (
    <mesh position={[0, 0.1, -13]} renderOrder={-2000}>
      <planeGeometry args={[28, 28]} />
      <meshBasicMaterial
        map={tex}
        depthWrite={false}
        toneMapped
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}
