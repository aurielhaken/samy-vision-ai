# 🌟 Samy Vision - Interface 3D et Terminal say13

## 🎯 Vue d'ensemble

Samy est maintenant doté d'une **présence visuelle vivante** avec trois modes d'utilisation :
- 🌐 **Interface Web** avec avatar humain photo-réaliste
- 🎤 **Terminal CLI** pour utiliser say13 directement
- 🌉 **Bridge Local** pour synchroniser web + terminal

## 🚀 Installation et Configuration

### Prérequis
```bash
# Vérifier Node.js (v18+)
node --version

# Installer les dépendances
npm install

# Vérifier say13 (si disponible)
which say13
say13 "Test"
```

---

## 🎮 Modes d'Utilisation

### Mode 1: Interface Web uniquement (par défaut)
✅ **Aucune configuration requise** - Le bridge Cloud fonctionne automatiquement

```bash
npm run dev
# Accéder à http://localhost:5173
```

⚠️ **Limitation** : Pas d'accès à say13 depuis l'interface

---

### Mode 2: Terminal uniquement (CLI say13)
🎤 **Utilisez say13 depuis votre terminal sans interface web**

#### Installation CLI
```bash
# Rendre le script exécutable (optionnel)
chmod +x say13-cli.js
```

#### Utilisation
```bash
# Méthode 1: Avec Node
node say13-cli.js "Bonjour depuis le terminal"

# Méthode 2: Direct (après chmod +x)
./say13-cli.js "Bonjour depuis le terminal"

# Mode direct (sans bridge)
node say13-cli.js --direct "Message terminal uniquement"

# Mode bridge (avec animation web si actif)
node say13-cli.js --bridge "Message visible dans l'interface"
```

**Fonctionnement** :
- Par défaut, essaie d'utiliser le bridge (animation web)
- Si le bridge n'est pas actif, exécute say13 directement
- Aucune interface web requise !

---

### Mode 3: Web + Terminal synchronisés (Bridge Local)
🌉 **Synchronisez say13 avec l'avatar web en temps réel**

#### Étape 1: Lancer le bridge local
```bash
# Terminal 1
node samy-bridge.js
```

Vous devriez voir :
```
🚀 Serveur WebSocket Samy démarré sur ws://localhost:8081
🌐 API HTTP disponible sur http://localhost:3001
```

#### Étape 2: Lancer l'interface
```bash
# Terminal 2
npm run dev
```

#### Étape 3: Basculer sur le bridge local
Dans l'interface web, section "Samy Bridge Selector" :
1. Cliquez sur **Local**
2. La page se rechargera automatiquement

#### Étape 4: Utiliser le CLI avec le bridge
```bash
# Terminal 3
node say13-cli.js "L'avatar web bouge maintenant !"
# ou
./say13-cli.js --bridge "Animation synchronisée"
```

✅ **Avantages** :
- L'avatar web s'anime quand vous utilisez say13 dans le terminal
- Les analyses d'images déclenchent say13
- Tous les clients web sont synchronisés

---

## 🔧 Architecture

```
┌──────────────────┐
│  Interface Web   │ ← Bridge Cloud (défaut, pas de say13)
│  (React)         │ ← Bridge Local (optionnel, avec say13)
└────────┬─────────┘
         │ WebSocket (ws://localhost:8081)
         ↓
┌────────────────────┐      ┌──────────────┐
│  samy-bridge.js    │─────→│   say13      │
│  (Node Server)     │      │   (TTS)      │
└────────┬───────────┘      └──────────────┘
         ↑ HTTP (:3001)
┌────────┴───────────┐
│  say13-cli.js      │ ← Mode auto (bridge ou direct)
│  (Terminal)        │ ← Mode --direct (sans bridge)
└────────────────────┘ ← Mode --bridge (nécessite bridge)
```

---

## ✨ Fonctionnalités

