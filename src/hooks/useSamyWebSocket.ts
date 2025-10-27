import { useState, useEffect, useCallback, useRef } from 'react';

interface SamyMessage {
  type: 'speak' | 'emotion' | 'idle';
  text?: string;
  emotion?: 'calm' | 'curious' | 'energetic';
  intensity?: number;
}

interface SamyState {
  emotion: 'calm' | 'curious' | 'energetic';
  isSpeaking: boolean;
  intensity: number;
  lastText: string;
  connected: boolean;
}

export const useSamyWebSocket = (url: string = 'ws://localhost:8080') => {
  const [state, setState] = useState<SamyState>({
    emotion: 'calm',
    isSpeaking: false,
    intensity: 0,
    lastText: '',
    connected: false,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const connect = useCallback(() => {
    try {
      console.log('🔌 Connexion à Samy WebSocket:', url);
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('✅ Connecté à Samy');
        setState(prev => ({ ...prev, connected: true }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message: SamyMessage = JSON.parse(event.data);
          console.log('📨 Message reçu:', message);
          
          if (message.type === 'speak') {
            setState(prev => ({
              ...prev,
              isSpeaking: true,
              intensity: message.intensity || 0.5,
              lastText: message.text || '',
            }));
            
            // Retour au repos après la durée du texte
            const duration = (message.text?.length || 0) * 50; // ~50ms par caractère
            setTimeout(() => {
              setState(prev => ({ ...prev, isSpeaking: false, intensity: 0 }));
            }, Math.max(duration, 1000));
          }
          
          if (message.type === 'emotion' && message.emotion) {
            setState(prev => ({ ...prev, emotion: message.emotion! }));
          }
          
          if (message.type === 'idle') {
            setState(prev => ({ ...prev, isSpeaking: false, intensity: 0 }));
          }
        } catch (error) {
          console.error('❌ Erreur parsing message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
      };
      
      ws.onclose = () => {
        console.log('🔌 Déconnecté de Samy');
        setState(prev => ({ ...prev, connected: false }));
        
        // Reconnexion automatique après 3 secondes
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Tentative de reconnexion...');
          connect();
        }, 3000);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Erreur connexion WebSocket:', error);
    }
  }, [url]);
  
  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
  
  const sendMessage = useCallback((message: SamyMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket non connecté');
    }
  }, []);
  
  return { state, sendMessage };
};
