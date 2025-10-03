import { NETWORKS } from "@/app/lib/constants";
import { SetStateAction } from "react";

export type Page = "explore" | "create" | "manage" | "council";

export type NetworkConfig = (typeof NETWORKS)[keyof typeof NETWORKS];

export interface CoreContractAddresses {
  accessControl: `0x${string}`;
  council: `0x${string}`;
  mona: `0x${string}`;
  market: `0x${string}`;
  proposal: `0x${string}`;
}

export interface Market {
  id: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
  marketId: string;
  creator: string;
  uri: string;
  metadata: {
    question: string;
    source: string;
    roundingMethod: string;
    failoverSource: string;
  };
  endTime: string;
  minPrice: string;
  maxPrice: string;
  precision: string;
  isFinalized: boolean;
  isBlacklisted: boolean;
  finalAnswer: string;
  totalVolume: string;
  marketFees: string;
  buyOrders: Order[];
  sellOrders: Order[];
  proposal: Proposal;
  blacklist: Blacklist;
}

export interface Blacklist {
  market?: Market;
  deadline: string;
  yesVotes: string;
  blacklistId: string;
  noVotes: string;
  proposer: string;
  executed: boolean;
  uri: string;
  metadata: {
    reason: string;
    comments: string;
  };
  votes: Vote[];
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface Bond {
  monaAmount: string;
  isSlashed: boolean;
}

export interface Proposal {
  proposalId: string;
  proposerBond: Bond;
  disputeWindowEnds: string;
  councilWindowEnds: string;
  disputerBond: Bond;
  yesDisputeVotes?: string;
  noDisputeVotes?: string;
  proposer: string;
  disputer?: string;
  answer?: string;
  disputed: boolean;
  disputePassed: Boolean;
  finalAnswer: string;
  expired: boolean;
  votes: Vote[];
  disputeBlockNumber: string;
  disputeBlockTimestamp: string;
  disputeTransactionHash: string;
  proposalBlockNumber: string;
  proposalBlockTimestamp: string;
  proposalTransactionHash: string;
  proposerReward?: string;
  disputerReward?: string;
}

export interface Vote {
  voted: boolean;
  support: boolean;
  voter: string;
  proposal?: Proposal
  blacklist?: Blacklist
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface Order {
  market?: Market;
  price: string;
  amount: string;
  orderId: string;
  amountFilled: string;
  filled: boolean;
  filler: string;
  maker: string;
  orderType: string;
  answer: string;
  cancelled: boolean;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface TokenRequirement {
  minAmount: string;
  tokenAddress: string;
  isNFT: boolean;
}

export interface Role {
  threshold: string;
  role: number;
  tokens: TokenRequirement[];
}

export interface AppContextType {
  showSuccess: (message: string, txHash?: string) => void;
  showError: (message: string) => void;
  hideSuccess: () => void;
  hideError: () => void;
  successData: SuccessData | null;
  errorData: ErrorData | null;
  roles: UserRoles | undefined;
  setRoles: (e: SetStateAction<UserRoles | undefined>) => void;
  roleInfo: Role[];
  setRoleInfo: (e: SetStateAction<Role[]>) => void;
}

export interface SuccessData {
  message: string;
  txHash?: string;
}

export interface ErrorData {
  message: string;
}

export interface UserRoles {
  creator: boolean;
  proposer: boolean;
  blacklister: boolean;
  council: boolean;
}
