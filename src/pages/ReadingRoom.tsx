import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import TarotDeck from '@/components/canvas/TarotDeck';
import { useTarotStore } from '@/store/useTarotStore';
import ReadingUI from '@/components/ui/ReadingUI';

export default function ReadingRoom() {
  const { readingState } = useTarotStore();

  return (
    <div className="w-full h-screen bg-slate-950 relative overflow-hidden flex flex-col">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <Stats className="absolute top-0 right-0" />
          <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={45} />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            castShadow
            position={[5, 10, 5]}
            intensity={1}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[0, 2, 0]} intensity={2} color="#a855f7" distance={10} />
          
          <Suspense fallback={null}>
            <Environment preset="night" />
            <TarotDeck />
          </Suspense>

          <OrbitControls 
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>
      </div>

      {/* 2D UI Layer */}
      <div className="relative z-10 pointer-events-none flex-1 flex flex-col justify-between p-4">
        <ReadingUI />
      </div>
    </div>
  );
}