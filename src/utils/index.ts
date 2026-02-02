export function getGenerationById(id: number): number {
  if (id >= 1 && id <= 151) return 1;
  if (id >= 152 && id <= 251) return 2;
  if (id >= 252 && id <= 386) return 3;
  if (id >= 387 && id <= 493) return 4;
  if (id >= 494 && id <= 649) return 5;
  if (id >= 650 && id <= 721) return 6;
  if (id >= 722 && id <= 809) return 7;
  if (id >= 810 && id <= 898) return 8;
  if (id >= 899 && id <= 1010) return 9;
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStatsByGeneration(pokemons: any[], ownedIds: number[]) {
  const generations = Array.from(
    new Set(pokemons.map((p) => p.generation)),
  ).sort((a, b) => a - b);

  return generations.map((gen) => {
    const pokemonsGen = pokemons.filter((p) => p.generation === gen);
    const total = pokemonsGen.length;
    const owned = pokemonsGen.filter((p) => ownedIds.includes(p.id)).length;
    const missing = total - owned;

    return {
      generation: gen,
      total,
      owned,
      missing,
    };
  });
}
