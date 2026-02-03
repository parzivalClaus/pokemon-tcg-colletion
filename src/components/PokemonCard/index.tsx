import { memo } from "react";
import LazyImage from "@/components/LazyImage";
import styles from "@/pages/List/list.module.css";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pokemon: any;
  owned: boolean;
  onClick: () => void;
  localization: {
    folder: number;
    page: number;
    position: number;
  };
};

function PokemonCard({ pokemon, owned, onClick, localization }: Props) {
  const { folder, page, position } = localization;

  return (
    <div
      className={styles.pokemonBox}
      onClick={onClick}
      style={{
        cursor: "pointer",
        opacity: owned ? 1 : 0.35,
        filter: owned ? "none" : "grayscale(100%)",
        transition: "0.2s",
        padding: 8,
      }}
    >
      <LazyImage
        src={pokemon.image}
        alt={pokemon.name}
        width={96}
        height={96}
      />

      <p>
        <span>#{pokemon.id} - </span> {pokemon.name}
      </p>

      <small style={{ fontSize: 12, opacity: 0.8 }}>
        P{folder} • F{page} • Pos {position}
      </small>
    </div>
  );
}

export default memo(PokemonCard);
