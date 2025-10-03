import { SetStateAction } from "react";

export interface SuccessData {
  message: string;
  txHash?: string;
}

export interface ErrorData {
  message: string;
}

export interface AppContextType {
  showSuccess: (message: string, txHash?: string) => void;
  showError: (message: string) => void;
  hideSuccess: () => void;
  hideError: () => void;
  successData: SuccessData | null;
  errorData: ErrorData | null;
  stats: HeaderStats;
  setStats: (e: SetStateAction<HeaderStats>) => void;
}

export interface HeaderStats {
  mona: number;
  ionic: number;
  genesis: number;
  blockTimestamp?: number;
}
