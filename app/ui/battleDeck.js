import { createCardBack } from './card.js';

// Gestion du deck de combat (pioche pour les batailles)
export class BattleDeckManager {
  constructor(gameState, onGameStateChanged) {
    this.gameState = gameState; // Référence à l'état du jeu actuelle
    this.onGameStateChanged = onGameStateChanged; // Callback unifié pour mettre à jour l'affichage et le localStorage
    this.battleDeckElement = document.getElementById('battle-deck');
    this.handElement = document.getElementById('hand');
    
    this.setupHandDropZone(); // Configure la zone de drop pour la main
  }

  // Affiche le deck de combat (carte du dessus)
  renderBattleDeck() {
    if (!this.battleDeckElement) return;
    
    this.battleDeckElement.innerHTML = '';
    
    // Mettre à jour le compteur
    this.updateDeckCounter();
    
    if (this.gameState.battleDeck.length === 0) {
      this.battleDeckElement.innerHTML = '<div class="empty-deck"><p>Deck de combat vide</p><small>Ajoutez des cartes depuis votre collection</small></div>';
      return;
    }

    // Afficher seulement la carte du dessus
    const topCard = this.gameState.battleDeck[0];
    const card = createCardBack(topCard);
    card.classList.add('battle-deck-card');
    
    this.setupCardInteractions(card);
    this.battleDeckElement.appendChild(card);
  }

  // Mettre à jour le compteur de cartes
  updateDeckCounter() {
    const counterElement = document.getElementById('deck-count');
    if (counterElement) {
      const count = this.gameState.battleDeck.length;
      counterElement.textContent = `${count}/30 cartes`;
      
      // Changer la couleur selon le nombre de cartes
      counterElement.className = 'deck-count';
      if (count === 0) {
        counterElement.classList.add('empty');
      } else if (count >= 30) {
        counterElement.classList.add('full');
      } else if (count >= 20) {
        counterElement.classList.add('high');
      }
    }
  }

  // Configure les interactions pour la carte du dessus
  setupCardInteractions(card) {
    // Drag & drop
    card.draggable = true;
    card.addEventListener('dragstart', this.handleDragStart.bind(this));
    
    // Clic pour piocher
    card.addEventListener('click', this.handleCardClick.bind(this));
    // bind(this) c'est l'équivalent de faire (e) => this.handleCardClick(e)
    card.style.cursor = 'pointer';
    card.title = 'Cliquer ou faire glisser pour piocher';
  }

  // Configure la zone de drop pour la main
  setupHandDropZone() {
    if (!this.handElement) return; // Vérifier si l'élément existe (normalement oui)
    
    this.handElement.addEventListener('dragover', this.handleDragOver.bind(this));
    this.handElement.addEventListener('drop', this.handleDrop.bind(this));
    this.handElement.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.handElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
  }

  // GESTION DU DRAG & DROP
  
  handleDragStart(e) {
    // dataTransfer pour identifier la carte
    // setData est utilisé pour stocker une chaîne de caractères qui identifie la carte
    // text/plain est le type MIME, on pourrait mettre n'importe quoi mais c'est juste dire : "c'est une carte de deck de combat"
    // dans ce cas, on utilise 'battle-deck-card' pour indiquer que c'est une carte du deck de combat 
    // sert juste à identifier le type de carte, pas besoin de stocker l'ID
    // servira à vérifier dans handleDrop si c'est bien une carte du deck de combat
    e.dataTransfer.setData('text/plain', 'battle-deck-card');
  }

  handleDragOver(e) {
    // sert à empêcher le comportement par défaut du navigateur qui empêche le drop
    // DragOver est appelé quand on survole la zone de drop
    e.preventDefault();
  }

  handleDragEnter(e) {
    e.preventDefault();
    // Ajouter une classe pour styliser la zone de drop (optionnel)
    // DragEnter est appelé quand on entre dans la zone de drop
    // La différence avec dragover, c'est que dragenter est appelé une seule fois quand on entre dans la zone
    // ça évite de spammer l'ajout de la classe à chaque mouvement de souris.
    this.handElement.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.preventDefault();
    // Enlever la classe quand on quitte la zone de drop
    // DragLeave est appelé quand on quitte la zone de drop
    // ça permet de styliser la zone de drop quand on n'est plus dessus
    this.handElement.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    // Récupérer le type de données
    const data = e.dataTransfer.getData('text/plain');
    this.handElement.classList.remove('drag-over');
    
    // petit check pour s'assurer que c'est bien une carte du deck de combat
    // (on l'a set dans handleDragStart donc normalement c'est toujours 'battle-deck-card')
    if (data !== 'battle-deck-card') return;
    
    this.drawCardFromBattleDeck();
  }

  // GESTION DU CLIC
  
  handleCardClick(e) {
    e.preventDefault();
    this.drawCardFromBattleDeck();
  }

  // LOGIQUE DE PIOCHE
  
  drawCardFromBattleDeck() {
    if (this.gameState.battleDeck.length === 0) return;
    
    const cardFromDeck = this.gameState.battleDeck.shift();
    // shift() permet de récupérer la première carte du deck de combat tout en l'enlevant du tableau
    
    // Si la main a déjà 5 cartes, remettre la première à la fin du deck
    if (this.gameState.hand.length >= 5) {
      const firstCardFromHand = this.gameState.hand.shift();
      // shift() permet de récupérer la première carte de la main tout en l'enlevant du tableau
      this.gameState.battleDeck.push(firstCardFromHand);
      // On remet la carte de la main à la fin du deck de combat avec push()
    }
    
    // Ajouter la carte à la main
    this.gameState.hand.push(cardFromDeck);
    
    // Notifier le changement
    if (this.onGameStateChanged) {
      this.onGameStateChanged();
    }
  }

  // Mélanger le deck de combat (lancée par le bouton "Mélanger" dans setup dans main.js)
  shuffleBattleDeck() { // On utilise le mélange de Fisher-Yates pour mélanger le deck (connu et efficace)
    const deck = this.gameState.battleDeck;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    this.renderBattleDeck(); // on utilise pas onGameStateChanged car on ne change pas la main ni le deck de combat
    console.log('Deck de combat mélangé');
  }

  // Vider le deck de combat et la main (lancée par le bouton "Vider" dans setup dans main.js)
  clearBattleDeck() {
    if (confirm('Voulez-vous vraiment vider le deck de combat et la main ?')) {
      this.gameState.battleDeck = [];
      this.gameState.hand = []; // Vider aussi la main
      this.renderBattleDeck();
      console.log('Deck de combat et main vidés');
      
      // Notifier pour mettre à jour la collection et la main
      document.dispatchEvent(new CustomEvent('battleDeckChanged')); // va permettre de mettre à jour la collection dans init()
      if (this.onGameStateChanged) { // on check si onGameStateChanged est défini au cas où il n'est pas passé
        this.onGameStateChanged(); // Met à jour l'affichage de la main et du deck de combat + sauvegarde l'état en localStorage
      }
    }
  }
}
