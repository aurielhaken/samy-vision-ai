import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface SamyOrbProps {
  emotion: 'calm' | 'curious' | 'energetic';
  isSpeaking: boolean;
  intensity: number;
}

const EMOTION_COLORS = {
  calm: '#4A90E2',      // Bleu doux
  curious: '#00D9FF',   // Cyan
  energetic: '#FF8C42', // Orange/Ambre
};

export const SamyOrb = ({ emotion, isSpeaking, intensity }: SamyOrbProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  const targetColor = useMemo(() => new THREE.Color(EMOTION_COLORS[emotion]), [emotion]);
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    if (isSpeaking) {
      // Pulse selon l'intensité quand Samy parle
      const pulse = 1 + Math.sin(time * 8) * 0.15 * intensity;
      meshRef.current.scale.setScalar(pulse);
      
      // Augmentation de la luminosité
      materialRef.current.emissiveIntensity = 0.8 + intensity * 0.4;
    } else {
      // Respiration douce au repos
      const breathe = 1 + Math.sin(time * 0.8) * 0.05;
      meshRef.current.scale.setScalar(breathe);
      
      // Luminosité calme
      materialRef.current.emissiveIntensity = 0.4 + Math.sin(time * 0.5) * 0.1;
    }
    
    // Transition douce de couleur
    if (materialRef.current.emissive) {
      materialRef.current.emissive.lerp(targetColor, 0.05);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        ref={materialRef}
        color={EMOTION_COLORS[emotion]}
        emissive={EMOTION_COLORS[emotion]}
        emissiveIntensity={0.4}
        distort={isSpeaking ? 0.3 : 0.1}
        speed={isSpeaking ? 3 : 1}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};
