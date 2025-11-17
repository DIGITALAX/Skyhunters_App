import { SetStateAction } from "react";
import { Market, NetworkConfig } from "../../Common/types/common.types";

export type MarketDetailsProps = {
  market: Market;
  network: NetworkConfig;
  dict: any;
};

export type ProposalProps = {
  market: Market;
  dict: any;
  getMarketInfo: () => Promise<void>;
  network: NetworkConfig;
  expireMarket: () => Promise<void>;
  expireMarketLoading: boolean;
};

export type BlacklistProps = {
  market: Market;
  dict: any;
  getMarketInfo: () => Promise<void>;
  network: NetworkConfig;
};

export type OrderProps = {
  ordersTab: "all" | "my";
  setOrdersTab: (e: SetStateAction<"all" | "my">) => void;
  market: Market;
  network: NetworkConfig;
  cancelOrder: (orderId: string) => Promise<void>;
  cancelOrderLoading: string | null;
  fillOrder: (
    order: any,
    amount: string,
    clearFillAmount: (orderId: string) => void
  ) => Promise<void>;
  fillOrderLoading: string | null;
  userShares: {
    yesShares: bigint;
    noShares: bigint;
  };
  monaBalance: bigint;
  monaAllowance: bigint;
  dict: any;
};
