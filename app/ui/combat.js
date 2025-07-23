import { createCard } from './card.js';
import { audioManager } from '../audio.js';

export class CombatManager {
  constructor(gameState, onGameStateChanged) {
    this.gameState = gameState;
    this.onGameStateChanged = onGameStateChanged;
    this.playerField = document.getElementById('player-slots');
    this.enemyField = document.getElementById('enemy-slots');
    this.combatControls = document.getElementById('combat-controls');
    
    // État du combat
    this.isInCombat = false;
    this.currentTurn = 'player';
    this.enemyTeam = [];
    this.playerTeam = [];
    
    this.setupCombatControls();
  }

  setupCombatControls() {
    // Créer les contrôles de combat s'ils n'existent pas
    if (!this.combatControls) {
      this.createCombatControls();
    }
    
    this.updateCombatDisplay();
  }

  createCombatControls() {
    this.combatControls = document.createElement('div');
    this.combatControls.id = 'combat-controls';
    this.combatControls.className = 'combat-controls';
    
    // Bouton commencer combat
    const startBtn = document.createElement('button');
    startBtn.id = 'start-combat-btn';
    startBtn.innerText = '⚔️ Commencer le Combat';
    startBtn.className = 'start-combat-btn';
    this.combatControls.appendChild(startBtn);
    
    // Bouton attaquer (caché au début)
    const attackBtn = document.createElement('button');
    attackBtn.id = 'attack-btn';
    attackBtn.innerText = '⚡ Attaquer';
    attackBtn.style.display = 'none';
    this.combatControls.appendChild(attackBtn);
    
    // Status du combat
    const statusDiv = document.createElement('div');
    statusDiv.id = 'combat-status';
    statusDiv.className = 'combat-status';
    statusDiv.textContent = 'Ajoutez des cartes à votre main pour commencer le combat';
    this.combatControls.appendChild(statusDiv);
    
    const combatZone = document.getElementById('combat-zone');
    if (combatZone) {
      combatZone.appendChild(this.combatControls);
    }
    
    startBtn.addEventListener('click', this.startCombat.bind(this));
    attackBtn.addEventListener('click', this.attack.bind(this));
  }

  startCombat() {
    if (this.isInCombat) {
      this.endCombat();
      return;
    }
    
    if (this.gameState.hand.length === 0) {
      alert('Vous devez avoir des cartes dans votre main pour commencer un combat !');
      return;
    }
    
    this.isInCombat = true;
    this.currentTurn = 'player';
    
    // Jouer le son de début de combat
    audioManager.playFight();
    
    // Copier les équipes avec HP complets
    this.playerTeam = this.gameState.hand.map(pokemon => ({...pokemon, currentHp: pokemon.hp}));
    this.enemyTeam = this.getEnemyPokemons().map(pokemon => ({...pokemon, currentHp: pokemon.hp}));
    
    this.populateField(this.playerField, this.playerTeam.slice(0, 3));
    this.populateField(this.enemyField, this.enemyTeam.slice(0, 3));
    this.updateCombatDisplay();
  }

  endCombat() {
    this.isInCombat = false;
    this.currentTurn = 'player';
    this.playerTeam = [];
    this.enemyTeam = [];
    this.playerField.innerHTML = '';
    this.enemyField.innerHTML = '';
    
    // Arrêter le son de combat
    audioManager.stopFight();
    
    this.updateCombatDisplay();
  }

  updateCombatDisplay() {
    const startBtn = document.getElementById('start-combat-btn');
    const attackBtn = document.getElementById('attack-btn');
    const statusDiv = document.getElementById('combat-status');
    
    if (!startBtn || !attackBtn || !statusDiv) return;
    
    if (!this.isInCombat) {
      startBtn.style.display = 'block';
      startBtn.textContent = this.gameState.hand.length > 0 ? '⚔️ Commencer le Combat' : '⚠️ Ajoutez des cartes à votre main';
      startBtn.disabled = this.gameState.hand.length === 0;
      attackBtn.style.display = 'none';
      statusDiv.textContent = this.gameState.hand.length > 0 ? 'Prêt pour le combat !' : 'Ajoutez des cartes à votre main pour commencer';
      statusDiv.className = 'combat-status';
    } else {
      startBtn.style.display = 'block';
      startBtn.textContent = '🛑 Arrêter le Combat';
      startBtn.disabled = false;
      attackBtn.style.display = 'block';
      attackBtn.disabled = this.currentTurn !== 'player';
      
      if (this.currentTurn === 'player') {
        statusDiv.textContent = 'À votre tour ! Cliquez sur Attaquer';
        statusDiv.className = 'combat-status player-turn';
      } else {
        statusDiv.textContent = 'Tour de l\'ennemi...';
        statusDiv.className = 'combat-status enemy-turn';
      }
      
      // Vérifier les conditions de victoire
      this.checkWinConditions();
    }
  }

