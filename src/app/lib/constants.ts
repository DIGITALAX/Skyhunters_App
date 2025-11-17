import {
  CoreContractAddresses,
  NetworkConfig,
} from "../components/Common/types/common.types";

export const LOCALES: string[] = ["en", "es"];

export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io/ipfs/";

export const NETWORKS = {
  LENS_TESTNET: {
    chainId: 31337,
    name: "Lens Network Testnet",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "https://block-explorer.testnet.lens.dev",
  },
  LENS_MAINNET: {
    chainId: 232,
    name: "Lens Network",
    rpcUrl: "https://rpc.lens.xyz",
    blockExplorer: "https://explorer.lens.xyz",
  },
} as const;

export const DEFAULT_NETWORK =
  process.env.NODE_ENV === "production"
    ? NETWORKS.LENS_MAINNET
    : NETWORKS.LENS_TESTNET;

export const getCurrentNetwork = (): NetworkConfig => {
  const isMainnet = true;
  // process.env.NEXT_PUBLIC_NETWORK === "mainnet";
  return isMainnet ? NETWORKS.LENS_MAINNET : NETWORKS.LENS_TESTNET;
};

export const getCoreContractAddresses = (
  chainId: number
): CoreContractAddresses => {
  const addresses = CORE_CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(
      `Core contract addresses not found for chain ID: ${chainId}`
    );
  }
  return addresses;
};

export const CORE_CONTRACT_ADDRESSES: Record<number, CoreContractAddresses> = {
  [NETWORKS.LENS_TESTNET.chainId]: {
    accessControl: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    mona: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    council: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    market: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    proposal: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },

  [NETWORKS.LENS_MAINNET.chainId]: {
    accessControl: "0x12b857621B9689eb2c0b22FA41c4A551F7Cb3686",
    council: "0xda85e9ba790875ab79C9622F6420c35488904f15",
    mona: "0x28547B5b6B405A1444A17694AC84aa2d6A03b3Bd",
    market: "0x5fCB37cB35B4Dc6dc566fe0bAba6FE4F9568cb41",
    proposal: "0x21b002F775E14D02130A4FfC0741D5444673025d",
  },
};
