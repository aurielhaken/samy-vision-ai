#!/usr/bin/env node

/**
 * 🎤 CLI pour say13 via le bridge Samy
 * 
 * Usage:
 *   node say13-cli.js "Bonjour, je suis Samy"
 *   ./say13-cli.js "Texte à dire"  (après chmod +x)
 * 
 * Le bridge doit être lancé (node samy-bridge.js)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const BRIDGE_HTTP_PORT = 3001;

async function say13Direct(text) {
  if (!text || text.trim() === '') {
    console.error('❌ Erreur: Texte vide');
    process.exit(1);
  }

  console.log(`🗣️  Say13: "${text}"`);
  
  try {
    // Exécuter directement say13 sans passer par le bridge
    await execPromise(`say13 "${text}"`);
    console.log('✅ Terminé');
  } catch (error) {
    console.error('❌ Erreur say13:', error.message);
    process.exit(1);
  }
}

async function say13ViaBridge(text) {
  if (!text || text.trim() === '') {
    console.error('❌ Erreur: Texte vide');
    process.exit(1);
  }

  console.log(`🗣️  Say13 via bridge: "${text}"`);
  
  try {
    const response = await fetch(`http://localhost:${BRIDGE_HTTP_PORT}/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('✅ Envoyé au bridge (les clients web le verront)');
  } catch (error) {
    console.error('⚠️  Bridge non disponible, exécution directe...');
    await say13Direct(text);
  }
}

// Récupérer le texte depuis les arguments
const text = process.argv.slice(2).join(' ');

if (!text) {
  console.log('Usage: node say13-cli.js "Votre texte ici"');
  console.log('');
  console.log('Options:');
  console.log('  --direct    Force l\'exécution directe de say13 (sans bridge)');
  console.log('  --bridge    Force l\'utilisation du bridge (erreur si absent)');
  process.exit(1);
}

// Déterminer le mode
const args = process.argv.slice(2);
const directMode = args.includes('--direct');
const bridgeMode = args.includes('--bridge');
const cleanText = args.filter(a => !a.startsWith('--')).join(' ');

if (directMode) {
  say13Direct(cleanText);
} else if (bridgeMode) {
  try {
    await say13ViaBridge(cleanText);
  } catch (error) {
    console.error('❌ Erreur: Le bridge doit être actif en mode --bridge');
    process.exit(1);
  }
} else {
  // Mode auto: essaie le bridge, sinon direct
  await say13ViaBridge(cleanText);
}
