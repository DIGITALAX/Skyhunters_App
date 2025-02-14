import { useState } from "react";
import { Agente } from "../types/Agentes.types";
import { AGENTES } from "@/app/lib/constants";

const useAgentes = () => {
  const [agentes, setAgentes] = useState<Agente[]>(
    AGENTES.map((cover) => ({
      cover,
    }))
  );
  const [agentesCargando, setAgentesCargando] = useState<boolean>(false);

  return {
    agentesCargando,
    agentes,
  };
};

export default useAgentes;
