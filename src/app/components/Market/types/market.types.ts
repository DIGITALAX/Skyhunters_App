import { SetStateAction } from "react";
import { Market, NetworkConfig } from "../../Common/types/common.types";

export type MarketDetailsProps = {
  market: Market;
  network: NetworkConfig;
};

export type ProposalProps = {
  market: Market;
  getMarketInfo: () => Promise<void>;
  network: NetworkConfig;
};

export type BlacklistProps = {
  market: Market;
  getMarketInfo: () => Promise<void>;
  network: NetworkConfig;
};

export type OrderProps = {
  ordersTab: "all" | "my";
  setOrdersTab: (e: SetStateAction<"all" | "my">) => void;
  market: Market;
  network: NetworkConfig;
  cancelOrder: (orderId: string) => Promise<void>;
  orderLoading: boolean;
};
