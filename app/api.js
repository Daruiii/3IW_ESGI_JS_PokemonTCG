const API_BASE = 'https://pokeapi.co/api/v2';

// Récupère les pokémons avec leurs infos utiles (id, name, types, image, hp, attack)
export async function fetchPokemons(limit = 150) {
  const res = await fetch(`${API_BASE}/pokemon?limit=${limit}`);
  if (!res.ok) throw new Error('Erreur lors de la récupération de la liste des pokémons');
  const data = await res.json();

  // Pour chaque pokémon, on va chercher les détails
  const detailPromises = data.results.map(async (poke) => {
    const detailRes = await fetch(poke.url);
    if (!detailRes.ok) throw new Error('Erreur lors de la récupération des détails d\'un pokémon');
    const detail = await detailRes.json();
    
    // Gestion sécurisée des stats
    const hpStat = detail.stats.find(s => s.stat.name === 'hp');
    const attackStat = detail.stats.find(s => s.stat.name === 'attack');
    
    return {
      id: detail.id,
      name: detail.name,
      types: detail.types?.map(t => t.type.name) || [],
      image: detail.sprites?.front_default || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
      hp: hpStat ? hpStat.base_stat : 50, // Valeur par défaut
      attack: attackStat ? attackStat.base_stat : 50 // Valeur par défaut
    };
  });

  return await Promise.all(detailPromises);
  // le promise all permet d'attendre que tous les détails soient récupérés avant de retourner le tableau complet
  // si une erreur survient dans l'une des promesses, elle sera propagée et gérée dans le bloc catch de main.js
}
