// Génère le dos d'une carte (face cachée)
export function createCardBack(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card card-back';
  card.dataset.id = pokemon.id;
  
  card.innerHTML = `
    <div class="card-back-content">
      <div class="pokeball-logo">
        <img src="assets/pokeball-bg.svg" alt="Pokeball" />
      </div>
      <div class="card-back-text">POKEMON</div>
    </div>
  `;
  
  return card;
}

// Génère une carte Pokémon (DOM)
export function createCard(pokemon) {
  const mainType = pokemon.types && pokemon.types.length > 0 ? pokemon.types[0].toLowerCase() : 'unknown';
  const card = document.createElement('div');
  card.className = `pokemon-card type-${mainType}`;
  card.dataset.id = pokemon.id;

  // Types badges
  const typesHtml = pokemon.types && pokemon.types.length > 0
    ? pokemon.types.map(t => `<span class="pokemon-type type-${t.toLowerCase()}">${t}</span>`).join(' ')
    : '<span class="pokemon-type type-unknown">?</span>';

  card.innerHTML = `
    <div class="card-banner">
      <span class="pokemon-name">${pokemon.name}</span>
    </div>
    <div class="card-stats">
      <div class="pv-block">${pokemon.hp} PV</div>
      <div class="pc-block">${pokemon.attack} PC</div>
    </div>
    <div class="card-img-container">
      <div class="card-img-frame">
        <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-img" />
      </div>
    </div>
    <div class="card-types">${typesHtml}</div>
  `;

  return card;
}
