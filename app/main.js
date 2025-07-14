import { fetchPokemons } from './api.js';
import { DeckManager } from './ui/deck.js';
import { HandManager } from './ui/hand.js';
import { Timer } from './timer.js';

// État du jeu
let gameState = {
  deck: [], // On initie le deck vide
  hand: []  // On initie la main vide
};

// Managers pour la pioche et la main
let deckManager; // pour initier l'instance de DeckManager dans la fonction init
let handManager; // pour initier l'instance de HandManager dans la fonction init
let timer; // pour gérer le cooldown des tirages

// GESTION DU LOCALSTORAGE

// Sauvegarder l'état dans localStorage
function saveState() {
  const gameData = {
    deck: gameState.deck,
    hand: gameState.hand,
    lastDraw: timer.lastDraw,
    isActive: timer.isActive
  };
  localStorage.setItem('pokemonTCG_gameState', JSON.stringify(gameData));
}

// Charger l'état depuis localStorage
function loadState() {
  const savedData = localStorage.getItem('pokemonTCG_gameState');
  if (savedData) {
    try {
      const gameData = JSON.parse(savedData);
      gameState.deck = gameData.deck || [];
      gameState.hand = gameData.hand || [];
      
      // Restaurer le timer si les données existent
      if (gameData.lastDraw && gameData.isActive) {
        const timePassed = Date.now() - gameData.lastDraw;
        const cooldownTime = 10 * 1000; // 10 secondes pour test
        
        if (timePassed < cooldownTime) {
          // Le cooldown est encore actif
          timer.lastDraw = gameData.lastDraw;
          timer.isActive = true;
          
          // Réactiver le timeout pour la durée restante
          setTimeout(() => {
            timer.isActive = false;
            updateTimerUI();
          }, cooldownTime - timePassed);
        }
      }
      
      return true; // État chargé avec succès
    } catch (error) {
      console.error('Erreur lors du chargement de l\'état:', error);
      return false;
    }
  }
  return false; // Pas de données sauvegardées
}

// Vider le localStorage et redémarrer une nouvelle partie
function startNewGame() {
  if (confirm('Voulez-vous vraiment commencer une nouvelle partie ?\nToutes les données actuelles seront perdues.')) {
    // Vider le localStorage
    localStorage.removeItem('pokemonTCG_gameState');
    
    // Recharger la page pour redémarrer complètement
    location.reload();
  }
}

// Fonction appelée quand une carte est tirée
function onCardDrawn() {
  deckManager.renderDeck(); // Met à jour l'affichage du deck grâce à la méthode renderDeck
  handManager.renderHandWithAnimation(); // Met à jour l'affichage de la main avec animation
  saveState(); // Sauvegarder l'état après chaque tirage
}

// Fonction pour le bouton "Tirer 5 cartes"
function setupDrawButton() {
  const drawBtn = document.getElementById('draw-btn');
  if (drawBtn) {
    drawBtn.addEventListener('click', async () => {
      // Vérifier si on peut tirer
      if (!timer.canDraw()) {
        alert(`Vous devez attendre encore ${timer.getTimeLeft()} secondes`);
        return;
      }
      
      // Désactiver le bouton pendant l'animation
      drawBtn.disabled = true;
      drawBtn.textContent = 'En cours...';

      // Afficher le timer
      updateTimerUI();
      
      await deckManager.drawMultipleCards(5);
      
      // Démarrer le cooldown
      timer.startCooldown();
      
      // Réactiver le bouton après l'animation
      drawBtn.disabled = false;
      drawBtn.textContent = 'Tirer 5 cartes';

      // Mettre à jour le timer
      updateTimerUI();
      
      // Sauvegarder l'état après le tirage de 5 cartes
      saveState();
    });
  }
}

// Mettre à jour l'UI du timer
function updateTimerUI() {
  const timerContainer = document.getElementById('timer');
  const drawBtn = document.getElementById('draw-btn');
  
  if (timerContainer && drawBtn) {
    const timeLeft = timer.getTimeLeft();
    
    if (timer.canDraw()) {
      // Timer prêt - ne rien afficher
      timerContainer.innerHTML = '';
      
      // Activer le bouton si pas en cours d'animation
      if (!drawBtn.disabled || drawBtn.textContent === 'Tirer 5 cartes') {
        drawBtn.disabled = false;
        drawBtn.className = 'draw-btn enabled';
      }
    } else {
      // Timer en cours - affichage simple
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerContainer.innerHTML = `<div class="timer-display">${minutes}:${seconds.toString().padStart(2, '0')}</div>`;
      
      // Désactiver le bouton
      drawBtn.disabled = true;
      drawBtn.className = 'draw-btn disabled';
    }
  }
}

// On récupère les pokémons et on affiche
async function init() {
  try {
    const pokemons = await fetchPokemons();
    
    // Initialiser le timer d'abord
    timer = new Timer(); // Timer pour le cooldown des tirages
    
    // Tenter de charger l'état sauvegardé
    const stateLoaded = loadState();
    
    if (!stateLoaded || gameState.deck.length === 0) {
      // Pas d'état sauvegardé ou deck vide - créer un nouveau deck
      console.log('Création d\'un nouveau deck mélangé');
      
      // Mélanger les cartes pour la pioche
      // Mélange amélioré avec l'algorithme de Fisher-Yates
      gameState.deck = [...pokemons];
      for (let i = gameState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
      }
      gameState.hand = [];
    } else {
      console.log('État chargé depuis localStorage:', { deck: gameState.deck.length, hand: gameState.hand.length });
    }
    
    // Initialiser les managers
    deckManager = new DeckManager(gameState, onCardDrawn, timer); // Passer le timer au DeckManager
    handManager = new HandManager(gameState);
    
    // Affichage initial
    deckManager.renderDeck();
    handManager.renderHand();
    
    // Configurer les boutons
    setupDrawButton();
    
    // Configurer le bouton Nouvelle partie
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', startNewGame);
    }
    
    // Initialiser l'affichage du timer
    updateTimerUI();
    
    // Mettre à jour le timer toutes les secondes
    setInterval(updateTimerUI, 1000);
  } catch (err) {
    document.getElementById('deck').innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

init();
