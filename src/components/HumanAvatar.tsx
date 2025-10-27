import { useState, useEffect, useRef } from 'react';
import avatarImage from '@/assets/samy-avatar.png';

interface HumanAvatarProps {
  emotion: 'calm' | 'curious' | 'energetic';
  isSpeaking: boolean;
  intensity: number;
}

type MouthShape = 'closed' | 'slight' | 'open' | 'wide';

export const HumanAvatar = ({ emotion, isSpeaking, intensity }: HumanAvatarProps) => {
  const [mouthShape, setMouthShape] = useState<MouthShape>('closed');
  const [headTilt, setHeadTilt] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(1);
  const animationFrame = useRef<number>();

  // Animation réaliste de la bouche synchronisée avec la parole
  useEffect(() => {
    if (!isSpeaking) {
      setMouthShape('closed');
      setHeadTilt(0);
      return;
    }

    const animate = () => {
      const now = Date.now();

      // Micro-mouvements de tête subtils pendant la parole
      setHeadTilt(Math.sin(now * 0.002) * 2);

      // Mapping direct de l'amplitude audio -> visème
      const target: MouthShape = intensity > 0.6
        ? 'wide'
        : intensity > 0.35
        ? 'open'
        : intensity > 0.15
        ? 'slight'
        : 'closed';

      setMouthShape(prev => (prev === target ? prev : target));
      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isSpeaking, intensity]);

  // Clignement des yeux réaliste
  useEffect(() => {
    const blink = () => {
      setEyeBlink(0);
      setTimeout(() => setEyeBlink(1), 150);
    };

    const blinkInterval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const getEmotionColor = () => {
    switch (emotion) {
      case 'calm': return '#4A90E2';
      case 'curious': return '#00D4FF';
      case 'energetic': return '#FF6B35';
      default: return '#4A90E2';
    }
  };

  // Définition des formes de bouche réalistes
  const getMouthStyle = () => {
    const baseBottom = 36; // Position de base (en % depuis le haut) — ajustée pour mieux coller au visage

    switch (mouthShape) {
      case 'closed':
        return {
          bottom: `${baseBottom}%`,
          height: '1.6%',
          width: '22%',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          opacity: 0.65,
        };
      case 'slight':
        return {
          bottom: `${baseBottom - 0.4}%`,
          height: '4%',
          width: '24%',
          borderRadius: '50%',
          opacity: 0.75,
        };
      case 'open':
        return {
          bottom: `${baseBottom - 0.8}%`,
          height: '8%',
          width: '26%',
          borderRadius: '50%',
          opacity: 0.85,
        };
      case 'wide':
        return {
          bottom: `${baseBottom - 1.0}%`,
          height: '12%',
          width: '30%',
          borderRadius: '48%',
          opacity: 0.9,
        };
    }
  };

  // Définition des dents pour plus de réalisme
  const getTeethStyle = () => {
    if (mouthShape === 'closed') return null;

    const baseBottom = 36.2;
    return {
      bottom: `${baseBottom}%`,
      height: mouthShape === 'wide' ? '6%' : mouthShape === 'open' ? '4.5%' : '2.5%',
      width: mouthShape === 'wide' ? '24%' : mouthShape === 'open' ? '22%' : '20%',
      opacity: mouthShape === 'wide' ? 0.95 : mouthShape === 'open' ? 0.8 : 0.6,
      borderRadius: '30% 30% 40% 40%'
    };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 blur-xl animate-pulse"
        style={{
          background: `radial-gradient(circle, ${getEmotionColor()}40 0%, transparent 70%)`,
          animationDuration: isSpeaking ? '0.5s' : '2s'
        }}
      />
      
      {/* Avatar container */}
      <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64">
        <div 
          className="relative w-full h-full rounded-full overflow-hidden border-4 shadow-2xl"
          style={{
            borderColor: getEmotionColor(),
            transform: `scale(${isSpeaking ? 1 + intensity * 0.05 : 1}) rotate(${headTilt}deg)`,
            transition: 'border-color 0.3s ease-out',
            boxShadow: `0 0 30px ${getEmotionColor()}60`
          }}
        >
          <img 
            src={avatarImage} 
            alt="Samy Avatar"
            className="w-full h-full object-cover"
            style={{
              filter: emotion === 'energetic' ? 'brightness(1.1)' : 'brightness(1)',
              transition: 'filter 0.3s ease-out'
            }}
          />
          
          {/* Clignement des yeux désactivé pour éviter les artefacts visuels */}
          {/* Vous pouvez réactiver avec un meilleur masque si nécessaire */}
          
          {/* Dents (pour le réalisme) */}
          {isSpeaking && getTeethStyle() && (
            <div 
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{
                ...getTeethStyle(),
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                borderRadius: '30% 30% 40% 40%',
                transition: 'all 0.05s ease-out',
              }}
            />
          )}
          
          {/* Bouche animée réaliste */}
          {isSpeaking && (
            <div 
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{
                ...getMouthStyle(),
                background: `linear-gradient(to bottom, 
                  rgba(60, 20, 20, ${getMouthStyle().opacity}) 0%, 
                  rgba(40, 10, 10, ${getMouthStyle().opacity! * 1.1}) 50%,
                  rgba(20, 5, 5, ${getMouthStyle().opacity! * 0.9}) 100%)`,
                transition: 'all 0.05s ease-out',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          )}
        </div>
        
        {/* Speaking indicator removed for realism */}
        
        {/* Emotion indicator */}
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: getEmotionColor() }}
          title={`Émotion: ${emotion}`}
        />
      </div>
      
      {/* Name label */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
        <div 
          className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg"
          style={{ backgroundColor: getEmotionColor() }}
        >
          Samy {isSpeaking ? '🗣️' : '💭'}
        </div>
      </div>
    </div>
  );
};