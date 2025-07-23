import { createCard } from './card.js';
import { audioManager } from '../audio.js';

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
      let timeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.renderCollectionGrid(); // Re-render après 300ms
        }, 300);
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
      
      // Créer l'overlay avec les boutons hover
      this.createCardHoverOverlay(card, cards[0]);
      
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
    
    // 🔊 Son d'ajout de carte au deck
    audioManager.playCardAdd();
    
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

  // Créer l'overlay avec les boutons hover pour une carte
  createCardHoverOverlay(card, cardData) {
    const overlay = document.createElement('div');
    overlay.className = 'card-hover-overlay';
    
    // Vérifier si la carte est déjà dans le deck
    const alreadyInDeck = this.isCardInBattleSystem(cardData.name);
    
    // Bouton "Ajouter au deck"
    const addButton = document.createElement('button');
    addButton.className = 'card-hover-button';
    addButton.textContent = alreadyInDeck ? 'Déjà dans le deck' : 'Ajouter au deck';
    addButton.disabled = alreadyInDeck;
    
    if (!alreadyInDeck) {
      addButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addCardToBattleDeck(cardData);
      });
    }
    
    // Bouton "Voir description"
    const descButton = document.createElement('button');
    descButton.className = 'card-hover-button description-btn';
    descButton.textContent = 'Voir description';
    descButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showCardDescription(cardData);
    });
    
    overlay.appendChild(addButton);
    overlay.appendChild(descButton);
    card.appendChild(overlay);
  }
  
  // Afficher la modal de description d'une carte
  showCardDescription(cardData) {
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'card-description-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'card-description-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'card-description-header';
    header.innerHTML = `
      <h3>${cardData.name}</h3>
      <button class="close-modal">&times;</button>
    `;
    
    // Body
    const body = document.createElement('div');
    body.className = 'card-description-body';
    
    // Image de la carte
    const imageDiv = document.createElement('div');
    imageDiv.className = 'card-description-image';
    const cardElement = createCard(cardData);
    imageDiv.appendChild(cardElement);
    
    // Détails de la carte
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'card-description-details';
    
    // Stats
    const hpRow = this.createStatRow('Points de Vie (PV)', `${cardData.hp} PV`);
    const attackRow = this.createStatRow('Points de Combat (PC)', `${cardData.attack} PC`);
    const idRow = this.createStatRow('ID Pokédex', `#${cardData.id}`);
    
    // Types
    const typesRow = document.createElement('div');
    typesRow.className = 'card-stat-row';
    typesRow.innerHTML = `
      <span class="card-stat-label">Type(s)</span>
      <div class="card-types-display">
        ${cardData.types ? cardData.types.map(type => 
          `<span class="pokemon-type type-${type.toLowerCase()}">${type}</span>`
        ).join('') : '<span class="pokemon-type type-unknown">?</span>'}
      </div>
    `;
    
    detailsDiv.appendChild(hpRow);
    detailsDiv.appendChild(attackRow);
    detailsDiv.appendChild(idRow);
    detailsDiv.appendChild(typesRow);
    
    body.appendChild(imageDiv);
    body.appendChild(detailsDiv);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'card-description-actions';
    
    const addToDeckBtn = document.createElement('button');
    addToDeckBtn.className = 'card-action-btn';
    const alreadyInDeck = this.isCardInBattleSystem(cardData.name);
    addToDeckBtn.textContent = alreadyInDeck ? 'Déjà dans le deck' : 'Ajouter au deck';
    addToDeckBtn.disabled = alreadyInDeck;
    
    if (!alreadyInDeck) {
      addToDeckBtn.addEventListener('click', () => {
        this.addCardToBattleDeck(cardData);
        modal.remove();
      });
    }
    
    actions.appendChild(addToDeckBtn);
    
    // Assembler la modal
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(actions);
    modal.appendChild(modalContent);
    
    // Ajouter au DOM
    document.body.appendChild(modal);
    
    // Gérer la fermeture
    const closeBtn = header.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Fermer avec Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
  
  // Créer une ligne de statistique pour la modal de description
  createStatRow(label, value) {
    const row = document.createElement('div');
    row.className = 'card-stat-row';
    row.innerHTML = `
      <span class="card-stat-label">${label}</span>
      <span class="card-stat-value">${value}</span>
    `;
    return row;
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
