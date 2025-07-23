import { createCard, createCardBack } from './card.js';
import { audioManager } from '../audio.js';

// Gestion de la main du joueur
export class HandManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.handElement = document.getElementById('hand');
  }

  // Affiche la main (rendu normal, jamais utilisée dans le code mais on sait jamais)
  renderHand() {
    this.handElement.innerHTML = '';
    
    this.gameState.hand.forEach(pokemon => {
      const card = createCard(pokemon);
      this.handElement.appendChild(card);
    });
  }

  // Affiche la main avec animation pour la dernière carte
  async renderHandWithAnimation() {
    // Vider la main
    this.handElement.innerHTML = '';
    
    // Afficher toutes les cartes sauf la dernière (rendu normal)
    const handWithoutLast = this.gameState.hand.slice(0, -1);
    handWithoutLast.forEach(pokemon => {
      const card = createCard(pokemon);
      this.handElement.appendChild(card);
    });
    
    // Animer la dernière carte si elle existe
    if (this.gameState.hand.length > 0) {
      const lastCard = this.gameState.hand[this.gameState.hand.length - 1];
      await this.animateNewCard(lastCard);
    }
  }

  // Animation de la nouvelle carte ajoutée à la main
  async animateNewCard(cardData) {
    // 🔊 Son de tirage de carte
    audioManager.playCardDraw();
    
    // Créer une carte temporaire face cachée
    const tempCard = createCardBack(cardData);
    tempCard.classList.add('card-fade-in');
    
    // Créer la vraie carte avec les détails avant pour que les détails soient chargés
    const realCard = createCard(cardData);

    // L'ajouter à la main
    this.handElement.appendChild(tempCard);
    
    // Attendre la fin de l'animation fade-in
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // 🔊 Son de retournement de carte
    audioManager.playCardFlip();
    
    // Commencer l'animation flip
    tempCard.classList.add('card-animating');
    
    // Attendre la moitié de l'animation flip (quand la carte est de côté)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remplacer par la vraie carte (déjà chargée)
    realCard.classList.add('card-animating');
    
    // Remplacer dans le DOM
    this.handElement.removeChild(tempCard);
    this.handElement.appendChild(realCard);
    
    // Nettoyer la classe d'animation après qu'elle soit terminée
    setTimeout(() => {
      realCard.classList.remove('card-animating');
    }, 300);
  }
}
