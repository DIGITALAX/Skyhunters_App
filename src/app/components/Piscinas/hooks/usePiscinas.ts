import { PISCINAS } from "@/app/lib/constants";
import { useEffect, useState } from "react";

const usePiscinas = () => {
  const [piscinas, setPiscinas] =
    useState<{ cover: string; name: string }[]>(PISCINAS);
  const [piscinasCargando, setPiscinasCargando] = useState<boolean>(false);

  const handlePiscinas = async () => {
    setPiscinasCargando(true);
    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setPiscinasCargando(false);
  };

  useEffect(() => {
    if (piscinas.length < 1) {
      handlePiscinas();
    }
  }, []);

  return {
    piscinas,
    piscinasCargando,
  };
};

export default usePiscinas;
