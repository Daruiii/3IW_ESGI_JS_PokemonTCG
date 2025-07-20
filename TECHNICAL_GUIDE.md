# Guide Technique - Pokemon TCG

**Pour continuer le développement du projet**

## État actuel : 11/16 points

### ✅ Ce qui est fait (11 points)

1. **Cartes pokémon affichées clairement** (1pt) ✅
   - Cartes avec image, nom, types, HP, Attack
   - Couleurs différentes selon le type du pokémon
   - Badges de quantité pour les doublons

2. **Code propre** (2pts) ✅
   - Architecture modulaire avec 10+ fichiers
   - Séparation claire des responsabilités
   - 2600+ lignes bien structurées

3. **Données persistées** (2pts) ✅
   - localStorage complet avec restauration
   - Timer persistant même après refresh
   - Sauvegarde automatique après chaque action

4. **Fonctionnalité de pioche** (1pt) ✅
   - Drag & drop de la pioche vers la main
   - Rotation automatique : main pleine → première carte retourne à la fin de la pioche
   - Exactement comme demandé dans le sujet

5. **Timer 5 minutes** (1pt) ✅
   - Cooldown de 5 minutes entre chaque tirage
   - Affichage temps restant en temps réel
   - Bouton désactivé pendant le cooldown

6. **Notions du cours** (2pts) ✅
   - DOM, fetch, Promises, ES6 modules, localStorage
   - Gestion d'événements, callbacks, animations CSS

7. **UX fluide** (2pts) ✅
   - Messages d'erreur propres (pas d'alert)
   - Animations de chargement
   - Interface responsive

### ❌ Ce qu'il manque (5 points)

1. **🎯 PRIORITÉ 1 : Détail des cartes** (2pts) - **LE PLUS RENTABLE**
   - Pop-up ou page dédiée au clic sur une carte
   - Afficher toutes les infos de la carte (stats, description, etc.)

2. **Interaction entre dresseurs** (1pt)
   - Système de notes/commentaires
   - "À la fin d'un combat, vous pouvez laisser une note au dresseur"

3. **Combat entre dresseurs** (inclus dans l'interaction)
   - Le sujet dit "à vous de voir comment modéliser cela"

4. **Soutenance** (2pts)
   - Répondre correctement aux questions du jury

## Architecture actuelle

### Structure des fichiers
```
app/
├── main.js              # Chef d'orchestre - gameState central
├── api.js               # Récupération données PokéAPI  
├── timer.js             # Cooldown 5 minutes
└── ui/
    ├── tabs.js          # Navigation onglets
    ├── booster.js       # Modal boosters + animations
    ├── collection.js    # Collection + pagination
    ├── battleDeck.js    # Deck de combat (pioche)
    ├── hand.js          # Main du joueur
    └── card.js          # Création cartes HTML
```

### Flux des données
```
Booster (5 cartes) → Collection (toutes les cartes) → BattleDeck (pioche) → Hand (5 cartes max)
```

### gameState (état central)
```javascript
gameState = {
  collection: [],    // TOUTES les cartes obtenues (permanent)
  battleDeck: [],    // Pioche du joueur (deck construit depuis collection)  
  hand: []           // Main du joueur (5 cartes max)
}
```

## Ce qu'il faut ajouter pour 16/16

### 🎯 ÉTAPE 1 : Détail des cartes (+2pts = 13/16)

**Le plus facile à implémenter**

### 🎯 ÉTAPE 2 : Système de notation (+1pt = 14/16)

**Plus complexe mais kiki va dead**

### 🎯 ÉTAPE 3 : Combat entre dresseurs

**Le sujet laisse libre choix**
