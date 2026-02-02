import { useEffect, useState } from "react";
import {
  Drawer,
  List as MUIList,
  ListItem,
  Box,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { getGenerationById, getStatsByGeneration } from "@/utils/index";
import { supabase } from "@/lib/supabase";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import styles from "./list.module.css";
import type { User } from "@supabase/supabase-js";

type Pokemon = {
  id: number;
  name: string;
  image: string;
};

type ListProps = {
  ownedIds: number[];
  setOwnedIds: React.Dispatch<React.SetStateAction<number[]>>;
  user: User | null; // <-- adiciona aqui
};

function List({ ownedIds, setOwnedIds, user }: ListProps) {
  const [loading, setLoading] = useState(true);
  const [loadingUpdatePokemon, setLoadingUpdatePokemon] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [actionType, setActionType] = useState<"add" | "remove">("add");
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [onlyOwned, setOnlyOwned] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [onlyNotOwned, setOnlyNotOwned] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isSearching = search !== debouncedSearch;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredPokemons = pokemons.filter((p) =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const visiblePokemons = filteredPokemons.filter((p) => {
    if (onlyOwned) {
      return ownedIds.includes(p.id);
    } else if (onlyNotOwned) {
      return !ownedIds.includes(p.id);
    } else return true;
  });

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      return;
    }

    setOwnedIds([]);
  }

  async function getUserCards() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data, error } = await supabase
      .from("user_cards")
      .select("pokemon_id")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setOwnedIds(data.map((item) => item.pokemon_id));
  }

  function handleToggleClick(pokemon: Pokemon) {
    const jaTenho = ownedIds.includes(pokemon.id);
    setSelectedPokemon(pokemon);
    setActionType(jaTenho ? "remove" : "add");
    setDialogOpen(true);
  }

  async function toggleCard(pokemonId: number) {
    setLoadingUpdatePokemon(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    const jaTenho = ownedIds.includes(pokemonId);

    if (jaTenho) {
      // remover
      const { error } = await supabase
        .from("user_cards")
        .delete()
        .eq("user_id", user.id)
        .eq("pokemon_id", pokemonId);

      setLoadingUpdatePokemon(false);

      if (!error) {
        setOwnedIds((prev) => prev.filter((id) => id !== pokemonId));
      }
    } else {
      // inserir
      const { error } = await supabase.from("user_cards").insert({
        user_id: user.id,
        pokemon_id: pokemonId,
      });

      setLoadingUpdatePokemon(false);

      if (!error) {
        setOwnedIds((prev) => [...prev, pokemonId]);
      }
    }
  }

  async function getPokemons() {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
    const data = await res.json();

    const pokemons = data.results.map((p: { url: string; name: string }) => {
      const id = Number(p.url.split("/").at(-2));
      return {
        id,
        name: p.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        generation: getGenerationById(id),
      };
    });

    setPokemons(pokemons);
  }

  function getLocalization(pokemonId: number) {
    const index = pokemonId - 1;

    const folder = Math.floor(index / 540) + 1;
    const indexInFolder = index % 540;

    const page = Math.floor(indexInFolder / 9) + 1;
    const position = (indexInFolder % 9) + 1;

    return { folder, page, position };
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      await getPokemons();
      await getUserCards();
      setLoading(false);
    }

    init();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms é um bom padrão

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h4>Seja bem-vindo, {user?.user_metadata.display_name}</h4>
        <p onClick={logout}>Sair</p>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle
          sx={{
            padding: "32px",
          }}
        >
          {actionType === "add" ? "Adicionar Pokémon" : "Remover Pokémon"}
        </DialogTitle>
        <DialogContent
          sx={{
            padding: "0 32px",
          }}
        >
          {selectedPokemon && (
            <p>
              Tem certeza que deseja{" "}
              {actionType === "add" ? "marcar" : "desmarcar"} o Pokémon{" "}
              <b
                style={{
                  textTransform: "capitalize",
                }}
              >
                {selectedPokemon.name}
              </b>
              ?
            </p>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            padding: "32px",
          }}
        >
          <Button
            sx={{ marginRight: "6px" }}
            onClick={() => setDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            loading={loadingUpdatePokemon}
            variant="contained"
            color={actionType === "add" ? "primary" : "error"}
            onClick={async () => {
              if (selectedPokemon) {
                await toggleCard(selectedPokemon.id);
              }
              setDialogOpen(false);
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <MUIList style={{ width: 280 }}>
          <ListItem
            sx={{
              borderBottom: "1px solid #ededed",

              "& span": {
                fontSize: 14,
                fontWeight: 600,
              },

              "& p": {
                fontSize: 12,
              },
            }}
          >
            <ListItemText
              primary={`Total Pokémons: ${pokemons.length}`}
              secondary={`Tenho: ${ownedIds.length} | Faltam: ${pokemons.length - ownedIds.length}`}
            />
          </ListItem>

          {getStatsByGeneration(pokemons, ownedIds).map((stat) => {
            if (stat.generation === 0) {
              return;
            }

            return (
              <ListItem
                sx={{
                  borderBottom: "1px solid #ededed",

                  "& span": {
                    fontSize: 14,
                    fontWeight: 600,
                  },

                  "& p": {
                    fontSize: 12,
                  },
                }}
                key={stat.generation}
              >
                <ListItemText
                  primary={`Geração ${stat.generation} - ${stat.total} Pokémons`}
                  secondary={`Tenho: ${stat.owned} | Faltam: ${stat.missing}`}
                />
              </ListItem>
            );
          })}
        </MUIList>
      </Drawer>

      <div className={styles.content}>
        <Box>
          <Button
            sx={{
              padding: 0,
              marginBottom: 2,
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <InfoOutlineIcon sx={{ marginRight: 1 }} /> Estatísticas
          </Button>
        </Box>

        <div className={styles.search}>
          <input
            type="text"
            placeholder="Buscar Pokémon"
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
          />
        </div>

        <div className={styles.filter}>
          <label className={styles.owned}>
            Mostrar só os que eu tenho
            <input
              id="onlyOwned"
              type="checkbox"
              checked={onlyOwned}
              onChange={() => {
                setOnlyOwned((prev) => !prev);
                setOnlyNotOwned(false);
              }}
            />
            <span className={styles.checkmark} />
          </label>

          <label className={styles.owned}>
            Mostrar só os que eu NÃO tenho
            <input
              id="onlyNotOwned"
              type="checkbox"
              checked={onlyNotOwned}
              onChange={() => {
                setOnlyNotOwned((prev) => !prev);
                setOnlyOwned(false);
              }}
            />
            <span className={styles.checkmark} />
          </label>
        </div>

        {isSearching && (
          <div className={styles.searching}>
            <p>Buscando...</p>
          </div>
        )}

        {loading && (
          <div className={styles.searching}>
            <p>Buscando...</p>
          </div>
        )}

        {!loading && !isSearching && !visiblePokemons.length && (
          <div className={styles.searching}>
            <p>Não há nenhum resultado para exibir.</p>
          </div>
        )}

        <div className={styles.pokemonContainer}>
          {!isSearching &&
            !loading &&
            visiblePokemons.map((pokemon) => {
              const tenho = ownedIds.includes(pokemon.id);
              const { folder, page, position } = getLocalization(pokemon.id);

              return (
                <div
                  className={styles.pokemonBox}
                  key={pokemon.id}
                  onClick={() => handleToggleClick(pokemon)}
                  style={{
                    cursor: "pointer",
                    opacity: tenho ? 1 : 0.35,
                    filter: tenho ? "none" : "grayscale(100%)",
                    transition: "0.2s",
                    padding: 8,
                  }}
                >
                  <img src={pokemon.image} alt={pokemon.name} />

                  <p>
                    <span>#{pokemon.id} - </span> {pokemon.name}
                  </p>

                  <small style={{ fontSize: 12, opacity: 0.8 }}>
                    P{folder} • F{page} • Pos {position}
                  </small>
                </div>
              );
            })}
        </div>
      </div>

      {showScrollTop && (
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#2f7cc4",
            color: "#fff",
            border: "none",
            textAlign: "center",
            borderRadius: "50%",
            width: 35,
            height: 35,
            cursor: "pointer",
            fontSize: 24,
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          ↑
        </div>
      )}
    </div>
  );
}

export default List;
