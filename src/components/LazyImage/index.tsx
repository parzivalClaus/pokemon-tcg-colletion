import { useEffect, useRef, useState } from "react";
import styles from "@/pages/List/list.module.css";

type LazyImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export default function LazyImage({
  src,
  alt,
  width = 96,
  height = 96,
}: LazyImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }, // começa a carregar antes de aparecer
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        position: "relative",
      }}
    >
      {!loaded && (
        <div
          className={`${styles.pokemonSkeleton} ${
            loaded ? styles.pokemonSkeletonHidden : ""
          }`}
        />
      )}

      {visible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: loaded ? "block" : "none",
          }}
        />
      )}
    </div>
  );
}
