import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { SamyOrb } from '@/components/SamyOrb';
import { SamyParticles } from '@/components/SamyParticles';
import { useSamyWebSocket } from '@/hooks/useSamyWebSocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Wifi, WifiOff, Sparkles, Volume2 } from 'lucide-react';

const Samy = () => {
  const { state, sendMessage } = useSamyWebSocket();
  
  const testSpeak = () => {
    sendMessage({
      type: 'speak',
      text: 'Bonjour, je suis Samy, votre assistant IA local.',
      intensity: 0.7,
    });
  };
  
  const changeEmotion = (emotion: 'calm' | 'curious' | 'energetic') => {
    sendMessage({ type: 'emotion', emotion });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-white">Samy Vision</h1>
              <p className="text-sm text-gray-400">Présence IA Locale</p>
            </div>
          </div>
          
          <Badge variant={state.connected ? "default" : "secondary"} className="gap-2">
            {state.connected ? (
              <>
                <Wifi className="w-4 h-4" />
                Connecté
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                Déconnecté
              </>
            )}
          </Badge>
        </div>
      </header>

      {/* Canvas 3D */}
      <div className="h-screen w-full">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#0a0a0a']} />
          
          {/* Lumières */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4A90E2" />
          
          {/* Environnement */}
          <Environment preset="night" />
          
          {/* Particules d'ambiance */}
          <SamyParticles />
          
          {/* Samy Orb */}
          <SamyOrb
            emotion={state.emotion}
            isSpeaking={state.isSpeaking}
            intensity={state.intensity}
          />
          
          {/* Contrôles */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            autoRotate={!state.isSpeaking}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Controls Panel */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <Card className="max-w-2xl mx-auto p-6 bg-gray-900/80 backdrop-blur-lg border-gray-700">
          <div className="space-y-4">
            {/* État actuel */}
            {state.isSpeaking && (
              <div className="flex items-center gap-3 text-primary animate-pulse">
                <Volume2 className="w-5 h-5" />
                <span className="text-sm font-medium">{state.lastText}</span>
              </div>
            )}
            
            {/* Boutons de test */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={testSpeak} className="gap-2">
                <Volume2 className="w-4 h-4" />
                Test Parole
              </Button>
              
              <Button
                variant="outline"
                onClick={() => changeEmotion('calm')}
                className={state.emotion === 'calm' ? 'border-blue-500' : ''}
              >
                😌 Calme
              </Button>
              
              <Button
                variant="outline"
                onClick={() => changeEmotion('curious')}
                className={state.emotion === 'curious' ? 'border-cyan-500' : ''}
              >
                🤔 Curieux
              </Button>
              
              <Button
                variant="outline"
                onClick={() => changeEmotion('energetic')}
                className={state.emotion === 'energetic' ? 'border-orange-500' : ''}
              >
                ⚡ Énergique
              </Button>
            </div>
            
            {/* Instructions */}
            {!state.connected && (
              <p className="text-sm text-gray-400">
                💡 Lancez le serveur WebSocket avec <code className="px-2 py-1 bg-gray-800 rounded">node samy-bridge.js</code>
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Samy;
