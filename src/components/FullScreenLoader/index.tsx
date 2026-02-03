import { CircularProgress, Box, Typography, Fade } from "@mui/material";
import { useEffect, useState } from "react";

type FullScreenLoaderProps = {
  text?: string;
};

export default function FullScreenLoader({
  text = "Carregando",
}: FullScreenLoaderProps) {
  const [dots, setDots] = useState("");

  // anima os "..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          background: "linear-gradient(180deg, #f9fafb, #eef1f5)",
          zIndex: 1300,
        }}
      >
        <CircularProgress size={52} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          {text}
          {dots}
        </Typography>
      </Box>
    </Fade>
  );
}
