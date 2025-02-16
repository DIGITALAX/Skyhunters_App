import { useEffect, useState } from "react";
import { Pantalla } from "../types/common.types";

const useBar = () => {
  const [pantalla, setPantalla] = useState<Pantalla>(Pantalla.Chat);
  const [abrirBarIzquierdo, setAbrirBarIzquierdo] = useState<boolean>(false);
  const [abrirBarDerecho, setAbrirBarDerecho] = useState<boolean>(false);

  useEffect(() => {
    if (abrirBarIzquierdo) {
      setAbrirBarDerecho(false);
    }
  }, [abrirBarIzquierdo]);

  useEffect(() => {
    if (abrirBarDerecho) {
      setAbrirBarIzquierdo(false);
    }
  }, [abrirBarDerecho]);

  return {
    abrirBarIzquierdo,
    setAbrirBarIzquierdo,
    abrirBarDerecho,
    setAbrirBarDerecho,
    pantalla,
    setPantalla,
  };
};

export default useBar;
