import { CoreContractAddresses } from "@/app/components/Common/types/common.types";
import { PublicClient } from "viem";

export const getMonaBalance = async (
  address: `0x${string}`,
  publicClient: PublicClient,
  contracts: CoreContractAddresses
) => {
  if (!publicClient) return BigInt(0);
  return (await publicClient.readContract({
    address: contracts.mona,
    abi: [
      {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "owner", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
    ],
    functionName: "balanceOf",
    args: [address],
  })) as bigint;
};

export const getMonaAllowance = async (
  owner: `0x${string}`,
  spender: `0x${string}`,
  publicClient: PublicClient,
  contracts: CoreContractAddresses
) => {
  if (!publicClient) return BigInt(0);
  return (await publicClient.readContract({
    address: contracts.mona,
    abi: [
      {
        type: "function",
        name: "allowance",
        inputs: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "spender", type: "address", internalType: "address" },
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
    ],
    functionName: "allowance",
    args: [owner, spender],
  })) as bigint;
};
