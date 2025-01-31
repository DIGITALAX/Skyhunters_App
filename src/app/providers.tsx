"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { createContext, SetStateAction, useEffect, useState } from "react";
import { chains } from "@lens-network/sdk/viem";
import { Context, PublicClient, testnet } from "@lens-protocol/client";
import {
  StorageClient,
  testnet as storageTestnet,
} from "@lens-protocol/storage-node-client";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { Escena } from "./components/Estudio/types/Estudio.types";

export const config = createConfig(
  getDefaultConfig({
    appName: "Skyhunters",
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    appUrl: "https://skyhunters.agentmeme.xyz",
    appIcon: "https://skyhunters.agentmeme.xyz/favicon.ico",
    chains: [chains.testnet],
    transports: {
      [chains.testnet.id]: http("https://rpc.testnet.lens.dev"),
    },
    ssr: true,
  })
);

const queryClient = new QueryClient();

export const AnimationContext = createContext<
  | {
      pageChange: boolean;
      setPageChange: (e: SetStateAction<boolean>) => void;
    }
  | undefined
>(undefined);

export const ModalContext = createContext<
  | {
      clienteLens: PublicClient<Context> | undefined;
      clienteAlmacenamiento: StorageClient;
      escenas: Escena[];
      setEscenas: (e: SetStateAction<Escena[]>) => void;
      escena: undefined | string;
      setEscena: (e: SetStateAction<undefined | string>) => void;
    }
  | undefined
>(undefined);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [escena, setEscena] = useState<string>();
  const [clienteLens, setClienteLens] = useState<PublicClient | undefined>();
  const clienteAlmacenamiento = StorageClient.create(storageTestnet);
  const [escenas, setEscenas] = useState<Escena[]>([]);

  useEffect(() => {
    if (!clienteLens) {
      setClienteLens(
        PublicClient.create({
          environment: testnet,
          storage: window.localStorage,
        })
      );
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            "--ck-font-family": '"Jackey2", cursive',
          }}
        >
          <ModalContext.Provider
            value={{
              clienteLens,
              clienteAlmacenamiento,
              escena,
              escenas,
              setEscenas,
              setEscena,
            }}
          >
            {children}
          </ModalContext.Provider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
