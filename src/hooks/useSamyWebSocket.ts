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
  error?: string | null;
}

export const useSamyWebSocket = () => {
  // Connexion par défaut au bridge Cloud (aucune config locale requise)
  const url = 'wss://qmofmorbkihcdfbaoqsh.supabase.co/functions/v1/samy-bridge';
  const [state, setState] = useState<SamyState>({
    emotion: 'calm',
    isSpeaking: false,
    intensity: 0,
    lastText: '',
    connected: false,
    error: null,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const connect = useCallback(() => {
    try {
      console.log('🔌 Connexion à Samy WebSocket:', url);
      const ws = new WebSocket(url);
      
ws.onopen = () => {
  console.log('✅ Connecté à Samy');
  setState(prev => ({ ...prev, connected: true, error: null }));
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
  setState(prev => ({ ...prev, error: 'Erreur WebSocket. Le serveur n\'est peut-être pas lancé.' }));
};
      
ws.onclose = () => {
  console.log('🔌 Déconnecté de Samy');
  setState(prev => ({ ...prev, connected: false, error: 'Connexion fermée. Tentative de reconnexion...' }));
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
    const wsOpen = wsRef.current?.readyState === WebSocket.OPEN;
    if (wsOpen) {
      wsRef.current!.send(JSON.stringify(message));
      return;
    }

    // Fallback local si non connecté: simuler l'effet côté UI
    console.warn('⚠️ WebSocket non connecté - fallback local');
    setState((prev) => {
      if (message.type === 'speak') {
        const intensity = message.intensity ?? 0.6;
        const text = message.text ?? '';
        // Démarre la parole
        const next = {
          ...prev,
          isSpeaking: true,
          intensity,
          lastText: text,
        } as SamyState;
        // Arrêt après durée approximative
        const duration = Math.max((text.length || 20) * 50, 1000);
        setTimeout(() => {
          setState((p) => ({ ...p, isSpeaking: false, intensity: 0 }));
        }, duration);
        return next;
      }
      if (message.type === 'emotion' && message.emotion) {
        return { ...prev, emotion: message.emotion } as SamyState;
      }
      if (message.type === 'idle') {
        return { ...prev, isSpeaking: false, intensity: 0 } as SamyState;
      }
      return prev;
    });
  }, []);
  
  return { state, sendMessage };
};
