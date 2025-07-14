# GUIDE PROJET POKEMON TCG - ÉTAT ACTUEL

## ON A DÉJÀ COMBIEN DE POINTS ?

**~9/16 points**

## ✅ CE QUI EST FAIT (9 pts)

### 1. **Affichage des cartes** (1 pt) ✅
- Les cartes s'affichent avec image, nom, type
- Couleur qui change selon le type du pokemon (feu=rouge, eau=bleu, etc.)

### 2. **Code propre** (2 pts) ✅  
- Code bien organisé en modules (`main.js`, `deck.js`, `hand.js`, `timer.js`)
- Commentaires partout (on pourra en enlever pas mal en vrai), structure claire

### 3. **Persistance des données** (2 pts) ✅
- localStorage implémenté = si tu refresh la page, rien ne change
- Ton deck, ta main, ton timer sont sauvegardés

### 4. **Pioche fonctionnelle** (1 pt) ✅
- Tu peux drag & drop une carte de la pioche vers ta main
- Ou cliquer sur la carte pour la piocher
- Quand ta main est pleine (5 cartes), la première repart dans la pioche

### 5. **Timer de 5 minutes** (1 pt) ✅
- Cooldown sur le bouton "Tirer 5 cartes" (actuellement 10s pour les tests)
- Décompte qui s'affiche, bouton grisé pendant le cooldown

### 6. **Notions du cours** (2 pts) ✅
- DOM manipulation, fetch API, Promises, modules ES6, localStorage

## ❌ CE QU'IL RESTE À FAIRE (7 pts)

### 1. **Modal détails de carte** (2 pts) - **PRIORITÉ**
- Cliquer sur une carte → popup avec toutes les stats
- Le plus facile à implémenter, gros rapport points/effort

### 2. **Système de combat/interaction** (1 pt) 
- Combat entre joueurs OU système de notation/commentaires

### 3. **UX améliorée** (2 pts)
- Messages d'erreur plus propres (pas d'alert())
- Indicateurs de chargement
- Interface plus fluide

### 4. **Soutenance** (2 pts)
- Bien répondre aux questions
- Connaître le code qu'on présente

## PLAN D'ATTAQUE SUGGÉRÉ

1. **Changer le timer à 5 minutes** (dans `timer.js` ligne 4: `COOLDOWN = 300`)
2. **Modal des détails** → +2 pts facilement
3. **Messages d'erreur propres** → +2 pts UX
4. **Système de combat simple** → +1 pt

= **14/16 points** (87%) = très bien !

## STRUCTURE DU CODE

```
app/
├── main.js          # Orchestrateur principal
├── api.js           # Récupération des pokémons
├── timer.js         # Gestion du cooldown
└── ui/
    ├── deck.js      # Gestion de la pioche
    ├── hand.js      # Gestion de la main
    └── card.js      # Création des cartes
```

## CONSEILS

- **Modal détails**: Regarder le code de `card.js` pour les données disponibles
- **Combat**: Peut être simple, genre deux joueurs sélectionnent une carte et on compare les stats
- **UX**: Remplacer les `alert()` par des divs avec du CSS
- **Test**: Utiliser F12 → Application → localStorage pour voir la sauvegarde

## ATTENTION

- **Timer actuellement 10s** → changer à 5min avant rendu
- **Nouvelle partie** → bouton orange pour vider le localStorage
- **Responsive** → ça marche sur mobile