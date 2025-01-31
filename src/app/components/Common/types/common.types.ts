import { Account, SessionClient } from "@lens-protocol/client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SetStateAction } from "react";

export interface LensConnected {
  profile?: Account;
  sessionClient?: SessionClient;
}

export type BarProps = {
  setAbrirBar: (e: SetStateAction<boolean>) => void;
  router: AppRouterInstance;
  abrirBar: boolean;
  setPantalla: (e: SetStateAction<Pantalla>) => void;
  pantalla: Pantalla;
  dict: any;
};

export type CambioProps = {
  pantalla: Pantalla;
  dict: any;
};

export enum Pantalla {
  Estudio = "Estudio",
  Crear = "Crear",
  Agentes = "Agentes",
  Cuenta = "Cuenta",
  Chat = "Chat",
  Piscinas = "Piscinas"
}

export type CambioElementoProps = {
  dict: any;
};
