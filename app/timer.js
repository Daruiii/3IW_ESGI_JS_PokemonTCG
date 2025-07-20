// Timer pour les tirages de boosters avec persistance
export class Timer {
  constructor() {
    // COOLDOWN de 5 minutes (300 secondes) comme demandé dans l'énoncé
    // Pour les tests, vous pouvez temporairement réduire à 10 secondes :
    // this.COOLDOWN = 10; // 10 secondes pour test
    this.COOLDOWN = 300; // 5 minutes (300 secondes) - VERSION FINALE
    this.lastDraw = 0;
    this.isActive = false;
  }

  // Vérifie si on peut tirer
  canDraw() {
    return !this.isActive;
  }

  // Démarre le cooldown
  startCooldown(onComplete) {
    this.isActive = true;
    this.lastDraw = Date.now();
    
    setTimeout(() => {
      this.isActive = false;
      // Appeler la callback pour sauvegarder l'état
      if (onComplete) {
        onComplete();
      }
    }, this.COOLDOWN * 1000);
  }

  // Temps restant en secondes
  getTimeLeft() {
    if (!this.isActive) return 0;
    
    const elapsed = (Date.now() - this.lastDraw) / 1000;
    return Math.max(0, Math.ceil(this.COOLDOWN - elapsed));
  }
}
