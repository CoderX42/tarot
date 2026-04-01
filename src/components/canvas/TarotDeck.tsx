import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { useTarotStore } from '@/store/useTarotStore';

const CARD_COUNT = 22; // Major Arcana
const CARD_WIDTH = 1.2;
const CARD_HEIGHT = 2;
const CARD_THICKNESS = 0.02;

interface CardProps {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  isFlipped: boolean;
  onClick: () => void;
  isHovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

function Card({ id, position, rotation, isFlipped, onClick, isHovered, onPointerOver, onPointerOut }: CardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Animation for flip and hover
  const { position: pos, rotation: rot, scale } = useSpring({
    position,
    rotation: [rotation[0], rotation[1] + (isFlipped ? Math.PI : 0), rotation[2]],
    scale: isHovered ? [1.05, 1.05, 1.05] : [1, 1, 1],
    config: { mass: 1, tension: 170, friction: 26 }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={pos as any}
      rotation={rot as any}
      scale={scale as any}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut();
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, CARD_THICKNESS]} />
      {/* Front face */}
      <meshStandardMaterial attach="material-4" color="#f8fafc" />
      {/* Back face */}
      <meshStandardMaterial attach="material-5" color="#3b0764" />
      {/* Edges */}
      <meshStandardMaterial attach="material-0" color="#d4af37" />
      <meshStandardMaterial attach="material-1" color="#d4af37" />
      <meshStandardMaterial attach="material-2" color="#d4af37" />
      <meshStandardMaterial attach="material-3" color="#d4af37" />
    </animated.mesh>
  );
}

export default function TarotDeck() {
  const { readingState, setReadingState, selectedCards, addSelectedCard, availableCards, fetchCards, submitReading } = useTarotStore();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    if (readingState === 'idle') {
      fetchCards().then(() => {
        setTimeout(() => {
          setReadingState('shuffling');
          setTimeout(() => {
            setReadingState('selecting');
          }, 2000);
        }, 1000);
      });
    }
  }, [readingState, setReadingState, fetchCards]);

  const cardCount = availableCards.length > 0 ? availableCards.length : CARD_COUNT;

  const getCardTransform = (index: number) => {
    if (readingState === 'idle') {
      return {
        position: [0, index * 0.02, 0] as [number, number, number],
        rotation: [-Math.PI / 2, 0, 0] as [number, number, number]
      };
    }
    
    if (readingState === 'shuffling') {
      const offset = Math.sin(index * 0.5 + Date.now() * 0.001) * 0.5;
      return {
        position: [offset, index * 0.02, 0] as [number, number, number],
        rotation: [-Math.PI / 2, 0, 0] as [number, number, number]
      };
    }

    if (readingState === 'selecting') {
      // Fan out in an arc
      const angle = cardCount > 1 ? (index / (cardCount - 1)) * Math.PI - Math.PI / 2 : 0;
      const radius = 4;
      return {
        position: [Math.sin(angle) * radius, 0.5, Math.cos(angle) * radius - 2] as [number, number, number],
        rotation: [-Math.PI / 4, -angle, 0] as [number, number, number]
      };
    }

    // Selected cards state
    const selectedIndex = selectedCards.findIndex(c => c.index === index);
    if (selectedIndex !== -1) {
      return {
        position: [(selectedIndex - 1) * 2, 0.5, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      };
    }

    // Hide unselected cards
    return {
      position: [0, -5, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number]
    };
  };

  const handleCardClick = (index: number) => {
    if (readingState === 'selecting' && selectedCards.length < 3) {
      if (!selectedCards.some(c => c.index === index)) {
        if (!availableCards[index]) return; // safety check
        const cardData = availableCards[index].card;
        const isReversed = availableCards[index].isReversed;
        addSelectedCard({ index, ...cardData, isReversed });
      }
    }
  };

  return (
    <group>
      {Array.from({ length: cardCount }).map((_, index) => {
        const transform = getCardTransform(index);
        const isFlipped = (readingState === 'reading' || readingState === 'interpreting') && selectedCards.some(c => c.index === index);
        
        // Ensure reverse logic visually applies when flipped
        let finalRotation = [...transform.rotation] as [number, number, number];
        if (isFlipped) {
          const card = selectedCards.find(c => c.index === index);
          if (card && card.isReversed) {
            finalRotation[2] += Math.PI; // Spin 180 on Z for reversed
          }
        }

        return (
          <Card
            key={index}
            id={index}
            position={transform.position}
            rotation={finalRotation}
            isFlipped={isFlipped}
            onClick={() => handleCardClick(index)}
            isHovered={hoveredCard === index}
            onPointerOver={() => setHoveredCard(index)}
            onPointerOut={() => setHoveredCard(null)}
          />
        );
      })}
    </group>
  );
}