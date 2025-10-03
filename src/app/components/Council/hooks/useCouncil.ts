import { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { AppContext } from "@/app/lib/Providers";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { ABIS } from "@/abis";
import { Blacklist, Proposal } from "../../Common/types/common.types";
import { PenaltyForgive } from "../../Manage/types/manage.types";
import { getCouncilVotes } from "@/app/lib/subgraph/queries/getVotes";
import { dummyCouncilVotes } from "@/app/lib/dummy";

const useCouncil = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const context = useContext(AppContext);
  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);
  const [councilLoading, setCouncilLoading] = useState<boolean>(false);
  const [disputeVoteLoading, setDisputeVoteLoading] = useState<boolean>(false);
  const [blacklistVoteLoading, setBlacklistVoteLoading] =
    useState<boolean>(false);
  const [penaltyVoteLoading, setPenaltyVoteLoading] = useState<boolean>(false);
  const [proposePenaltyLoading, setProposePenaltyLoading] = useState<boolean>(false);
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "disputes" | "blacklists" | "forgive penalties"
  >("disputes");
  const [votes, setVotes] = useState<{
    blacklists: Blacklist[];
    penalties: PenaltyForgive[];
    disputes: Proposal[];
  }>({
    blacklists: [],
    penalties: [],
    disputes: [],
  });

  const getVotes = async () => {
    if (!address) return;
    setCouncilLoading(true);
    try {
      const blockTimestampNow = Math.floor(Date.now() / 1000);
      // const data = await getCouncilVotes(blockTimestampNow);
      // setVotes({
      //   blacklists: data?.data?.blacklists || [],
      //   penalties: data?.data?.penaltyForgives || [],
      //   disputes: data?.data?.proposals || [],
      // });
      setVotes(dummyCouncilVotes as any);
    } catch (err: any) {
      console.error(err.message);
    }
    setCouncilLoading(false);
  };

  const voteOnDispute = async (proposalId: number, support: boolean) => {
    if (!address || !walletClient || !publicClient) return;
    setDisputeVoteLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.council as `0x${string}`,
        abi: ABIS.Council,
        functionName: "voteOnProposalDispute",
        args: [proposalId, support],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(
        `Vote cast on dispute ${support ? "in favor" : "against"}!`,
        hash
      );
      getVotes();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`Failed to vote on dispute: ${err.message}`);
    }
    setDisputeVoteLoading(false);
  };

  const voteOnBlacklist = async (blacklistId: number, support: boolean) => {
    if (!address || !walletClient || !publicClient) return;
    setBlacklistVoteLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.council as `0x${string}`,
        abi: ABIS.Council,
        functionName: "voteOnMarketBlacklist",
        args: [blacklistId, support],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(
        `Vote cast on blacklist ${support ? "in favor" : "against"}!`,
        hash
      );
      getVotes();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`Failed to vote on blacklist: ${err.message}`);
    }
    setBlacklistVoteLoading(false);
  };

  const voteOnPenalty = async (penaltyForgiveId: number, support: boolean) => {
    if (!address || !walletClient || !publicClient) return;
    setPenaltyVoteLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.council as `0x${string}`,
        abi: ABIS.Council,
        functionName: "voteOnPenaltyForgiveness",
        args: [penaltyForgiveId, support],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(
        `Vote cast on penalty forgiveness ${support ? "in favor" : "against"}!`,
        hash
      );
      getVotes();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `Failed to vote on penalty forgiveness: ${err.message}`
      );
    }
    setPenaltyVoteLoading(false);
  };

  const hasUserVoted = (item: any): boolean => {
    if (!address || !item.votes) return false;

    return item.votes.some(
      (vote: any) => vote.voter.toLowerCase() === address.toLowerCase()
    );
  };

  const proposePenaltyForgiveness = async () => {
    if (!address || !walletClient || !publicClient || !targetAddress) return;
    setProposePenaltyLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.council as `0x${string}`,
        abi: ABIS.Council,
        functionName: "proposePenaltyForgiveness",
        args: [targetAddress as `0x${string}`],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(
        `Penalty forgiveness proposal created for ${targetAddress}!`,
        hash
      );
      setTargetAddress("");
      getVotes();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `Failed to create penalty forgiveness proposal: ${err.message}`
      );
    }
    setProposePenaltyLoading(false);
  };

  const getTimeUntilDeadline = (deadline: string): string => {
    const now = Math.floor(Date.now() / 1000);
    const deadlineTime = Number(deadline);
    const timeLeft = deadlineTime - now;

    if (timeLeft <= 0) return "EXPIRED";

    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    if (
      address &&
      !councilLoading &&
      votes.blacklists.length < 1 &&
      votes.penalties.length < 1 &&
      votes.disputes.length < 1
      // && context?.roles?.council
    ) {
      getVotes();
    }
  }, [address, context?.roles?.council]);

  return {
    councilLoading,
    activeTab,
    setActiveTab,
    votes,
    disputeVoteLoading,
    blacklistVoteLoading,
    penaltyVoteLoading,
    proposePenaltyLoading,
    voteOnDispute,
    voteOnBlacklist,
    voteOnPenalty,
    hasUserVoted,
    getTimeUntilDeadline,
    getVotes,
    proposePenaltyForgiveness,
    targetAddress,
    setTargetAddress,
  };
};

export default useCouncil;
