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
        className={`relative w-full h-full flex items-start justify-start ${
          cargando && "animate-pulse"
        }`}
      />
    </>
  );
};

export default Juego;
