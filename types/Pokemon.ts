export interface PokemonListItem {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export interface PokemonFullDetails {
  id: number;
  name: string;
  image: string;
  types: string[];
  height: number;
  weight: number;
  description: string;
}
