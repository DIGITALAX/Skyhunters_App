import { FunctionComponent, JSX, useContext } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import dynamic from "next/dynamic";
import useEstudio from "../hooks/useEstudio";
import { ModalContext } from "@/app/providers";
const Juego = dynamic(() => import("../modules/Juego"), {
  ssr: false,
});

const Estudio: FunctionComponent<CambioElementoProps> = (): JSX.Element => {
  const contexto = useContext(ModalContext);
  const { npc, setCargando, setNpc, cargando } = useEstudio(
    contexto?.escena!,
    contexto?.setEscena!
  );

  return (
    <Juego
      escena={contexto?.escena!}
      escenas={contexto?.escenas!}
      setEscenas={contexto?.setEscenas!}
      setNpc={setNpc}
      setCargando={setCargando}
      cargando={cargando}
      npc={npc}
    />
  );
};

export default Estudio;
