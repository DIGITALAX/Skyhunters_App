"use client";

import { SetStateAction } from "react";

import { Escena } from "../types/Estudio.types";
import useConfig from "../hooks/useConfig";

const Juego = ({
  npc,
  escena,
  setNpc,
  setCargando,
  cargando,
  setEscenas,
  escenas,
}: {
  npc: string | undefined;
  escena: string;
  setNpc: (e: SetStateAction<string | undefined>) => void;
  setCargando: (e: SetStateAction<boolean>) => void;
  cargando: boolean;
  setEscenas: (e: SetStateAction<Escena[]>) => void;
  escenas: Escena[];
}) => {
  const { gameRef } = useConfig(
    npc,
    escena,
    setNpc,
    setCargando,
    setEscenas,
    escenas
  );

  return (
    <>
      <div
        ref={gameRef as any}
        className={`relative w-full rounded-md h-full flex items-start justify-start ${
          (cargando || escenas?.length < 1 || !escenas) &&
          "animate-pulse bg-black"
        }`}
        // style={{ width: "100%", height: "100%" }}
      />
    </>
  );
};

export default Juego;
