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
import { getUserProposalVote } from "@/app/lib/subgraph/queries/getUserInfo";

const useProposal = (
  market: Market | undefined,
  getMarketInfo: () => Promise<void>,
  dict: any
) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const context = useContext(AppContext);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);
  const [disputeLoading, setDisputeLoading] = useState<boolean>(false);
  const [executeLoading, setExecuteLoading] = useState<boolean>(false);
  const [bondApproved, setBondApproved] = useState<boolean>(false);
  const [approveLoading, setApproveLoading] = useState<boolean>(false);
  const [proposalVoteLoading, setProposalVoteLoading] =
    useState<boolean>(false);
  const [settleLoading, setSettleLoading] = useState<boolean>(false);
  const [vote, setVote] = useState<boolean>();
  const [userVoteHistory, setUserVoteHistory] = useState<Vote>();
  const [baseBond, setBaseBond] = useState<number>(0);
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
      context?.showError(dict?.proposal_connect_wallet_error);
      return;
    }

    if (!context?.roles?.proposer) {
      context?.showError(dict?.proposal_role_required);
      return;
    }

    if (Number(proposalValues.bondAmount) < baseBond) {
      context?.showError(
        dict?.proposal_bond_min_prefix.replace("{amount}", baseBond.toString())
      );
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
      context?.showSuccess(dict?.proposal_create_success, hash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`${dict?.proposal_create_failed} ${err.message}`);
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
    if (!walletClient || !publicClient || !address) {
      context?.showError(dict?.proposal_connect_wallet_error);
      return;
    }

    if (userVoteHistory) {
      context?.showError(dict?.proposal_vote_already);
      return;
    }

    if (!context?.roles?.council) {
      context?.showError(dict?.proposal_vote_role_required);
      return;
    }

    setProposalVoteLoading(true);

    try {
      const hash = await walletClient.writeContract({
        address: contracts.council,
        abi: ABIS.Council,
        functionName: "voteOnProposalDispute",
        args: [BigInt(market?.proposal?.proposalId!), vote],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await getMarketInfo();
      await getUserVote();
      context?.showSuccess(dict?.proposal_vote_success, hash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`${dict?.proposal_vote_failed} ${err.message}`);
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
      context?.showSuccess(dict?.proposal_settle_disputed_success, hash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`${dict?.proposal_settle_disputed_failed} ${err.message}`);
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
      context?.showSuccess(dict?.proposal_settle_undisputed_success, hash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`${dict?.proposal_settle_undisputed_failed} ${err.message}`);
    }
    setSettleLoading(false);
  };

  const approveBond = async () => {
    if (!walletClient || !address || !publicClient)
      throw new Error("Wallet not connected");

    setApproveLoading(true);
    try {
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
      context?.showSuccess(dict?.proposal_bond_approve_success, approveHash);
    } catch (err: any) {
      context?.showError(
        `${dict?.proposal_bond_approve_failed} ${err.message}`
      );
    }
    setApproveLoading(false);
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

  const getUserVote = async () => {
    if (!address || !market?.proposal?.proposalId) {
      setUserVoteHistory(undefined);
      return;
    }
    try {
      const data = await getUserProposalVote(
        address,
        Number(market.proposal.proposalId)
      );
      setUserVoteHistory(data?.data?.proposalVotes?.[0]);
    } catch (err: any) {
      console.error(err.message);
      setUserVoteHistory(undefined);
    }
  };

  const getBaseBond = async () => {
    if (!publicClient) return;
    try {
      const bond = (await publicClient.readContract({
        address: contracts.proposal as `0x${string}`,
        abi: ABIS.Proposal,
        functionName: "getBaseBondAmount",
        args: [],
      })) as any;
      setBaseBond(Number(bond) / 10 ** 18);
    } catch (err: any) {
      console.error("Error fetching base bond:", err.message);
    }
  };

  useEffect(() => {
    if (address && publicClient && Number(proposalValues.bondAmount) > 0) {
      checkBondApproved();
    }
  }, [address, proposalValues.bondAmount, publicClient]);

  useEffect(() => {
    getUserVote();
  }, [address, market?.proposal?.proposalId]);

  useEffect(() => {
    if (publicClient) {
      getBaseBond();
    }
  }, [publicClient]);

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
    approveLoading,
    disputeLoading,
    executeLoading,
    proposalVoteLoading,
    settleLoading,
    vote,
    setVote,
    userVoteHistory,
    baseBond,
  };
};

export default useProposal;