  populateField(fieldElement, pokemons) {
    fieldElement.innerHTML = '';
    pokemons.forEach(pokemon => {
      const card = createCard(pokemon);
      fieldElement.appendChild(card);
    });
  }

  getEnemyPokemons() {
    // For now, randomly select 3 pokemons
    return this.gameState.collection.sort(() => 0.5 - Math.random()).slice(0, 3);
  }

  attack() {
    this.executeTurn('player');
  }

  enemyAttack() {
    this.executeTurn('enemy');
  }

  async executeTurn(turn) {
    const attackerField = turn === 'player' ? this.playerField : this.enemyField;
    const defenderField = turn === 'player' ? this.enemyField : this.playerField;

    const attackerCard = attackerField.children[0];
    const defenderCard = defenderField.children[0];

    if (!attackerCard || !defenderCard) {
      this.checkWinConditions();
      return;
    }

    // Animation d'attaque
    attackerCard.classList.add('attacking');
    defenderCard.classList.add('taking-damage');

    const attackPower = parseInt(attackerCard.querySelector('.pc-block').textContent);
    const defenderHpBlock = defenderCard.querySelector('.pv-block');
    const attackerName = attackerCard.querySelector('.pokemon-name').textContent;
    const defenderName = defenderCard.querySelector('.pokemon-name').textContent;

    let defenderHp = parseInt(defenderHpBlock.textContent);
    defenderHp -= attackPower;

    // Mettre à jour le status
    const statusDiv = document.getElementById('combat-status');
    if (statusDiv) {
      statusDiv.textContent = `${attackerName} attaque ${defenderName} pour ${attackPower} dégâts !`;
    }

    // Attendre l'animation
    await new Promise(resolve => setTimeout(resolve, 600));

    if (defenderHp <= 0) {
      defenderCard.classList.add('ko');
      await new Promise(resolve => setTimeout(resolve, 500));
      defenderField.removeChild(defenderCard);
      if (statusDiv) {
        statusDiv.textContent = `${defenderName} est KO !`;
      }
    } else {
      defenderHpBlock.textContent = `${defenderHp} PV`;
    }

    // Nettoyer les animations
    attackerCard.classList.remove('attacking');
    defenderCard.classList.remove('taking-damage');

    // Changer de tour
    this.currentTurn = this.currentTurn === 'player' ? 'enemy' : 'player';
    this.updateCombatDisplay();

    // Tour de l'ennemi automatique après un délai
    if (this.currentTurn === 'enemy' && this.isInCombat) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (this.isInCombat) {
        this.enemyAttack();
      }
    }
  }

  checkWinConditions() {
    if (!this.isInCombat) return;
    
    const playerCardsLeft = this.playerField.children.length;
    const enemyCardsLeft = this.enemyField.children.length;
    
    if (playerCardsLeft === 0) {
      this.showGameResult('Défaite ! Tous vos Pokémon ont été vaincus.');
      // Enregistrer la défaite
      if (window.addCombatResult) {
        window.addCombatResult(false);
      }
      this.endCombat();
    } else if (enemyCardsLeft === 0) {
      this.showGameResult('Victoire ! Vous avez vaincu tous les Pokémon ennemis !');
      // Enregistrer la victoire
      if (window.addCombatResult) {
        window.addCombatResult(true);
      }
      this.endCombat();
    }
  }

  showGameResult(message) {
    const statusDiv = document.getElementById('combat-status');
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.className = 'combat-status';
    }
    alert(message);
  }

  // Méthode publique pour mettre à jour l'affichage quand l'état du jeu change
  refresh() {
    this.updateCombatDisplay();
  }
}
