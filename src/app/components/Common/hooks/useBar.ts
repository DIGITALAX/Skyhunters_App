import { useState } from "react";
import { Pantalla } from "../types/common.types";

const useBar = () => {
  const [pantalla, setPantalla] = useState<Pantalla>(Pantalla.Chat);
  const [abrirBar, setAbrirBar] = useState<boolean>(false);

  return {
    abrirBar,
    setAbrirBar,
    pantalla,
    setPantalla,
  };
};

export default useBar;
