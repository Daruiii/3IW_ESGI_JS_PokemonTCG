// Plus besoin d'importer fetchPokemons, c'est BoosterManager qui le fait
import { CollectionManager } from './ui/collection.js';
import { BattleDeckManager } from './ui/battleDeck.js';
import { HandManager } from './ui/hand.js';
import { TabsManager } from './ui/tabs.js';
import { BoosterManager } from './ui/booster.js';
import { CombatManager } from './ui/combat.js';
import { Timer } from './timer.js';

// État du jeu (on initialise gameState qui servira à stocker la collection, le deck de combat et la main
// il va tout stocker dans un objet gameState qui sera partagé entre les différents manager et aussi
// pour la persistance dans le localStorage, on le mettra à jour à chaque action importante)
let gameState = {
  collection: [], // Toutes les cartes possédées (permanentes dans la localStorage)
  battleDeck: [], // Deck de combat (construit à partir de la collection)
  hand: [],  // Main de combat (5 cartes max)
  // Statistiques de combat
  combatStats: {
    victories: 0,
    defeats: 0,
    history: [] // Historique des 20 derniers combats
  }
};

// Managers pour les différentes zones, ces let la servent à initialiser les managers
// On les déclare ici pour qu'ils soient accessibles dans toute la portée de ce fichier
// par contre, on ne les initialise pas tout de suite car on va attendre que le DOM soit prêt, du coup on 
// les initialise dans init() après avoir chargé l'état du jeu plus haut
let collectionManager; // Gestion de la collection
let battleDeckManager; // Gestion du deck de combat
let handManager; // Gestion de la main
let tabsManager; // Gestion des onglets
let boosterManager; // Gestion des boosters
let timer; // Gestion du cooldown des boosters
let combatManager; // Gestion du combat

// GESTION DU LOCALSTORAGE

// Sauvegarder l'état dans localStorage
// on l'utilsera assez souvent pour sauvegarder l'état du jeu après chaque action importante
// comme tirer une carte, construire le deck de combat, etc.
// On sauvegarde tout GameState pour pouvoir le restaurer à chaque fois et éviter de perdre des données
// + garder le timer pour le cooldown des boosters
function saveState() {
  const gameData = {
    collection: gameState.collection,
    battleDeck: gameState.battleDeck,
    hand: gameState.hand,
    combatStats: gameState.combatStats,
    lastDraw: timer.lastDraw,
    isActive: timer.isActive
  };
  localStorage.setItem('pokemonTCG_gameState', JSON.stringify(gameData));
}

