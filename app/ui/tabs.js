// Gestionnaire d'onglets
export class TabsManager {
  constructor() {
    // au départ, on est sur l'onglet des boosters et on configure les onglets
    this.currentTab = 'boosters';
    this.setupTabs();
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(targetTab) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Activer l'onglet cible
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
    document.querySelector(`#tab-${targetTab}`).classList.add('active');
    
    this.currentTab = targetTab;
    
    // Événement personnalisé pour notifier le changement d'onglet (peut être utile pour d'autres composants, mais
    // on n'utilise pas sah)
    document.dispatchEvent(new CustomEvent('tabChanged', { 
      detail: { tab: targetTab } 
    }));
  }

}
