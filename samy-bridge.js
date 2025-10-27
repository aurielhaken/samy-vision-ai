#!/usr/bin/env node

/**
 * 🌉 Pont WebSocket pour Samy Vision
 * 
 * Ce serveur Node.js fait le lien entre la commande `say13` 
 * et l'interface web 3D de Samy.
 * 
 * Usage:
 * 1. Lancer ce serveur: node samy-bridge.js
 * 2. Utiliser say13: say13 "Bonjour, je suis Samy"
 * 3. L'interface web réagit en temps réel
 */

import WebSocket, { WebSocketServer } from 'ws';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBSOCKET_PORT = 8081;
const HTTP_PORT = 3001;
const wss = new WebSocketServer({ port: WEBSOCKET_PORT });

console.log(`🚀 Serveur WebSocket Samy démarré sur ws://localhost:${WEBSOCKET_PORT}`);

// Clients connectés
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('✅ Nouveau client connecté. Total:', clients.size + 1);
  clients.add(ws);
  
  // Envoyer l'état initial
  ws.send(JSON.stringify({
    type: 'idle',
    emotion: 'calm',
  }));
  
  // IMPORTANT: Écouter les messages des clients
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Message reçu du client:', message);
      
      // Broadcaster le message à tous les clients (y compris l'émetteur)
      broadcast(message);
      
      // Si c'est un message "speak", exécuter say13
      if (message.type === 'speak' && message.text) {
        console.log(`🗣️  Exécution say13: "${message.text}"`);
        exec(`say13 "${message.text}"`, (error) => {
          if (error) {
            console.error(`❌ Erreur say13: ${error.message}`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Erreur parsing message client:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('❌ Client déconnecté. Reste:', clients.size - 1);
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ Erreur WebSocket:', error);
  });
});

// Fonction pour broadcaster à tous les clients
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Détection automatique de l'émotion basée sur le texte
function detectEmotion(text) {
  const lower = text.toLowerCase();
  
  // Énergique
  if (/[!⚡🔥💪]/.test(text) || /excit|incroyable|super|génial|wow/i.test(lower)) {
    return 'energetic';
  }
  
  // Curieux
  if (/[?🤔💡]/.test(text) || /pourquoi|comment|quoi|question|intéressant/i.test(lower)) {
    return 'curious';
  }
  
  // Calme (défaut)
  return 'calm';
}

// Calculer l'intensité basée sur la longueur et la ponctuation
function calculateIntensity(text) {
  let intensity = 0.5; // Base
  
  // Longueur
  if (text.length > 100) intensity += 0.2;
  if (text.length > 200) intensity += 0.1;
  
  // Ponctuation expressive
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  
  intensity += Math.min(exclamations * 0.1, 0.3);
  intensity += Math.min(questions * 0.05, 0.2);
  
  return Math.min(intensity, 1.0);
}

// Wrapper pour say13 qui envoie les données au WebSocket
function say13WithBridge(text) {
  const emotion = detectEmotion(text);
  const intensity = calculateIntensity(text);
  
  console.log(`🗣️  Samy parle: "${text}"`);
  console.log(`😊 Émotion: ${emotion} | Intensité: ${intensity.toFixed(2)}`);
  
  // Broadcast aux clients web
  broadcast({
    type: 'speak',
    text: text,
    emotion: emotion,
    intensity: intensity,
  });
  
  // Exécuter la vraie commande say13
  exec(`say13 "${text}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Erreur say13: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️  say13 stderr: ${stderr}`);
    }
    
    // Retour au repos après la parole
    setTimeout(() => {
      broadcast({ type: 'idle' });
    }, text.length * 50); // ~50ms par caractère
  });
}

// API HTTP simple pour tester sans say13
// http imported as ESM above
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/speak') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { text, emotion, intensity } = JSON.parse(body);
        
        broadcast({
          type: 'speak',
          text: text || 'Test',
          emotion: emotion || detectEmotion(text || ''),
          intensity: intensity || calculateIntensity(text || ''),
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(HTTP_PORT, () => {
  console.log('🌐 API HTTP disponible sur http://localhost:' + HTTP_PORT);
  console.log('📝 Testez avec: curl -X POST http://localhost:' + HTTP_PORT + '/speak -H "Content-Type: application/json" -d \'{"text":"Bonjour Samy"}\'');
});

// Surveillance d'un fichier pour déclencher say13 (optionnel)
const WATCH_FILE = path.join(__dirname, 'samy-input.txt');

if (process.argv.includes('--watch')) {
  console.log(`👀 Surveillance du fichier: ${WATCH_FILE}`);
  console.log('💡 Écrivez du texte dedans pour que Samy parle automatiquement');
  
  fs.watch(WATCH_FILE, (eventType) => {
    if (eventType === 'change') {
      fs.readFile(WATCH_FILE, 'utf8', (err, data) => {
        if (err) {
          console.error('❌ Erreur lecture fichier:', err);
          return;
        }
        
        const text = data.trim();
        if (text) {
          say13WithBridge(text);
          // Vider le fichier après lecture
          fs.writeFile(WATCH_FILE, '', () => {});
        }
      });
    }
  });
  
  // Créer le fichier s'il n'existe pas
  if (!fs.existsSync(WATCH_FILE)) {
    fs.writeFileSync(WATCH_FILE, '');
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur Samy Bridge');
  wss.close();
  server.close();
  process.exit(0);
});

// Export pour utilisation en module
export { say13WithBridge, broadcast };
