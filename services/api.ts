import axios from 'axios';
import { Pokemon, PokemonListItem, PokemonFullDetails } from '../types/Pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';

export async function getPokemons(limit: number, offset: number = 0): Promise<PokemonListItem[]> {
  try {
    const res = await axios.get(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
    return res.data.results;
  } catch (error) {
    console.error('Erro ao buscar lista de Pokémons:', error);
    throw new Error('Falha ao carregar Pokémons. Verifique sua conexão.');
  }
}

export async function getPokemonDetails(url: string): Promise<Pokemon> {
  try {
    const res = await axios.get(url);
    return {
      id: res.data.id,
      name: res.data.name,
      image: res.data.sprites.front_default,
      types: res.data.types.map((t: any) => t.type.name),
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do Pokémon:', error);
    throw new Error('Falha ao carregar detalhes do Pokémon.');
  }
}

export async function getPokemonFullDetails(id: number): Promise<PokemonFullDetails> {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      axios.get(`${API_BASE}/pokemon/${id}`),
      axios.get(`${API_BASE}/pokemon-species/${id}`),
    ]);

    const flavorTextEntry = speciesRes.data.flavor_text_entries.find(
      (entry: any) => entry.language.name === 'pt' || entry.language.name === 'en'
    );
    const description = flavorTextEntry
      ? flavorTextEntry.flavor_text.replace(/\f|\n/g, ' ')
      : 'Descrição não disponível.';

    return {
      id: pokemonRes.data.id,
      name: pokemonRes.data.name,
      image: pokemonRes.data.sprites.other['official-artwork'].front_default || pokemonRes.data.sprites.front_default,
      types: pokemonRes.data.types.map((t: any) => t.type.name),
      height: pokemonRes.data.height,
      weight: pokemonRes.data.weight,
      description,
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes completos do Pokémon:', error);
    throw new Error('Falha ao carregar detalhes do Pokémon.');
  }
}