// Charger l'état depuis localStorage
// Si des données existent, on les charge dans gameState et on restaure le timer
// Si pas de données, on commence avec une collection vide
// On retourne true si l'état a été chargé, false sinon
// On utilise cette fonction dans init() pour check si on doit tout re initialiser ou charger nos données
function loadState() {
  const savedData = localStorage.getItem('pokemonTCG_gameState');
  if (savedData) {
    try {
      const gameData = JSON.parse(savedData);
      gameState.collection = gameData.collection || [];
      gameState.battleDeck = gameData.battleDeck || [];
      gameState.hand = gameData.hand || [];
      gameState.combatStats = gameData.combatStats || {
        victories: 0,
        defeats: 0,
        history: []
      };
      
      // Restaurer le timer si les données existent
      if (gameData.lastDraw) {
        const timePassed = Date.now() - gameData.lastDraw;
        const cooldownTime = timer.COOLDOWN * 1000;
        
        if (timePassed < cooldownTime) {
          // Le cooldown est encore actif
          timer.lastDraw = gameData.lastDraw;
          timer.isActive = true;
          
          // Réactiver le timeout pour la durée restante
          setTimeout(() => {
            timer.isActive = false;
            saveState();
            updateTimerUI();
          }, cooldownTime - timePassed);
        } else {
          // Le cooldown est terminé
          timer.isActive = false;
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
// J'ai créé cette fonction pour pouvoir vider le localStorage pour mes tests
// à la base, mais peut servir aussi à l'utilisateur pour recommencer une partie donc on laisse mdr
function startNewGame() {
  if (confirm('Voulez-vous vraiment commencer une nouvelle partie ?\nToutes les données actuelles seront perdues.')) {
    // Vider le localStorage
    localStorage.removeItem('pokemonTCG_gameState');
    // Recharger la page pour redémarrer complètement
    location.reload();
  }
}

// CALLBACK UNIFIÉ - Met à jour TOUT quand l'état du jeu change
// Remplace onCardDrawn et onCollectionUpdate pour plus de simplicité
// Cette fonction est passée à tous les managers pour synchroniser l'affichage
function onGameStateChanged() {
  // Met à jour tous les affichages
  collectionManager.renderCollection();
  battleDeckManager.renderBattleDeck();
  handManager.renderHandWithAnimation(); // Toujours avec animation
  combatManager.refresh(); // Rafraîchir l'affichage du combat
  updateCombatStatsDisplay(); // Mettre à jour l'affichage des statistiques
  
  // Toujours sauvegarder
  saveState();
}


// Configure le bouton de tirage avec BoosterManager
function setupDrawButton() {
  const drawBtn = document.getElementById('draw-btn');
  if (drawBtn) {
    drawBtn.addEventListener('click', async () => {
      if (!timer.canDraw()) {
        alert(`Vous devez attendre encore ${timer.getTimeLeft()} secondes`);
        return;
      }
      
      drawBtn.disabled = true;
      drawBtn.textContent = 'En cours...';

      updateTimerUI();

      // Utiliser BoosterManager pour tirer le booster
      await boosterManager.drawAndOpenBooster();

      timer.startCooldown(() => {
        saveState();
        updateTimerUI();
      });
      
      saveState();

      drawBtn.disabled = false;
      drawBtn.textContent = 'Tirer un booster (5 cartes)';

      updateTimerUI();
    });
  }
}

// Mettre à jour l'UI du timer (clair et simple)
function updateTimerUI() {
  const timerContainer = document.getElementById('timer');
  const drawBtn = document.getElementById('draw-btn');
  
  if (timerContainer && drawBtn) {
    const timeLeft = timer.getTimeLeft();
    
    if (timer.canDraw()) {
      // Timer prêt - ne rien afficher
      timerContainer.innerHTML = '';
      
      // Activer le bouton si pas en cours d'animation
      if (!drawBtn.disabled || drawBtn.textContent === 'Tirer un booster (5 cartes)') {
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

// Configuration des boutons d'actions du deck
// pour le deck de combat (mélanger, vider)
// On utilise cette fonction pour configurer les boutons de mélange et de vidage du deck de combat
// dans init() après avoir initialisé battleDeckManager
// pour que les boutons soient configurés après que le DOM soit prêt et qu'ils
// puissent interagir avec battleDeckManager sans qu'ils soient undefined
function setupDeckActions() {
  const shuffleBtn = document.getElementById('shuffle-deck-btn');
  const clearBtn = document.getElementById('clear-deck-btn');
  
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      battleDeckManager.shuffleBattleDeck();
      saveState();
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      battleDeckManager.clearBattleDeck();
      saveState();
    });
  }
}

// ===== GESTION DE L'HISTORIQUE DES COMBATS =====

// Ajouter un résultat de combat à l'historique
function addCombatResult(isVictory) {
  const now = new Date();
  const combatResult = {
    result: isVictory ? 'victory' : 'defeat',
    date: now.toISOString(),
    displayDate: now.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  // Mettre à jour les statistiques
  if (isVictory) {
    gameState.combatStats.victories++;
  } else {
    gameState.combatStats.defeats++;
  }
  
  // Ajouter au début de l'historique
  gameState.combatStats.history.unshift(combatResult);
  
  // Garder seulement les 20 derniers combats
  if (gameState.combatStats.history.length > 20) {
    gameState.combatStats.history = gameState.combatStats.history.slice(0, 20);
  }
  
  // Sauvegarder et mettre à jour l'affichage
  saveState();
  updateCombatStatsDisplay();
}

// Mettre à jour l'affichage des statistiques de combat
function updateCombatStatsDisplay() {
  const stats = gameState.combatStats;
  const totalCombats = stats.victories + stats.defeats;
  const winRate = totalCombats > 0 ? Math.round((stats.victories / totalCombats) * 100) : 0;
  
  // Mettre à jour les compteurs
  const victoriesCount = document.getElementById('victories-count');
  const defeatsCount = document.getElementById('defeats-count');
  const totalCombatsCount = document.getElementById('total-combats-count');
  const winratePercentage = document.getElementById('winrate-percentage');
  
  if (victoriesCount) victoriesCount.textContent = stats.victories;
  if (defeatsCount) defeatsCount.textContent = stats.defeats;
  if (totalCombatsCount) totalCombatsCount.textContent = totalCombats;
  if (winratePercentage) winratePercentage.textContent = `${winRate}%`;
  
  // Mettre à jour l'historique
  updateCombatHistoryDisplay();
}

// Mettre à jour l'affichage de l'historique détaillé
function updateCombatHistoryDisplay() {
  const historyList = document.getElementById('combat-history-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  
  if (!historyList) return;
  
  const history = gameState.combatStats.history;
  
  if (history.length === 0) {
    historyList.innerHTML = '<p class="no-history">Aucun combat joué pour le moment</p>';
    if (clearHistoryBtn) clearHistoryBtn.disabled = true;
    return;
  }
  
  if (clearHistoryBtn) clearHistoryBtn.disabled = false;
  
  historyList.innerHTML = history.map(combat => {
    const isVictory = combat.result === 'victory';
    const icon = isVictory ? '🏆' : '💀';
    const text = isVictory ? 'Victoire' : 'Défaite';
    const className = isVictory ? 'victory' : 'defeat';
    
    return `
      <div class="history-item ${className}">
        <div class="history-result ${className}">
          <span>${icon}</span>
          <span>${text}</span>
        </div>
        <div class="history-date">${combat.displayDate}</div>
      </div>
    `;
  }).join('');
}

// Effacer l'historique des combats
function clearCombatHistory() {
  if (confirm('Voulez-vous vraiment effacer tout l\'historique des combats ?\nLes statistiques générales seront conservées.')) {
    gameState.combatStats.history = [];
    saveState();
    updateCombatStatsDisplay();
  }
}

// Configuration du dropdown de l'historique des combats
function setupCombatHistoryDropdown() {
  const toggleBtn = document.getElementById('toggle-history-btn');
  const historyContainer = document.getElementById('combat-history');
  
  if (toggleBtn && historyContainer) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = historyContainer.classList.contains('hidden');
      
      if (isHidden) {
        historyContainer.classList.remove('hidden');
        toggleBtn.classList.add('expanded');
        toggleBtn.textContent = '📜 Masquer l\'historique des combats';
      } else {
        historyContainer.classList.add('hidden');
        toggleBtn.classList.remove('expanded');
        toggleBtn.textContent = '📜 Voir l\'historique des combats';
      }
    });
  }
}

// Initialisation principale
// Cette fonction est appelée au chargement de la page pour initialiser le jeu
// Elle charge l'état du jeu, initialise les managers et configure les boutons ensuite
// Plus besoin d'être async maintenant que BoosterManager gère le fetch
function init() {
  try {
    // Initialiser le timer d'abord
    timer = new Timer(); // Timer pour le cooldown des boosters
    
    // Tenter de charger l'état sauvegardé sinon on commence une nouvelle partie
    const stateLoaded = loadState();
    
    if (!stateLoaded) {
      console.log('Nouveau jeu - collection vide');
      // Commencer avec une collection vide
      gameState.collection = [];
      gameState.battleDeck = [];
      gameState.hand = [];
    } else {
      console.log('État chargé depuis localStorage:', { 
        collection: gameState.collection.length, 
        battleDeck: gameState.battleDeck.length, 
        hand: gameState.hand.length 
      });
    }
    
    // Initialiser les managers et lance les constructeurs dcp.
    tabsManager = new TabsManager(); // à la création, il va configurer les onglets grace au constructeur de TabsManager
    // qui configure currentTab et lance setupTabs() pour gérer les clics sur les onglets (ez)
    collectionManager = new CollectionManager(gameState, onGameStateChanged);
    battleDeckManager = new BattleDeckManager(gameState, onGameStateChanged);
    handManager = new HandManager(gameState);
    boosterManager = new BoosterManager(gameState, onGameStateChanged);
    
    // Initialiser le gestionnaire de combat
    combatManager = new CombatManager(gameState, onGameStateChanged);

    // Affichage initial car se lance pas tout seul
    collectionManager.renderCollection();
    battleDeckManager.renderBattleDeck();
    handManager.renderHand();
    
    // Configurer les boutons après l'initialisation des managers sinon ils seraient undefined
    setupDrawButton();
    setupDeckActions();
    setupCombatHistoryDropdown();
    
    // Configurer le bouton Nouvelle partie
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', startNewGame);
    }
    
    // Affichage initial des statistiques de combat
    updateCombatStatsDisplay();
    
    // Initialiser l'affichage du timer
    updateTimerUI();
    
    // Mettre à jour le timer toutes les secondes (niveau performance, c'est léger apparemment)
    setInterval(updateTimerUI, 1000);
    
    // Écouter l'événement unifié de changement d'état
    document.addEventListener('gameStateChanged', onGameStateChanged);
    
    // Garder les anciens événements pour compatibilité (on peut les supprimer plus tard)
    document.addEventListener('boosterClosed', () => {
      collectionManager.renderCollection();
    });
    document.addEventListener('battleDeckChanged', () => {
      collectionManager.renderCollection();
    });
    
    console.log('Jeu initialisé avec succès!');
  } catch (err) {
    console.error('Erreur lors de l\'initialisation:', err);
    document.body.innerHTML = `<p style="color:red">Erreur: ${err.message}</p>`;
  }
}

// Exposer addCombatResult globalement pour que le CombatManager puisse l'utiliser
window.addCombatResult = addCombatResult;

init();
