import { useState, useEffect } from 'react';

interface HumanAvatarProps {
  emotion: 'calm' | 'curious' | 'energetic';
  isSpeaking: boolean;
  intensity: number;
}

export const HumanAvatar = ({ emotion, isSpeaking, intensity }: HumanAvatarProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  // Animation frames pour la parole
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 4);
    }, 200);

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

  const getMouthShape = () => {
    if (!isSpeaking) return 'M50,65 Q55,75 60,65';
    
    const frames = [
      'M50,65 Q55,70 60,65', // Frame 0 - bouche fermée
      'M50,62 Q55,72 60,62', // Frame 1 - bouche ouverte
      'M48,65 Q55,75 62,65', // Frame 2 - bouche large
      'M50,63 Q55,70 60,63'  // Frame 3 - bouche mi-ouverte
    ];
    
    return frames[currentFrame];
  };

  const getEyeState = () => {
    const baseEyes = emotion === 'energetic' ? 8 : 10;
    return isSpeaking ? baseEyes - 2 : baseEyes;
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
      <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40">
        <svg 
          viewBox="0 0 120 120" 
          className="w-full h-full drop-shadow-2xl"
          style={{
            filter: `drop-shadow(0 0 10px ${getEmotionColor()}60)`,
            transform: isSpeaking ? `scale(${1 + intensity * 0.1})` : 'scale(1)',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Head */}
          <ellipse 
            cx="60" 
            cy="55" 
            rx="35" 
            ry="40" 
            fill="#FFD4A3"
            stroke={getEmotionColor()}
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDuration: isSpeaking ? '0.8s' : '3s' }}
          />
          
          {/* Hair */}
          <path 
            d="M25,40 Q35,20 60,20 Q85,20 95,40 Q90,15 60,15 Q30,15 25,40" 
            fill="#8B4513"
          />
          
          {/* Eyes */}
          <ellipse cx="45" cy="45" rx="6" ry={getEyeState()} fill="#333" />
          <ellipse cx="75" cy="45" rx="6" ry={getEyeState()} fill="#333" />
          
          {/* Eye highlights */}
          <circle cx="47" cy="42" r="2" fill="white" />
          <circle cx="77" cy="42" r="2" fill="white" />
          
          {/* Eyebrows */}
          <path 
            d="M38,35 Q45,32 52,35" 
            stroke="#8B4513" 
            strokeWidth="3" 
            fill="none"
            style={{
              transform: emotion === 'energetic' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.3s ease'
            }}
          />
          <path 
            d="M68,35 Q75,32 82,35" 
            stroke="#8B4513" 
            strokeWidth="3" 
            fill="none"
            style={{
              transform: emotion === 'energetic' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.3s ease'
            }}
          />
          
          {/* Nose */}
          <path d="M60,50 L58,58 L62,58 Z" fill="#FFB380" />
          
          {/* Mouth */}
          <path 
            d={getMouthShape()}
            stroke={getEmotionColor()}
            strokeWidth="3" 
            fill="none"
            style={{
              transition: 'all 0.2s ease-out'
            }}
          />
          
          {/* Neck */}
          <rect x="50" y="90" width="20" height="15" fill="#FFD4A3" />
          
          {/* Collar */}
          <rect x="45" y="105" width="30" height="8" fill={getEmotionColor()} rx="2" />
        </svg>
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-current rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.sin(Date.now() * 0.01 + i) * 4}px`,
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
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: getEmotionColor() }}
          title={`Émotion: ${emotion}`}
        />
      </div>
      
      {/* Name label */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <div 
          className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg"
          style={{ backgroundColor: getEmotionColor() }}
        >
          Samy {isSpeaking ? '🗣️' : '💭'}
        </div>
      </div>
    </div>
  );
};