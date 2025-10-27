import { useState, useEffect } from 'react';
import avatarImage from '@/assets/samy-avatar.png';

interface HumanAvatarProps {
  emotion: 'calm' | 'curious' | 'energetic';
  isSpeaking: boolean;
  intensity: number;
}

export const HumanAvatar = ({ emotion, isSpeaking, intensity }: HumanAvatarProps) => {
  const [mouthScale, setMouthScale] = useState(1);

  // Animation de la bouche pendant la parole
  useEffect(() => {
    if (!isSpeaking) {
      setMouthScale(1);
      return;
    }

    const interval = setInterval(() => {
      setMouthScale(1 + Math.random() * 0.15);
    }, 150);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const getEmotionColor = () => {
    switch (emotion) {
      case 'calm': return '#4A90E2';
      case 'curious': return '#00D4FF';
      case 'energetic': return '#FF6B35';
      default: return '#4A90E2';
    }
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
            transform: isSpeaking ? `scale(${1 + intensity * 0.05})` : 'scale(1)',
            transition: 'transform 0.3s ease-out',
            boxShadow: `0 0 30px ${getEmotionColor()}60`
          }}
        >
          <img 
            src={avatarImage} 
            alt="Samy Avatar"
            className="w-full h-full object-cover"
            style={{
              filter: emotion === 'energetic' ? 'brightness(1.1)' : 'brightness(1)'
            }}
          />
          
          {/* Speaking mouth overlay */}
          {isSpeaking && (
            <div 
              className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2"
              style={{
                width: '25%',
                height: '8%',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                transform: `translate(-50%, 0) scaleY(${mouthScale})`,
                transition: 'transform 0.15s ease-out'
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