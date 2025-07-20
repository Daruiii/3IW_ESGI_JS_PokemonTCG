import { createCard } from './card.js';

// Gestion de la collection du joueur
export class CollectionManager {
  constructor(gameState, onGameStateChanged) {
    this.gameState = gameState;
    this.onGameStateChanged = onGameStateChanged; // la fonction pour maj gameState (main, deck...) + localStorage
  }
  
  // Méthode appelée depuis main.js pour mettre à jour l'affichage
  renderCollection() {
    // Mettre à jour le compteur
    this.updateCollectionCount();
    
    // Générer le contenu de la collection
    const collectionContainer = document.getElementById('collection-preview');
    if (!collectionContainer) return;
    
    // Juste recherche + grille
    const html = `
      <div class="collection-filters">
        <input type="text" id="collection-search" placeholder="🔍 Rechercher une carte..." />
      </div>
      <div class="collection-grid" id="collection-grid"></div>
    `;
    
    collectionContainer.innerHTML = html;
    
    // Configurer la recherche
    // ça setup le listener pour la recherche (à chaque input, on re-render la grille)
    this.setupSearch();
    
    // Rendre la collection
    this.renderCollectionGrid();
  }

  // === MÉTHODES DE RENDU ===
  
  // Mettre à jour le compteur de collection
  updateCollectionCount() {
    const countElement = document.getElementById('collection-count');
    if (countElement) {
      const totalCards = this.gameState.collection.length;
      // Compter les cartes uniques grace à un objet pour éviter les doublons
      // (on utilise le nom de la carte comme clé unique), on peut donc simplement compter les clés
      const uniqueCards = Object.keys(this.groupCardsByName(this.gameState.collection)).length;
      countElement.textContent = `${totalCards} cartes (${uniqueCards} uniques)`;
    }
  }

  // Configurer juste la recherche (VERSION SIMPLIFIÉE)
  setupSearch() {
    const searchInput = document.getElementById('collection-search');
    
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.renderCollectionGrid(); // Re-render direct
      });
    }
  }


  // Rendre la grille de collection
  renderCollectionGrid() {
    const grid = document.getElementById('collection-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (this.gameState.collection.length === 0) {
      grid.innerHTML = '<p class="empty-collection">Votre collection est vide. Tirez des boosters pour commencer !</p>';
      return;
    }

    // On réutilise la fonction groupCardsByName pour grouper les cartes par nom (pas de gachi mdr)
    const groupedCards = this.groupCardsByName(this.gameState.collection);
    // groupedCards a dont créé un objet avec tous nos pokémons uniques
    // la du coup, plus simple de les trier par nom.
    // .entries() pour récup l'objet (clé = nom, valeur = tableau de cartes) et le trier par nom
    // on utilise localeCompare pour trier les noms de manière alphabétique)
    const sortedEntries = Object.entries(groupedCards).sort(([a], [b]) => a.localeCompare(b));
    
    // Appliquer la recherche
    const searchInput = document.getElementById('collection-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filteredCards = sortedEntries.filter(([name]) => 
      name.toLowerCase().includes(searchTerm)
    );
    
    // Afficher toutes les cartes
    filteredCards.forEach(([name, cards]) => { // on utilise pas name mais pg
      const card = createCard(cards[0]);
      card.classList.add('collection-card');
      
      // Badge de quantité (c'est grace à l'objet groupedCards qu'on peut le faire)
      if (cards.length > 1) {
        const badge = document.createElement('div');
        badge.className = 'quantity-badge';
        badge.textContent = `x${cards.length}`;
        card.appendChild(badge);
      }
      
      // Interaction pour ajouter au deck
      this.setupCardInteraction(card, cards[0]);
      
      grid.appendChild(card);
    });
  }

  // Grouper les cartes par nom
  groupCardsByName(cards) {
    return cards.reduce((groups, card) => {
      const key = card.name;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(card);
      return groups;
    }, {});
  }


  // Configurer les interactions pour une carte de la collection
  setupCardInteraction(card, cardData) {
    // Vérifier si la carte est déjà dans le deck (incluant la main)
    const alreadyInDeck = this.isCardInBattleSystem(cardData.name);
    
    if (alreadyInDeck) {
      card.classList.add('already-in-deck');
      card.title = 'Cette carte est déjà dans votre deck de combat ou votre main';
      return;
    }
    
    card.addEventListener('click', () => {
      this.addCardToBattleDeck(cardData);
    });
    
    card.style.cursor = 'pointer';
    card.title = 'Cliquer pour ajouter au deck de combat';
  }

  // Vérifier si une carte est dans le système de combat (deck + main)
  isCardInBattleSystem(cardName) {
    // Vérifier si la carte est déjà dans le deck de combat ou la main
    // some permet de vérifier si au moins une carte correspond
    const inBattleDeck = this.gameState.battleDeck.some(deckCard => deckCard.name === cardName);
    const inHand = this.gameState.hand.some(handCard => handCard.name === cardName);
    return inBattleDeck || inHand;
  }

  // Ajouter une carte au deck de combat au clic
  addCardToBattleDeck(cardData) {
    // Vérifier si le deck de combat n'est pas plein (limite de 30 cartes par exemple)
    if (this.gameState.battleDeck.length >= 30) {
      this.showMessage('Le deck de combat est plein (30 cartes maximum)', 'error');
      return;
    }

    // Vérifier si la carte n'est pas déjà dans le système de combat
    if (this.isCardInBattleSystem(cardData.name)) {
      this.showMessage(`${cardData.name} est déjà dans votre deck de combat ou votre main`, 'warning');
      return;
    }

    // Ajouter la carte au deck de combat
    this.gameState.battleDeck.push(cardData);
    
    this.showMessage(`${cardData.name} ajouté au deck de combat`, 'success');
    
    // Mettre à jour l'affichage en temps réel
    this.renderCollectionGrid();
    
    // Notifier la mise à jour, même si on renderCollectionGrid() le fait déjà, cette fonction
    // met aussi à jour le localStorage et le deck de combat, on appelle renderCollection()
    // pour mettre à jour l'affichage de la collection en temps réel pour l'ux.
    if (this.onGameStateChanged) {
      this.onGameStateChanged();
    }
  }

  // Afficher un message à l'utilisateur
  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      if (messageEl.parentNode) {
        document.body.removeChild(messageEl);
      }
    }, 3000);
  }

}
