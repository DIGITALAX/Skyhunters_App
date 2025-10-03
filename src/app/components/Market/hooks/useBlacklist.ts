import { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { ABIS } from "@/abis";
import { AppContext } from "@/app/lib/Providers";
import { Market, Vote } from "../../Common/types/common.types";
import { getUserBlacklistVote } from "@/app/lib/subgraph/queries/getUserInfo";

const useBlacklist = (
  market: Market | undefined,
  getMarketInfo: () => Promise<void>
) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const context = useContext(AppContext);
  const [blacklistLoading, setBlacklistLoading] = useState<boolean>(false);
  const [executeLoading, setExecuteLoading] = useState<boolean>(false);
  const [blacklistVoteLoading, setBlacklistVoteLoading] =
    useState<boolean>(false);
  const [vote, setVote] = useState<boolean>();
  const [blacklistValues, setBlacklistValues] = useState<{
    reason: string;
    comments: string;
  }>({
    reason: "",
    comments: "",
  });
  const [userVoteHistory, setUserVoteHistory] = useState<Vote>();
  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);

  const createBlacklist = async () => {
    if (
      !walletClient ||
      !publicClient ||
      !address ||
      !market ||
      market?.blacklist
    ) {
      context?.showError("Please connect your wallet");
      return;
    }

    if (!context?.roles?.blacklister) {
      context?.showError("You must have Blacklister role to create blacklists");
      return;
    }

    setBlacklistLoading(true);

    try {
      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blacklistValues),
      });

      const result = await response.json();

      const marketIdBigInt = BigInt(market?.marketId!);
      const hash = await walletClient.writeContract({
        address: contracts.council,
        abi: ABIS.Council,
        functionName: "proposeMarketBlacklist",
        args: [marketIdBigInt, "ipfs://" + result.hash],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }

    setBlacklistLoading(false);
  };

  const voteOnBlacklist = async () => {
    if (!walletClient || !publicClient || !address || userVoteHistory) {
      context?.showError("Please connect your wallet");
      return;
    }

    if (!context?.roles?.council) {
      context?.showError("You must have Council role to vote on blacklists");
      return;
    }

    setBlacklistVoteLoading(true);

    try {
      const hash = await walletClient.writeContract({
        address: contracts.council,
        abi: ABIS.Council,
        functionName: "voteOnMarketBlacklist",
        args: [BigInt(market?.blacklist.blacklistId!), vote],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }
    setBlacklistVoteLoading(false);
  };

  const executeBlacklistDispute = async () => {
    if (!walletClient || !publicClient || !address) return;
    setExecuteLoading(true);

    try {
      const hash = await walletClient.writeContract({
        address: contracts.council,
        abi: ABIS.Council,
        functionName: "executeMarketBlacklist",
        args: [BigInt(market?.blacklist.blacklistId!)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }
    setExecuteLoading(false);
  };

  const getUserVoteHistory = async () => {
    if (!address || !market) return;
    try {
      const data = await getUserBlacklistVote(
        address,
        Number(market?.blacklist?.blacklistId || 0)
      );
      setUserVoteHistory(data?.data?.blacklistVotes?.[0]);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (address && !userVoteHistory) {
      getUserVoteHistory();
    }
  }, [address]);

  return {
    createBlacklist,
    voteOnBlacklist,
    blacklistLoading,
    executeBlacklistDispute,
    executeLoading,
    blacklistVoteLoading,
    vote,
    setVote,
    userVoteHistory,
    blacklistValues,
    setBlacklistValues,
  };
};

export default useBlacklist;
