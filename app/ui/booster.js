import { createCard, createCardBack } from './card.js';
import { fetchPokemons } from '../api.js';
import { audioManager } from '../audio.js';

// Gestionnaire d'ouverture de boosters
export class BoosterManager {
  constructor(gameState, onGameStateChanged) {
    this.gameState = gameState;
    this.onGameStateChanged = onGameStateChanged; // la fonction pour maj gameState (main, deck...) + localStorag
    this.isOpening = false;
    this.currentBooster = [];
    this.currentIndex = 0;
    this.allPokemons = null; // Cache des pokémons
  }

  // NOUVELLE MÉTHODE PRINCIPALE - Tire et ouvre un booster - y'a un fetch
  // donc la fonction est asynchrone
  // On utilise un cache pour éviter de re-fetch les pokémons à chaque fois aussi
  async drawAndOpenBooster() {
    if (this.isOpening) return; // on gère le cas où on essaie d'ouvrir un booster alors qu'un autre est déjà en cours

    try {
      // 1. Fetch les pokémons si pas encore fait (cache)
      if (!this.allPokemons) {
        console.log('🔄 Chargement des pokémons...');
        this.allPokemons = await fetchPokemons();
        console.log(`✅ ${this.allPokemons.length} pokémons chargés`);
      }

      // 2. Tirer 5 cartes aléatoirement
      const boosterCards = [];
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * this.allPokemons.length);
        boosterCards.push(this.allPokemons[randomIndex]);
      }

      // 3. Ajouter les cartes à la collection, on le fait avant d'ouvrir le modal pour que la collection soit à jour
      this.gameState.collection.push(...boosterCards);

      // 4. Callback de mise à jour unifié AVANT d'ouvrir le booster (pour sauvegarder direct aussi)
      if (this.onGameStateChanged) {
        this.onGameStateChanged();
      }

      // 5. Ouvrir le modal avec les cartes
      await this.openBooster(boosterCards);

      return boosterCards;

    } catch (error) {
      console.error('❌ Erreur lors du tirage du booster:', error);
      throw error;
    }
  }

  // Ouvrir un booster avec animation carte par carte (méthode interne)
  async openBooster(boosterCards) {
    if (this.isOpening) return;
    // pareil que drawAndOpenBooster, on ne peut pas ouvrir un booster si un autre est déjà en cours

    // on initialise les variables d'état pour toute la logique d'ouverture
    this.isOpening = true;
    this.currentBooster = boosterCards;
    this.currentIndex = 0;

    // Jouer le son d'ouverture de booster
    audioManager.playBoosterOpen();

    // Créer la modal (juste du visuel, pas de logique)
    const modal = this.createBoosterModal();
    document.body.appendChild(modal);

    // Commencer l'animation
    await this.startCardReveal();
  }

  // on crée la modal pour l'ouverture du booster
  createBoosterModal() {
    const modal = document.createElement('div');
    modal.className = 'booster-modal';
    modal.innerHTML = `
      <div class="booster-modal-content">
        <div class="booster-header">
          <h2>🎁 Booster ouvert !</h2>
          <button class="close-modal" id="close-booster">×</button>
        </div>
        
        <div class="booster-cards-container">
          <div id="booster-cards" class="booster-cards-grid"></div>
        </div>
        
        <div class="booster-actions">
          <button id="finish-booster" class="finish-btn">✨ Ajouter à la collection</button>
        </div>
      </div>
    `;

    this.setupBoosterEvents(modal);
    return modal;
  }

  // une fois la modal créée, on setup les événements
  // pour fermer la modal, terminer l'ouverture, etc.
  setupBoosterEvents(modal) {
    // Fermer la modal
    modal.querySelector('#close-booster').addEventListener('click', () => {
      this.closeBooster(modal);
    });

    // Terminer l'ouverture
    modal.querySelector('#finish-booster').addEventListener('click', () => {
      this.closeBooster(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeBooster(modal);
      }
    });
  }

  // Démarre l'animation d'ouverture du booster
  async startCardReveal() {
    // Afficher directement toutes les cartes avec animation
    await this.revealAllCards();
  }


  // fonction pour animer l'apparition d'une carte (comme dans HandManager, rien que du visuel osef)
  async animateNewCard(cardData, container) {
    // 🔊 Son de tirage de carte
    audioManager.playCardDraw();

    // Créer une carte temporaire face cachée
    const tempCard = createCardBack(cardData);
    tempCard.classList.add('card-fade-in');

    // Créer la vraie carte avec les détails
    const realCard = createCard(cardData);
    realCard.classList.add('booster-card');

    // Ajouter la carte temporaire
    container.appendChild(tempCard);

    // Attendre la fin de l'animation fade-in
    await new Promise(resolve => setTimeout(resolve, 400));

    // 🔊 Son de retournement de carte
    audioManager.playCardFlip();

    // Commencer l'animation flip
    tempCard.classList.add('card-animating');

    // Attendre la moitié de l'animation flip
    await new Promise(resolve => setTimeout(resolve, 300));

    // Remplacer par la vraie carte
    realCard.classList.add('card-animating');
    container.removeChild(tempCard);
    container.appendChild(realCard);

    // Nettoyer la classe d'animation
    setTimeout(() => {
      realCard.classList.remove('card-animating');
    }, 300);
  }

  async revealAllCards() { // on va révéler toutes les cartes du booster une par une en utilisant l'animation
    // de la fonction animateNewCard
    const modal = document.querySelector('.booster-modal');
    const cardsContainer = modal.querySelector('#booster-cards');

    // Révéler toutes les cartes une par une avec animation
    for (let i = 0; i < this.currentBooster.length; i++) {
      const cardData = this.currentBooster[i];
      await this.animateNewCard(cardData, cardsContainer);

      // Délai entre chaque carte
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  // juste la fonction pour fermer le booster
  closeBooster(modal) {
    this.isOpening = false;
    this.currentBooster = [];
    this.currentIndex = 0;

    if (modal && modal.parentNode) {
      document.body.removeChild(modal);
    }

    // Événement pour notifier la fermeture
    document.dispatchEvent(new CustomEvent('boosterClosed'));
  }
}
