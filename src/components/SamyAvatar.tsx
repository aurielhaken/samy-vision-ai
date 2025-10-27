import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EXPRESSIONS, interpolateExpression, FacialExpression } from '@/utils/facialExpressions';

interface SamyAvatarProps {
  emotion: 'calm' | 'curious' | 'energetic';
  isSpeaking: boolean;
  intensity: number;
}

const EMOTION_COLORS = {
  calm: '#4A90E2',
  curious: '#00D9FF',
  energetic: '#FF8C42',
};

export const SamyAvatar = ({ emotion, isSpeaking, intensity }: SamyAvatarProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  
  const [currentExpression, setCurrentExpression] = useState<FacialExpression>(EXPRESSIONS.calm);
  const [targetExpression, setTargetExpression] = useState<FacialExpression>(EXPRESSIONS.calm);
  const [transitionProgress, setTransitionProgress] = useState(1);

  const targetColor = useMemo(() => new THREE.Color(EMOTION_COLORS[emotion]), [emotion]);

  useEffect(() => {
    const newTarget = isSpeaking ? EXPRESSIONS.speaking : EXPRESSIONS[emotion];
    setTargetExpression(newTarget);
    setTransitionProgress(0);
  }, [emotion, isSpeaking]);

  useFrame((state) => {
    if (!groupRef.current || !headRef.current) return;

    const time = state.clock.getElapsedTime();

    // Transition d'expression
    if (transitionProgress < 1) {
      setTransitionProgress(prev => Math.min(prev + 0.05, 1));
      const interpolated = interpolateExpression(currentExpression, targetExpression, transitionProgress);
      setCurrentExpression(interpolated);
    }

    // Animation de respiration
    const breathe = 1 + Math.sin(time * 0.8) * 0.03;
    if (headRef.current) {
      headRef.current.scale.setScalar(breathe);
    }

    // Animation des yeux
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeScale = currentExpression.eyeOpenness + (isSpeaking ? Math.sin(time * 10) * 0.1 : 0);
      leftEyeRef.current.scale.y = eyeScale;
      rightEyeRef.current.scale.y = eyeScale;
    }

    // Animation des sourcils
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      const eyebrowY = 0.65 + currentExpression.eyebrowHeight * 0.15;
      leftEyebrowRef.current.position.y = eyebrowY;
      rightEyebrowRef.current.position.y = eyebrowY;
    }

    // Animation de la bouche (parle)
    if (mouthRef.current) {
      if (isSpeaking) {
        const talkCycle = Math.sin(time * 12) * 0.5 + 0.5;
        const mouthOpen = currentExpression.mouthOpenness * (0.3 + talkCycle * 0.7) * intensity;
        mouthRef.current.scale.y = 0.3 + mouthOpen;
        mouthRef.current.scale.x = 0.6 - mouthOpen * 0.2;
      } else {
        mouthRef.current.scale.y = 0.3 + currentExpression.mouthOpenness * 0.2;
        mouthRef.current.scale.x = 0.6 + currentExpression.mouthSmile * 0.3;
      }
    }

    // Inclinaison de la tête
    if (groupRef.current) {
      groupRef.current.rotation.z = currentExpression.headTilt * 0.2;
    }

    // Transition de couleur
    if (headRef.current.material instanceof THREE.MeshStandardMaterial) {
      headRef.current.material.emissive.lerp(targetColor, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Tête */}
      <Sphere ref={headRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={EMOTION_COLORS[emotion]}
          emissive={EMOTION_COLORS[emotion]}
          emissiveIntensity={isSpeaking ? 0.8 : 0.4}
          roughness={0.3}
          metalness={0.7}
        />
      </Sphere>

      {/* Oeil gauche */}
      <Sphere ref={leftEyeRef} args={[0.15, 16, 16]} position={[-0.3, 0.2, 0.85]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.6}
        />
      </Sphere>
      
      {/* Pupille gauche */}
      <Sphere args={[0.08, 16, 16]} position={[-0.3, 0.2, 0.95]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>

      {/* Oeil droit */}
      <Sphere ref={rightEyeRef} args={[0.15, 16, 16]} position={[0.3, 0.2, 0.85]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.6}
        />
      </Sphere>
      
      {/* Pupille droite */}
      <Sphere args={[0.08, 16, 16]} position={[0.3, 0.2, 0.95]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>

      {/* Sourcil gauche */}
      <mesh ref={leftEyebrowRef} position={[-0.3, 0.65, 0.85]}>
        <boxGeometry args={[0.35, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#000000"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Sourcil droit */}
      <mesh ref={rightEyebrowRef} position={[0.3, 0.65, 0.85]}>
        <boxGeometry args={[0.35, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#000000"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Bouche */}
      <mesh ref={mouthRef} position={[0, -0.3, 0.85]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.08, 8, 32, Math.PI]} />
        <meshStandardMaterial
          color="#000000"
          emissive={EMOTION_COLORS[emotion]}
          emissiveIntensity={isSpeaking ? 0.5 : 0.2}
        />
      </mesh>
    </group>
  );
};
