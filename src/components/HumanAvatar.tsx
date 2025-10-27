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

    let lastShapeChange = Date.now();
    const shapes: MouthShape[] = ['closed', 'slight', 'open', 'wide', 'open', 'slight'];
    let shapeIndex = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastShapeChange;
      
      // Changer la forme de bouche basée sur l'intensité (plus rapide = plus intense)
      const changeSpeed = 150 - (intensity * 50); // 150ms à 50ms selon intensité
      
      if (elapsed > changeSpeed) {
        // Sélection intelligente basée sur l'intensité
        if (intensity > 0.7) {
          setMouthShape(shapes[Math.floor(Math.random() * shapes.length)]);
        } else if (intensity > 0.4) {
          setMouthShape((['slight', 'open', 'slight'] as MouthShape[])[Math.floor(Math.random() * 3)]);
        } else {
          setMouthShape((['closed', 'slight'] as MouthShape[])[Math.floor(Math.random() * 2)]);
        }
        
        // Micro-mouvements de tête
        setHeadTilt(Math.sin(now * 0.002) * 2);
        
        lastShapeChange = now;
        shapeIndex = (shapeIndex + 1) % shapes.length;
      }
      
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
    const baseBottom = 38; // Position de base (en % depuis le haut)
    
    switch (mouthShape) {
      case 'closed':
        return {
          bottom: `${baseBottom}%`,
          height: '2%',
          width: '18%',
          borderRadius: '50%',
          opacity: 0.6,
        };
      case 'slight':
        return {
          bottom: `${baseBottom - 0.5}%`,
          height: '3.5%',
          width: '16%',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          opacity: 0.7,
        };
      case 'open':
        return {
          bottom: `${baseBottom - 1}%`,
          height: '5%',
          width: '15%',
          borderRadius: '50%',
          opacity: 0.8,
        };
      case 'wide':
        return {
          bottom: `${baseBottom - 1.5}%`,
          height: '7%',
          width: '14%',
          borderRadius: '50%',
          opacity: 0.85,
        };
    }
  };

  // Définition des dents pour plus de réalisme
  const getTeethStyle = () => {
    if (mouthShape === 'closed') return null;
    
    return {
      bottom: `${38}%`,
      height: mouthShape === 'wide' ? '4%' : mouthShape === 'open' ? '2.5%' : '1.5%',
      width: mouthShape === 'wide' ? '12%' : mouthShape === 'open' ? '13%' : '14%',
      opacity: mouthShape === 'wide' ? 0.9 : mouthShape === 'open' ? 0.7 : 0.5,
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
          
          {/* Clignement des yeux */}
          <div 
            className="absolute top-[30%] left-[32%] w-[10%] h-[4%] bg-skin-tone"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,212,163,0) 0%, rgba(255,212,163,1) 50%, rgba(255,212,163,0) 100%)',
              transform: `scaleY(${eyeBlink})`,
              transition: 'transform 0.1s ease-out',
              transformOrigin: 'center',
            }}
          />
          <div 
            className="absolute top-[30%] right-[32%] w-[10%] h-[4%]"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,212,163,0) 0%, rgba(255,212,163,1) 50%, rgba(255,212,163,0) 100%)',
              transform: `scaleY(${eyeBlink})`,
              transition: 'transform 0.1s ease-out',
              transformOrigin: 'center',
            }}
          />
          
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
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 bg-current rounded-full animate-pulse"
                  style={{
                    height: `${12 + Math.sin(Date.now() * 0.01 + i) * 6}px`,
                    color: getEmotionColor(),
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s'
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
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