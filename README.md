# Pokemon TCG - Jeu de Cartes Collectionnables

**Projet JavaScript - 3IW ESGI**  
*Application web de Trading Card Game basée sur l'univers Pokémon*

## Description du projet

Application web interactive permettant de collectionner, organiser et jouer avec des cartes Pokémon. Le jeu intègre un système de boosters avec cooldown, une collection persistante, un système de deck building et une interface de combat.

## Fonctionnalités principales

- **Système de boosters** : Ouverture de packs avec timer de 5 minutes et animations
- **Collection de cartes** : Gestion et visualisation de toutes les cartes obtenues
- **Deck building** : Construction de decks de combat (pioche)
- **Système de pioche** : Drag & drop de la pioche vers la main (rotation automatique)
- **Détail des cartes** : *Pop-up ou page dédiée - Pas encore implémenté*
- **Combat entre dresseurs** : *Pas encore implémenté*
- **Système de notation** : *Commentaires et notes entre dresseurs - Pas encore implémenté*
- **Sauvegarde persistante** : Données conservées via localStorage
- **Interface responsive** : Compatible mobile et desktop

## Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **API** : PokéAPI pour les données des Pokémon
- **Architecture** : Modules ES6, système orienté composants
- **Stockage** : localStorage pour la persistance des données

## Installation et lancement

1. **Cloner le repository**
   ```bash
   git clone [url-du-repo]
   cd 3IW_ESGI_JS_PokemonTCG
   ```

2. **Lancer un serveur local** (obligatoire pour les modules ES6)
   ```bash
   # Avec Python 3
   python -m http.server 8000
   
   # Avec Node.js
   npx serve .
   
   # Avec Live Server (VS Code)
   # Extension Live Server + clic droit sur index.html
   ```

3. **Accéder à l'application**
   ```
   http://localhost:8000
   ```

## Utilisation

### Première utilisation
1. **Obtenir des cartes** : Cliquer sur "Ouvrir un Booster" (attendre 5min entre chaque)
2. **Explorer la collection** : Onglet "Collection" pour voir toutes vos cartes
3. **Construire un deck** : Depuis la collection, ajouter des cartes au deck de combat
4. **Jouer** : Onglet "Combat" pour piocher et gérer votre main

### Navigation
- **Boosters** : Ouverture de packs et timer
- **Collection** : Visualisation avec pagination et filtres
- **Combat** : Deck building et gestion de la main
- **Paramètres** : Reset du jeu

## Architecture technique

```
app/
├── main.js              # Point d'entrée et orchestration
├── api.js               # Interface avec PokéAPI
├── timer.js             # Gestion du cooldown
└── ui/
    ├── tabs.js          # Navigation entre onglets
    ├── booster.js       # Ouverture des boosters
    ├── collection.js    # Gestion de la collection
    ├── battleDeck.js    # Deck de combat
    ├── hand.js          # Main du joueur
    └── card.js          # Création des cartes

styles/
├── general.css          # Styles généraux
├── modals.css           # Fenêtres modales
├── card.css             # Cartes et animations
├── tabs.css             # Navigation
└── timer.css            # Timer
```

## État du gameState

```javascript
gameState = {
  collection: [],    // Toutes les cartes collectionnées
  battleDeck: [],    // Deck de combat (30 cartes max)
  hand: []           // Main de jeu (5 cartes max)
}
```

## Développement

### Structure des données
- **Cartes** : ID, nom, types, statistiques (HP, Attack), image
- **Collection** : Cartes possédées avec gestion des doublons
- **Deck** : Sélection de 30 cartes pour le combat
- **Main** : 5 cartes maximum piochées depuis le deck

### Points techniques
- **Modularité** : Architecture en composants avec responsabilités séparées
- **Persistance** : Sauvegarde automatique après chaque action
- **Animations** : Transitions CSS pour l'ouverture des boosters
- **Responsive** : Design adaptatif pour tous les écrans

## Statut du projet

### Selon le barème officiel (11/16 points actuels)

**✓ Fonctionnalités complètes :**
- Cartes pokémon affichées clairement (1pt) ✓
- Code propre et modulaire (2pts) ✓  
- Données persistées - localStorage (2pts) ✓
- Fonctionnalité de pioche drag & drop (1pt) ✓
- Timer 5 minutes respecté (1pt) ✓
- Notions du cours utilisées (2pts) ✓
- UX fluide avec messages d'erreur (2pts) ✓

**✗ À développer (5 points restants) :**
- **Détail des cartes** - Pop-up ou page dédiée (**2pts** - PRIORITÉ)
- **Interaction entre dresseurs** - Notes/commentaires (1pt)
- **Combat entre dresseurs** - Modélisation libre (inclus dans l'interaction)
- **Soutenance** - Réponses aux questions (2pts)

## Auteur

**David** - Étudiant 3IW ESGI  
Projet réalisé dans le cadre du cours JavaScript

---
*Projet éducatif - ESGI 2025*
