// Timer simple pour les tirages (sans localStorage pour commencer)
export class Timer {
  constructor() {
    this.COOLDOWN = 10; // 10 secondes pour tester l'UI
    this.lastDraw = 0;
    this.isActive = false;
  }

  // Vérifie si on peut tirer
  canDraw() {
    return !this.isActive;
  }

  // Démarre le cooldown
  startCooldown() {
    this.isActive = true;
    this.lastDraw = Date.now();
    
    setTimeout(() => {
      this.isActive = false;
    }, this.COOLDOWN * 1000);
  }

  // Temps restant en secondes
  getTimeLeft() {
    if (!this.isActive) return 0;
    
    const elapsed = (Date.now() - this.lastDraw) / 1000;
    return Math.max(0, Math.ceil(this.COOLDOWN - elapsed));
  }
}
