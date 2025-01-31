import { SetStateAction, useEffect, useState } from "react";

const useEstudio = (
  escena: string,
  setEscena: (e: SetStateAction<undefined | string>) => void
) => {
  const [npc, setNpc] = useState<string | undefined>("Gabriel");
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    if (!escena) {
      setEscena(
        localStorage?.getItem("escena") !== "" &&
          localStorage?.getItem("escena") !== null &&
          localStorage?.getItem("escena") !== undefined
          ? (localStorage?.getItem("escena") as string)
          : "estudio abierto de trabajo"
      );
    }
  }, []);

  return {
    npc,
    setNpc,
    cargando,
    setCargando,
  };
};

export default useEstudio;
