import { useAccount, useConnect as useWagmiConnect, useDisconnect } from "wagmi";
import { useModal } from "connectkit";
import { useCallback } from "react";

export function useConnect() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { setOpen } = useModal();

  const openConnectModal = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const formatAddress = useCallback((addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  return {
    address,
    isConnected,
    isConnecting,
    chain,
    disconnect: handleDisconnect,
    openModal: openConnectModal,
    formatAddress,
  };
}