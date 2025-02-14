import { useEffect, useState } from "react";

const useEquipo= () => {
  const [modulos, setModulos] = useState<[]>([]);
  const [modulosCargando, setModulosCargando] = useState<boolean>(false);

  const handleModulos = async () => {
    setModulosCargando(true);
    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setModulosCargando(false);
  };

  useEffect(() => {
    if (modulos.length < 1) {
      handleModulos();
    }
  }, []);

  return {
    modulos,
    modulosCargando,
  };
};

export default useEquipo;
