// Gestionnaire d'effets sonores pour le jeu Pokemon TCG
export class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.loadSounds();
  }

  // Charger tous les effets sonores
  loadSounds() {
    this.sounds = {
      cardDraw: this.createAudio('assets/sounds/card-draw.mp3', 0.6),
      cardFlip: this.createAudio('assets/sounds/card-flip.mp3', 0.4),
      boosterOpen: this.createAudio('assets/sounds/booster-open.mp3', 0.7),
      cardAdd: this.createAudio('assets/sounds/card-add.mp3', 0.5),
      success: this.createAudio('assets/sounds/success.mp3', 0.6),
      click: this.createAudio('assets/sounds/click.mp3', 0.3),
      fight: this.createAudio('assets/sounds/fight.mp3', 0.8)
    };
  }

  // Créer un objet Audio avec gestion d'erreur
  createAudio(path, volume = 0.5) {
    try {
      const audio = new Audio(path);
      audio.volume = volume * this.volume;
      audio.preload = 'auto';
      
      // Gestion des erreurs de chargement
      audio.addEventListener('error', (e) => {
        console.warn(`⚠️ Impossible de charger l'audio: ${path}`, e);
      });
      
      return audio;
    } catch (error) {
      console.warn(`⚠️ Erreur lors de la création de l'audio: ${path}`, error);
      return null;
    }
  }

  // Jouer un effet sonore
  play(soundName, options = {}) {
    if (!this.enabled) return;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`⚠️ Son introuvable: ${soundName}`);
      return;
    }

    try {
      // Options
      const volume = options.volume !== undefined ? options.volume : 1;
      const playbackRate = options.speed || 1;
      const delay = options.delay || 0;

      const playSound = () => {
        sound.volume = (sound.volume * volume * this.volume);
        sound.playbackRate = playbackRate;
        sound.currentTime = 0; // Remettre au début
        
        const playPromise = sound.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn(`⚠️ Erreur de lecture audio (${soundName}):`, error);
          });
        }
      };

      if (delay > 0) {
        setTimeout(playSound, delay);
      } else {
        playSound();
      }
    } catch (error) {
      console.warn(`⚠️ Erreur lors de la lecture de ${soundName}:`, error);
    }
  }

  // Effets sonores spécifiques pour le jeu
  
  // Son de tirage de carte (avec légère variation)
  playCardDraw(options = {}) {
    const speed = 0.9 + Math.random() * 0.2; // Variation de vitesse
    this.play('cardDraw', { ...options, speed });
  }

  // Son de retournement de carte
  playCardFlip(options = {}) {
    this.play('cardFlip', options);
  }

  // Son d'ouverture de booster
  playBoosterOpen(options = {}) {
    this.play('boosterOpen', options);
  }

  // Son d'ajout de carte au deck
  playCardAdd(options = {}) {
    this.play('cardAdd', options);
  }

  // Son de succès
  playSuccess(options = {}) {
    this.play('success', options);
  }

  // Son de clic
  playClick(options = {}) {
    this.play('click', options);
  }

  // Son de début de combat
  playFight(options = {}) {
    this.play('fight', options);
  }

  // Arrêter un son spécifique
  stop(soundName) {
    const sound = this.sounds[soundName];
    if (sound) {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (error) {
        console.warn(`⚠️ Erreur lors de l'arrêt de ${soundName}:`, error);
      }
    }
  }

  // Arrêter le son de combat
  stopFight() {
    this.stop('fight');
  }

  // Séquence sonore pour l'ouverture de booster
  async playBoosterSequence(cardCount = 5) {
    // Son d'ouverture du booster
    this.playBoosterOpen();
    
    // Attendre un peu puis jouer les sons de cartes
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Son pour chaque carte avec délais progressifs
    for (let i = 0; i < cardCount; i++) {
      this.playCardDraw({ 
        delay: i * 600,
        volume: 0.8 + (i * 0.05) // Volume légèrement croissant
      });
      this.playCardFlip({ 
        delay: (i * 600) + 300 // Flip après le draw
      });
    }
  }

  // Contrôles audio
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    // Mettre à jour le volume de tous les sons
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.volume = sound.volume * this.volume;
      }
    });
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Générer un son synthétique si les fichiers audio ne sont pas disponibles
  generateBeep(frequency = 800, duration = 200, volume = 0.3) {
    if (!this.enabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * this.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('⚠️ Impossible de générer un son synthétique:', error);
    }
  }

  // Sons de fallback synthétiques
  playCardDrawFallback() {
    this.generateBeep(600, 150, 0.4);
    setTimeout(() => this.generateBeep(800, 100, 0.3), 100);
  }

  playCardFlipFallback() {
    this.generateBeep(400, 80, 0.3);
    setTimeout(() => this.generateBeep(700, 80, 0.3), 40);
  }

  playSuccessFallback() {
    this.generateBeep(523, 150, 0.4); // Do
    setTimeout(() => this.generateBeep(659, 150, 0.4), 150); // Mi
    setTimeout(() => this.generateBeep(784, 300, 0.4), 300); // Sol
  }
}

// Instance globale
export const audioManager = new AudioManager();
