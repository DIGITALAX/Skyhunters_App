import AccessControl from "./AccessControl.json";
import Council from "./Council.json";
import Markets from "./Markets.json";
import Proposal from "./Proposal.json";

export const ABIS = {
  AccessControl,
  Council,
  Markets,
  Proposal,
} as const;

export const getABI = (contractName: keyof typeof ABIS) => {
  return ABIS[contractName];
};
