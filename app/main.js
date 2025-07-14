import { fetchPokemons } from './api.js';
import { DeckManager } from './ui/deck.js';
import { HandManager } from './ui/hand.js';

// État du jeu
let gameState = {
  deck: [], // On initie le deck vide
  hand: []  // On initie la main vide
};

// Managers pour la pioche et la main
let deckManager; // pour initier l'instance de DeckManager dans la fonction init
let handManager; // pour initier l'instance de HandManager dans la fonction init

// Fonction appelée quand une carte est tirée
function onCardDrawn() {
  deckManager.renderDeck(); // Met à jour l'affichage du deck grâce à la méthode renderDeck
  handManager.renderHandWithAnimation(); // Met à jour l'affichage de la main avec animation
}

// Fonction pour le bouton "Tirer 5 cartes"
function setupDrawButton() {
  const drawBtn = document.getElementById('draw-btn');
  if (drawBtn) {
    drawBtn.addEventListener('click', async () => {
      // Désactiver le bouton pendant l'animation
      drawBtn.disabled = true;
      drawBtn.textContent = 'Pioche en cours...';
      
      await deckManager.drawMultipleCards(5);
      
      // Réactiver le bouton après l'animation
      drawBtn.disabled = false;
      drawBtn.textContent = 'Tirer 5 cartes';
    });
  }
}

// On récupère les pokémons et on affiche
async function init() {
  try {
    const pokemons = await fetchPokemons();
    
    // Mélanger les cartes pour la pioche
    // Mélange amélioré avec l'algorithme de Fisher-Yates
    gameState.deck = [...pokemons];
    for (let i = gameState.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
    }
    gameState.hand = [];
    
    // Initialiser les managers
    deckManager = new DeckManager(gameState, onCardDrawn);
    handManager = new HandManager(gameState);
    
    // Affichage initial
    deckManager.renderDeck();
    handManager.renderHand();
    
    // Configurer le bouton
    setupDrawButton();
  } catch (err) {
    document.getElementById('deck').innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

init();