### 🔮 La Sphère Vivante
- **Au repos** : Respiration douce et apaisante (pulsation lente)
- **En parlant** : Pulse selon l'intensité et la longueur du texte
- **Transitions fluides** : Changements de couleur progressifs selon l'émotion

### 🎨 Émotions et Couleurs
- **😌 Calme** : Bleu doux (#4A90E2) - État par défaut, apaisant
- **🤔 Curieux** : Cyan lumineux (#00D9FF) - Questions et découvertes
- **⚡ Énergique** : Orange ambré (#FF8C42) - Excitation et action

### 🌌 Ambiance
- Fond sombre immersif
- 1000 particules lumineuses flottantes
- Rotation automatique douce
- Contrôles 3D interactifs (zoom, rotation)

## 🚀 Installation

### 1. Dépendances installées automatiquement
```bash
@react-three/fiber@^8.18.0
@react-three/drei@^9.122.0
three@^0.160.0
```

### 2. Lancer le serveur WebSocket
```bash
# Installer les dépendances Node.js (si nécessaire)
npm install ws

# Lancer le pont Samy
node samy-bridge.js
```

Le serveur démarre sur :
- WebSocket : `ws://localhost:8080`
- API HTTP : `http://localhost:3001`

### 3. Accéder à l'interface
Ouvrez votre navigateur sur : `http://localhost:5173/samy`

## 📡 Connexion avec say13

### Méthode 1 : Intégration directe (recommandé)
Modifiez votre script `say13` pour envoyer les données au WebSocket :

```bash
#!/bin/bash
TEXT="$1"

# Envoyer au serveur Samy
curl -X POST http://localhost:3001/speak \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"$TEXT\"}"

# Exécuter votre commande TTS habituelle
# ... votre code say13 existant ...
```

### Méthode 2 : Via fichier de surveillance
```bash
# Lancer avec surveillance de fichier
node samy-bridge.js --watch

# Écrire dans le fichier pour déclencher Samy
echo "Bonjour, je suis Samy !" > samy-input.txt
```

### Méthode 3 : API HTTP directe
```bash
# Test simple
curl -X POST http://localhost:3001/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Bonjour, je suis Samy, votre assistant IA local."}'

# Avec émotion spécifique
curl -X POST http://localhost:3001/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Incroyable découverte !","emotion":"energetic","intensity":0.9}'
```

## 🎮 Utilisation

### Interface Web
1. **Indicateur de connexion** : Badge vert/gris en haut à droite
2. **Contrôles 3D** : 
   - Clic gauche + glisser = Rotation
   - Molette = Zoom
   - Rotation automatique quand Samy ne parle pas
3. **Panneau de contrôle** : Boutons de test en bas

### Boutons de test
- **Test Parole** : Déclenche une phrase de test
- **😌 Calme** : Change l'émotion en calme (bleu)
- **🤔 Curieux** : Change l'émotion en curieux (cyan)
- **⚡ Énergique** : Change l'émotion en énergique (orange)

## 🧠 Détection Automatique

Le système détecte automatiquement :

### Émotions
- **Énergique** : Présence de `!`, `⚡`, `🔥`, ou mots comme "excitant", "incroyable", "super"
- **Curieux** : Présence de `?`, `🤔`, ou mots comme "pourquoi", "comment", "intéressant"
- **Calme** : Par défaut pour tout le reste

### Intensité (0.0 à 1.0)
- Longueur du texte
- Nombre de points d'exclamation
- Nombre de points d'interrogation

## 🔧 Architecture Technique

### Composants React
- **`SamyOrb.tsx`** : Sphère 3D animée avec React-Three-Fiber
- **`SamyParticles.tsx`** : Système de particules ambiance
- **`useSamyWebSocket.ts`** : Hook de connexion WebSocket avec reconnexion auto

### Serveur Node.js
- **`samy-bridge.js`** : Pont WebSocket + API HTTP
- Reconnexion automatique des clients
- Support CORS pour développement
- Surveillance de fichier optionnelle

### Format des Messages WebSocket

```json
{
  "type": "speak",
  "text": "Bonjour, je suis Samy !",
  "emotion": "curious",
  "intensity": 0.7
}
```

Types disponibles :
- `speak` : Samy parle (avec texte, émotion, intensité)
- `emotion` : Changement d'émotion uniquement
- `idle` : Retour au repos

## 🎨 Personnalisation

### Changer les couleurs
Éditez `src/components/SamyOrb.tsx` :
```typescript
const EMOTION_COLORS = {
  calm: '#4A90E2',      // Votre couleur calme
  curious: '#00D9FF',   // Votre couleur curieuse
  energetic: '#FF8C42', // Votre couleur énergique
};
```

### Ajuster les animations
Dans `SamyOrb.tsx`, section `useFrame` :
```typescript
// Respiration au repos
const breathe = 1 + Math.sin(time * 0.8) * 0.05; // Vitesse et amplitude

// Pulse en parlant
const pulse = 1 + Math.sin(time * 8) * 0.15 * intensity; // Fréquence et intensité
```

### Modifier les particules
Dans `SamyParticles.tsx` :
```typescript
const count = 1000; // Nombre de particules
const radius = 3 + Math.random() * 5; // Distance de distribution
```

## 🎯 Cas d'usage

| Besoin | Mode recommandé | Commande |
|--------|----------------|----------|
| Analyser des images | Mode 1 (Web seul) | `npm run dev` |
| Utiliser say13 dans le terminal | Mode 2 (CLI) | `./say13-cli.js "texte"` |
| Voir l'avatar bouger avec say13 | Mode 3 (Bridge) | Bridge + CLI |
| Scripts automatisés | Mode 2 (CLI direct) | `node say13-cli.js --direct` |

---

## 🐛 Dépannage

### say13-cli.js ne fonctionne pas
```bash
# Vérifier say13
which say13
say13 "Test"

# Vérifier Node.js
node --version  # doit être v18+

# Tester en mode direct
node say13-cli.js --direct "Test sans bridge"
```

### Bridge ne se connecte pas
```bash
# Vérifier que le bridge tourne
ps aux | grep samy-bridge

# Vérifier les ports
lsof -i :8081  # WebSocket
lsof -i :3001  # HTTP

# Relancer le bridge
node samy-bridge.js
```

### L'avatar web ne bouge pas
1. S'assurer que le **Bridge Local** est sélectionné dans l'interface
2. Vérifier que `samy-bridge.js` est actif
3. Ouvrir la console (F12) pour voir les erreurs WebSocket
4. Recharger la page après avoir basculé sur Local

---

## 🚀 Déploiement Production

### Serveur distant
1. Héberger `samy-bridge.js` sur un serveur Node.js
2. Utiliser un reverse proxy (nginx) avec SSL
3. Modifier l'URL WebSocket dans `useSamyWebSocket.ts`

```typescript
// Exemple avec serveur distant
const { state } = useSamyWebSocket('wss://votre-serveur.com');
```

### Variables d'environnement
Créer `.env` :
```env
VITE_SAMY_WS_URL=ws://localhost:8080
```

Utiliser dans le hook :
```typescript
const wsUrl = import.meta.env.VITE_SAMY_WS_URL || 'ws://localhost:8080';
```

## 📚 Ressources

- **React Three Fiber** : https://docs.pmnd.rs/react-three-fiber
- **Three.js** : https://threejs.org/
- **WebSocket API** : https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## 💡 Idées d'Amélioration

- 🎵 **Audio Analysis** : Faire réagir la sphère à l'analyse spectrale de la voix
- 🌈 **Palette étendue** : Plus d'émotions et de couleurs
- 📊 **Historique** : Afficher les dernières phrases dites
- 🎤 **Micro** : Détection vocale directe dans le navigateur
- 🤖 **Avatar 3D** : Remplacer la sphère par un personnage
- 🌐 **Multi-clients** : Plusieurs interfaces synchronisées

---

Créé avec ❤️ pour Samy Vision
