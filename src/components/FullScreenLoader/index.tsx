import { CircularProgress, Box, Typography, Fade } from "@mui/material";
import { useEffect, useState } from "react";

type FullScreenLoaderProps = {
  text?: string;
};

export default function FullScreenLoader({
  text = "Carregando",
}: FullScreenLoaderProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          backgroundColor: "rgba(43, 111, 174, 1)",
          transition: "background-color 500ms ease",
          zIndex: 1300,
        }}
      >
        <CircularProgress size={52} thickness={4} sx={{ color: "#fff" }} />

        <Typography variant="body1" sx={{ color: "#fff", opacity: 0.9 }}>
          {text}
          {dots}
        </Typography>
      </Box>
    </Fade>
  );
}
