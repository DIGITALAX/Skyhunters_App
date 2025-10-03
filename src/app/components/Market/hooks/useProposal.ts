import { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { ABIS } from "@/abis";
import { AppContext } from "@/app/lib/Providers";
import { getMonaAllowance, getMonaBalance } from "@/app/lib/helpers/mona";
import { Market, Vote } from "../../Common/types/common.types";
import { getUserMarketVote } from "@/app/lib/subgraph/queries/getUserInfo";

const useProposal = (
  market: Market | undefined,
  getMarketInfo: () => Promise<void>
) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const context = useContext(AppContext);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);
  const [disputeLoading, setDisputeLoading] = useState<boolean>(false);
  const [executeLoading, setExecuteLoading] = useState<boolean>(false);
  const [bondApproved, setBondApproved] = useState<boolean>(false);
  const [proposalVoteLoading, setProposalVoteLoading] =
    useState<boolean>(false);
  const [settleLoading, setSettleLoading] = useState<boolean>(false);
  const [vote, setVote] = useState<boolean>();
  const [userVoteHistory, setUserVoteHistory] = useState<Vote>();
  const [proposalValues, setProposalValues] = useState<{
    answer: "yes" | "no";
    bondAmount: string;
  }>({
    answer: "yes",
    bondAmount: "",
  });
  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);

  const createProposal = async () => {
    if (
      !walletClient ||
      !publicClient ||
      !address ||
      !market ||
      market?.proposal
    ) {
      context?.showError("Please connect your wallet");
      return;
    }

    if (!context?.roles?.proposer) {
      context?.showError("You must have Proposer role to create proposals");
      return;
    }

    setProposalLoading(true);

    try {
      const bondAmountWei = BigInt(Number(proposalValues.bondAmount) * 10 ** 18);
      const allowance = await getMonaAllowance(
        address,
        contracts.proposal,
        publicClient,
        contracts
      );
      
      if (allowance < bondAmountWei) {
        await approveBond();
      }

      const marketIdBigInt = BigInt(market?.marketId!);
      const answerNum = proposalValues.answer === "yes" ? 1 : 0;
      const hash = await walletClient.writeContract({
        address: contracts.proposal,
        abi: ABIS.Proposal,
        functionName: "createProposal",
        args: [marketIdBigInt, bondAmountWei, answerNum],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }

    setProposalLoading(false);
  };

  const disputeProposal = async () => {
    if (
      !walletClient ||
      !publicClient ||
      !address ||
      !market?.proposal ||
      market?.proposal.disputed
    )
      return;
    setDisputeLoading(true);

    try {
      const bondAmount = BigInt(market?.proposal?.proposerBond.monaAmount!);
      const allowance = await getMonaAllowance(
        address,
        contracts.proposal,
        publicClient,
        contracts
      );
      
      if (allowance < bondAmount) {
        const approveHash = await walletClient.writeContract({
          address: contracts.mona,
          abi: [
            {
              type: "function",
              name: "approve",
              inputs: [
                { name: "spender", type: "address", internalType: "address" },
                { name: "amount", type: "uint256", internalType: "uint256" },
              ],
              outputs: [{ name: "", type: "bool", internalType: "bool" }],
              stateMutability: "nonpayable",
            },
          ],
          functionName: "approve",
          args: [contracts.proposal, bondAmount],
          account: address,
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      const marketIdBigInt = BigInt(market.marketId);
      const hash = await walletClient.writeContract({
        address: contracts.proposal,
        abi: ABIS.Proposal,
        functionName: "disputeProposal",
        args: [marketIdBigInt],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }
    setDisputeLoading(false);
  };

  const voteOnProposal = async () => {
    if (!walletClient || !publicClient || !address || userVoteHistory) {
      context?.showError("Please connect your wallet");
      return;
    }

    if (!context?.roles?.council) {
      context?.showError("You must have Council role to vote on proposals");
      return;
    }

    setProposalVoteLoading(true);

    try {
      const hash = await walletClient.writeContract({
        address: contracts.council,
        abi: ABIS.Council,
        functionName: "vote",
        args: [BigInt(market?.marketId!), vote],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }
    setProposalVoteLoading(false);
  };

  const executeProposalDispute = async () => {
    if (!walletClient || !publicClient || !address) return;
    setExecuteLoading(true);

    try {
      const hash = await walletClient.writeContract({
        address: contracts.council,
        abi: ABIS.Council,
        functionName: "executeDecision",
        args: [BigInt(market?.marketId!)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }
    setExecuteLoading(false);
  };

  const settleExpiredDispute = async () => {
    if (!walletClient || !publicClient || !address) return;
    setSettleLoading(true);

    try {
      const hash = await walletClient.writeContract({
        address: contracts.proposal,
        abi: ABIS.Proposal,
        functionName: "settleExpiredDispute",
        args: [BigInt(market?.marketId!)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }
    setSettleLoading(false);
  };

  const settleUndisputed = async () => {
    if (!walletClient || !publicClient || !address) return;
    setSettleLoading(true);

    try {
      const hash = await walletClient.writeContract({
        address: contracts.proposal,
        abi: ABIS.Proposal,
        functionName: "settleUndisputed",
        args: [BigInt(market?.marketId!)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
    } catch (err: any) {
      console.error(err.message);
    }
    setSettleLoading(false);
  };

  const approveBond = async () => {
    if (!walletClient || !address || !publicClient)
      throw new Error("Wallet not connected");

    const approveHash = await walletClient.writeContract({
      address: contracts.mona,
      abi: [
        {
          type: "function",
          name: "approve",
          inputs: [
            { name: "spender", type: "address", internalType: "address" },
            { name: "amount", type: "uint256", internalType: "uint256" },
          ],
          outputs: [{ name: "", type: "bool", internalType: "bool" }],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "approve",
      args: [
        contracts.proposal,
        BigInt(Number(proposalValues.bondAmount) * 10 ** 18),
      ],
      account: address,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    setBondApproved(true);
  };

  const checkBondApproved = async () => {
    if (!address || !publicClient) return;
    const monaBalance = await getMonaBalance(address, publicClient, contracts);
    const allowance = await getMonaAllowance(
      address,
      contracts.proposal,
      publicClient,
      contracts
    );

    if (allowance < monaBalance) {
      setBondApproved(false);
    } else {
      setBondApproved(true);
    }
  };

  const getUserVoteHistory = async () => {
    if (!address || !market) return;
    try {
      const data = await getUserMarketVote(address, Number(market?.marketId));
      setUserVoteHistory(data?.data?.proposalDisputeVotes?.[0]);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (address && publicClient && Number(proposalValues.bondAmount) > 0) {
      checkBondApproved();
    }
  }, [address, proposalValues.bondAmount, publicClient]);

  useEffect(() => {
    if (address && !userVoteHistory) {
      getUserVoteHistory();
    }
  }, [address]);

  return {
    createProposal,
    disputeProposal,
    settleExpiredDispute,
    settleUndisputed,
    voteOnProposal,
    proposalLoading,
    proposalValues,
    setProposalValues,
    executeProposalDispute,
    approveBond,
    bondApproved,
    disputeLoading,
    executeLoading,
    proposalVoteLoading,
    settleLoading,
    vote,
    setVote,
    userVoteHistory,
  };
};

export default useProposal;
