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
};
