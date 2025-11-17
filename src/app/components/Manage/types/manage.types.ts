import {
  Blacklist,
  Market,
  Order,
  Proposal,
  Vote,
} from "../../Common/types/common.types";

export enum RoleType {
  CREATOR,
  PROPOSER,
  BLACKLISTER,
  COUNCIL,
}

export interface User {
  id: string
  marketActivity: MarketUserBalance[];
  winnings: UserWinnings[];
  proposals: Proposal[];
  disputes: Proposal[];
  blacklists: Blacklist[];
  penalties: PenaltyForgive[];
  penaltiesRecieved: PenaltyForgive[];
  proposalVotes: Vote[];
  blacklistVotes: Vote[];
  penaltyVotes: Vote[];
  totalPendingRewards: string;
  participationPoints: string;
  firstActivityBlock: string;
  eligibleDisputeCount: string;
  successfulProposals: string;
  successfulDisputes: string;
  failedActions: string;
  slashMultiplier: string;
  councilRewardsClaimed: string;
}

export interface UserWinnings {
  market: Market;
  amount: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface MarketUserBalance {
  yesShares: string;
  noShares: string;
  winningsRedeemed: boolean;
  orders: Order[];
  market: Market;
}

export interface PenaltyForgive {
  deadline: string;
  yesVotes: string;
  penaltyForgiveId: string;
  noVotes: string;
  targetUser: string;
  proposer: string;
  executed: boolean;
  votes: Vote[];
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export type RoleKey = "creator" | "proposer" | "blacklister" | "council";

export type TokenRequirement = {
  tokenAddress: `0x${string}`;
  minAmount: bigint;
  isNFT: boolean;
};

export type RoleRequirement = {
  tokenRequirements: TokenRequirement[];
  threshold: bigint;
};