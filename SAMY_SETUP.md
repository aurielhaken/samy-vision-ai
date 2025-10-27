# 🌟 Samy Vision - Interface 3D en Temps Réel

## 🎯 Vue d'ensemble

Samy est maintenant doté d'une **présence visuelle vivante** sous forme de sphère lumineuse 3D qui réagit en temps réel à ses paroles et émotions.

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

## 🐛 Dépannage

### WebSocket ne se connecte pas
```bash
# Vérifier que le serveur tourne
ps aux | grep samy-bridge

# Relancer le serveur
node samy-bridge.js
```

### say13 ne déclenche pas l'animation
```bash
# Tester l'API directement
curl -X POST http://localhost:3001/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Test"}'

# Vérifier les logs du serveur
# Devrait afficher : 🗣️ Samy parle: "Test"
```

### Sphère ne s'affiche pas
- Vérifier la console navigateur (F12)
- Vérifier que WebGL est supporté : `about:support` dans Firefox
- Essayer un autre navigateur (Chrome recommandé)

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
