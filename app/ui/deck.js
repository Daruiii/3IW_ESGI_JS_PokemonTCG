import { createCardBack } from './card.js';

// Gestion de la pioche et des interactions
export class DeckManager {


  constructor(gameState, onCardDrawn, timer = null) {
    this.gameState = gameState;
    this.onCardDrawn = onCardDrawn; // met à jour l'affichage de la pioche et de la main (fonction de main.js)
    this.timer = timer; // référence au timer pour vérifier les cooldowns
    this.deckElement = document.getElementById('deck');
    this.handElement = document.getElementById('hand');
    
    this.setupHandDropZone(); // Configure la zone de drop pour la main au moment ou la classe est instanciée
  }

  // Affiche la pioche (1ère carte du dessus), préparre les interactions (drag & drop ou clic)
  // Ajoute la carte dans le DOM
  // Si la pioche est vide, affiche un message (normalement ne devrait pas arriver)
  renderDeck() {
    this.deckElement.innerHTML = '';
    
    if (this.gameState.deck.length > 0) {
      // On affiche seulement la première carte (celle du dessus)
      const topCard = this.gameState.deck[0];
      const card = createCardBack(topCard);
      
      this.setupCardInteractions(card); // Configure les interactions pour cette carte (drag & drop ou clic)
      this.deckElement.appendChild(card); // Ajouter la carte dans le DOM
    } else {
      this.deckElement.innerHTML = '<p>Pioche vide</p>'; // ne devrait pas arriver mais au cas où
    }
  }

  // Configure les interactions pour une carte de la pioche
  setupCardInteractions(card) {
    // Drag & drop
    card.draggable = true;
    card.addEventListener('dragstart', this.handleDragStart.bind(this));
    // pour expliquer en 1 ligne le this bind
    // on utilise bind pour que le this dans handleDragStart fasse référence à l'instance de DeckManager
    // et donc on peut accéder à this.gameState et this.onCardDrawn (pour mettre à jour l'affichage)

    // Clic (fonctionne sur desktop et mobile)
    card.addEventListener('click', this.handleCardClick.bind(this));
    card.style.cursor = 'pointer';
  }

  // Configure la zone de drop pour la main
  setupHandDropZone() {
    this.handElement.addEventListener('dragover', this.handleDragOver.bind(this));
    this.handElement.addEventListener('drop', this.handleDrop.bind(this));
    this.handElement.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.handElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
    // this et bind c'est comme faire (e) => this.handleDragOver(e), pour ça qu'on utilise (e) plus bas
  }

  // GESTION DU DRAG & DROP
  
  handleDragStart(e) {
    e.dataTransfer.setData('text/plain', 'deck-card');
    // pas besoin de stocker l'ID de la carte, on utilise juste un identifiant générique
    // car pour piocher on a besoin de la carte du dessus de la pioche donc trql
  }

  handleDragOver(e) {
    e.preventDefault(); // Nécessaire pour permettre le drop
  }

  handleDragEnter(e) {
    e.preventDefault();
    this.handElement.classList.add('drag-over'); 
    // Classe permettant de styliser la zone de drop quand une carte est dessus (stylé)
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.handElement.classList.remove('drag-over');
    // Enlever la classe drag-over quand la carte quitte la zone de drop
  }

  handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    // On enlève la classe drag-over dans tous les cas pour réinitialiser le style
    this.handElement.classList.remove('drag-over');
    if (data !== 'deck-card') return; // Si ce n'est pas une carte de la pioche, on ne fait rien
  
    // Piocher une carte (pas de cooldown pour les tirages individuels)
    this.drawCardFromDeck();
  }

  // GESTION DU CLIC
  
  handleCardClick(e) {
    e.preventDefault();
    
    // Piocher une carte (pas de cooldown pour les tirages individuels)
    this.drawCardFromDeck();
  }

  // LOGIQUE DE PIOCHE
  
  drawCardFromDeck() {
    if (this.gameState.deck.length > 0) {
      const cardFromDeck = this.gameState.deck.shift(); // Prendre la première carte
      // on fait shift pour enlever la carte du dessus de la pioche et
      // en même temps la récupérer dans cardFromDeck
      
      // Si la main a déjà 5 cartes, on remet la première à la fin de la pioche (demande de l'énoncé)
      if (this.gameState.hand.length >= 5) {
        const firstCardFromHand = this.gameState.hand.shift(); // pareillement, on enlève la première carte de la main
        // et on la remet à la fin de la pioche
        this.handElement.removeChild(this.handElement.firstChild); // Enlever la carte de la main du DOM
        this.gameState.deck.push(firstCardFromHand);
        // on créera une défausse plus tard en bonus
      }
      
      // Ajouter la carte à la main (grace au tableau gameState.hand récupéré par le constructeur depuis main.js)
      this.gameState.hand.push(cardFromDeck);
      
      // Notifier le changement
      this.onCardDrawn(); // renderDeck et renderHandWithAnimation sont appelées dans main.js
    }
  }

  // Fonction utilitaire pour tirer plusieurs cartes avec animation séquentielle
  async drawMultipleCards(count) {
    for (let i = 0; i < count && this.gameState.deck.length > 0; i++) {
      this.drawCardFromDeck();// on pioche une carte à chaque itération en évitant de dépasser la taille du deck
      // pour pas piocher plus de cartes que disponibles
      
      // Attendre que l'animation de la carte actuelle soit terminée avant de piocher la suivante
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1500ms = temps total d'une animation
    }
  }
}
