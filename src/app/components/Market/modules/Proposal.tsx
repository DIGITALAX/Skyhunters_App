import { formatEther } from "viem";
import useProposal from "../hooks/useProposal";
import { FunctionComponent, JSX, useContext } from "react";
import { ProposalProps } from "../types/market.types";
import { AppContext } from "@/app/lib/Providers";
import Countdown from "../../Common/modules/Countdown";
import { useAccount } from "wagmi";

const Proposal: FunctionComponent<ProposalProps> = ({
  market,
  getMarketInfo,
  network,
  expireMarket,
  expireMarketLoading,
  dict,
}): JSX.Element => {
  const context = useContext(AppContext);
  const { address } = useAccount();
  const {
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
  } = useProposal(market, getMarketInfo, dict);

  const now = Date.now() / 1000;
  const marketEnded = now > parseInt(market.endTime);
  const proposalWindowEnded = market.proposalWindowEnds && now > parseInt(market.proposalWindowEnds);
  const hasProposal = !!market.proposal;
  const hasDispute = hasProposal && market.proposal.disputed;

  const disputeWindowEnded = hasProposal && market.proposal.disputeWindowEnds && now > parseInt(market.proposal.disputeWindowEnds);
  const inDisputeWindow = hasProposal && !hasDispute && market.proposal.disputeWindowEnds && now <= parseInt(market.proposal.disputeWindowEnds);

  const councilWindowEnded =
    hasDispute &&
    market.proposal.councilWindowEnds &&
    now > parseInt(market.proposal.councilWindowEnds);

  const hasVotedInList = hasDispute && address && market.proposal.votes?.some(
    (v) => v.voter.toLowerCase() === address.toLowerCase()
  );

  const canVote =
    hasDispute &&
    context?.roles?.council &&
    !councilWindowEnded &&
    !userVoteHistory &&
    !hasVotedInList;

  const canSettle = hasProposal && ((disputeWindowEnded && !hasDispute) || (hasDispute && councilWindowEnded)) && !market.isFinalized;
  const canExpire = marketEnded && !hasProposal && proposalWindowEnded && !market.isFinalized && !market.isExpired && !market.isBlacklisted && !market.isCancelled;

  const finalOutcome = hasDispute && councilWindowEnded
    ? Number(market.proposal.yesDisputeVotes) > Number(market.proposal.noDisputeVotes)
      ? dict?.proposal_outcome_disputer_wins
      : dict?.proposal_outcome_proposer_wins
    : null;

  return (
    <div>
      {canExpire && (
        <div className="border-2 border-red-600 bg-red-50 p-3 mb-4">
          <h2 className="text-lg font-bold text-red-800 mb-3">
            {dict?.proposal_window_ended_title}
          </h2>
          <div className="text-sm mb-3 text-red-700">
            {dict?.proposal_window_ended_body}
          </div>
          <button
            onClick={expireMarket}
            disabled={expireMarketLoading}
            className="w-full bg-red-600 text-white py-2 disabled:opacity-50 text-xs font-bold border-2 border-red-700"
          >
            {expireMarketLoading ? dict?.proposal_expiring : dict?.proposal_expire}
          </button>
        </div>
      )}

      {marketEnded && !hasProposal && !proposalWindowEnded && context?.roles?.proposer && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">
            {dict?.proposal_create_title}
          </h2>

          {!bondApproved && (
            <div className="border border-red-600 bg-red-100 p-2 mb-3">
              <div className="font-bold text-red-800">{dict?.proposal_bond_required_title}</div>
              <div className="text-xs text-red-700 mb-2">
                {dict?.proposal_bond_required_body}
              </div>
              <button
                onClick={approveBond}
                disabled={approveLoading}
                className="bg-red-200 text-black px-3 py-1 text-xs border-2 disabled:opacity-50"
              >
                {approveLoading ? dict?.proposal_bond_approving : dict?.proposal_bond_approve}
              </button>
            </div>
          )}

          <div className="relative flex flex-row sm:flex-nowrap flex-wrap gap-2 mb-3">
            <button
              onClick={() => setProposalValues({ ...proposalValues, answer: "yes" })}
              className={`px-2 py-1 flex w-full relative items-center justify-center text-center border-2 border-black text-xs ${
                proposalValues.answer === "yes" ? "bg-black text-white" : "bg-white"
              }`}
            >
              {dict?.common_yes}
            </button>
            <button
              onClick={() => setProposalValues({ ...proposalValues, answer: "no" })}
              className={`px-2 py-1 flex w-full relative items-center justify-center text-center border-2 border-black text-xs ${
                proposalValues.answer === "no" ? "bg-black text-white" : "bg-white"
              }`}
            >
              {dict?.common_no}
            </button>
          </div>

          <div className="mb-2">
            <div className="text-xs text-gray-700 mb-1">
              {dict?.proposal_minimum_bond_label} <span className="font-bold">{baseBond} MONA</span>
            </div>
            <input
              type="number"
              placeholder={dict?.proposal_bond_placeholder?.replace("{min}", baseBond)}
              value={proposalValues.bondAmount}
              onChange={(e) =>
                setProposalValues({
                  ...proposalValues,
                  bondAmount: e.target.value,
                })
              }
              min={baseBond}
              step="0.01"
              className={`w-full p-2 border-2 text-xs ${
                proposalValues.bondAmount && Number(proposalValues.bondAmount) < baseBond
                  ? "border-red-600 bg-red-50"
                  : "border-black"
              }`}
            />
            {proposalValues.bondAmount && Number(proposalValues.bondAmount) < baseBond && (
              <div className="text-xs text-red-600 mt-1">
                {dict?.proposal_bond_min_prefix?.replace("{amount}", baseBond.toString())}
              </div>
            )}
          </div>

          <button
            onClick={createProposal}
            disabled={
              proposalLoading ||
              !bondApproved ||
              !proposalValues.bondAmount ||
              Number(proposalValues.bondAmount) < baseBond
            }
            className="w-full bg-black text-white py-2 disabled:opacity-50 disabled:bg-gray-400 text-xs font-bold border-2 border-black"
          >
            {proposalLoading ? dict?.proposal_create_loading : dict?.proposal_create_submit}
          </button>
        </div>
      )}

      {hasProposal && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">{dict?.proposal_section_label}</h2>

          <div className="space-y-2 text-xs mb-3">
            <div className="flex flex-row gap-2">
              <span className="font-bold">{dict?.proposal_proposer}:</span>
              <span className="break-all">{market.proposal.proposer}</span>
            </div>
            <div className="flex flex-row gap-2">
              <span className="font-bold">{dict?.proposal_proposed_answer_label}</span>
              <span className={`font-bold ${market.proposal.answer === "1" ? "text-green-600" : "text-red-600"}`}>
                {market.proposal.answer === "1" ? dict?.common_yes : dict?.common_no}
              </span>
            </div>
            <div className="flex flex-row gap-2">
              <span className="font-bold">{dict?.proposal_bond_label_short}</span>
              <span>{formatEther(BigInt(market.proposal.proposerBond.monaAmount ?? 0))} MONA</span>
            </div>
            {market.proposal.proposalTransactionHash && (
              <div className="flex flex-row gap-2">
                <span className="font-bold">{dict?.proposal_tx_label}</span>
                <a
                  href={`${network.blockExplorer}/tx/${market.proposal.proposalTransactionHash}`}
                  target="_blank"
                  className="text-blue-600 underline break-all"
                >
                  {market.proposal.proposalTransactionHash}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {inDisputeWindow && (
        <div className="border-2 border-yellow-600 bg-yellow-50 p-3 mb-4">
          <h2 className="text-lg font-bold text-yellow-800 mb-3">{dict?.proposal_dispute_window_heading}</h2>
          <div className="text-sm mb-3 text-yellow-700">
            {dict?.proposal_dispute_window_description}
          </div>
          <div className="bg-yellow-100 border border-yellow-600 p-2 mb-3">
            <div className="font-bold text-xs mb-1">{dict?.proposal_time_remaining_label}</div>
            <div className="text-lg font-bold text-yellow-800">
              <Countdown endTime={market.proposal.disputeWindowEnds} dict={dict} />
            </div>
          </div>
          <div className="text-xs mb-3">
            {dict?.proposal_required_bond_label} <span className="font-bold">{formatEther(BigInt(market.proposal.proposerBond.monaAmount ?? 0))} MONA</span> {dict?.proposal_bond_auto_approved}
          </div>
          <button
            onClick={disputeProposal}
            disabled={disputeLoading}
            className="w-full bg-yellow-600 text-white py-2 disabled:opacity-50 text-xs font-bold border-2 border-yellow-700"
          >
            {disputeLoading ? dict?.proposal_dispute_loading : dict?.proposal_dispute_button}
          </button>
        </div>
      )}

      {hasDispute && (
        <div className="border-2 border-purple-600 bg-purple-50 p-3 mb-4">
          <h2 className="text-lg font-bold text-purple-800 mb-3">{dict?.proposal_dispute_heading}</h2>

          <div className="space-y-2 text-xs mb-3">
            <div className="flex flex-row gap-2">
              <span className="font-bold">{dict?.proposal_disputer_label}</span>
              <span className="break-all">{market.proposal.disputer}</span>
            </div>
            <div className="flex flex-row gap-2">
              <span className="font-bold">{dict?.proposal_disputer_bond_label}</span>
              <span>{formatEther(BigInt(market.proposal.disputerBond?.monaAmount || "0"))} MONA</span>
            </div>
            {market.proposal.councilWindowEnds && (
              <div className="flex flex-row gap-2">
                <span className="font-bold">{dict?.proposal_council_voting_ends_label}</span>
                <span>{new Date(parseInt(market.proposal.councilWindowEnds) * 1000).toLocaleString()}</span>
              </div>
            )}
          </div>

          {!councilWindowEnded && market.proposal.councilWindowEnds && (
            <div className="bg-purple-100 border border-purple-600 p-2 mb-3">
              <div className="font-bold text-xs mb-1">{dict?.proposal_council_voting_time_remaining}</div>
              <div className="text-lg font-bold text-purple-800">
                <Countdown endTime={market.proposal.councilWindowEnds} dict={dict}/>
              </div>
            </div>
          )}

          <div className="mb-3">
            <div className="font-bold text-xs mb-2">{dict?.proposal_votes_label}</div>
            <div className="text-xs">
              <span className="font-bold">{dict?.proposal_votes_yes_support_disputer}</span> {market.proposal.yesDisputeVotes || 0} |
              <span className="font-bold ml-2">{dict?.proposal_votes_no_support_proposer}</span> {market.proposal.noDisputeVotes || 0}
            </div>
          </div>

          {canVote ? (
            <div className="mb-3">
              <div className="font-bold text-xs mb-2">{dict?.proposal_cast_vote}</div>
              <div className="flex flex-row sm:flex-nowrap flex-wrap gap-2 mb-2">
                <button
                  onClick={() => setVote(true)}
                  className={`px-2 py-1 flex w-full border-2 border-black text-xs ${
                    vote === true ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {dict?.proposal_vote_yes_support_disputer_button}
                </button>
                <button
                  onClick={() => setVote(false)}
                  className={`px-2 py-1 flex w-full border-2 border-black text-xs ${
                    vote === false ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {dict?.proposal_vote_no_support_proposer_button}
                </button>
              </div>
              <button
                onClick={voteOnProposal}
                disabled={proposalVoteLoading || vote === undefined}
                className="w-full bg-purple-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
              >
                {proposalVoteLoading ? dict?.proposal_vote_submitting : dict?.proposal_vote_submit}
              </button>
            </div>
          ) : userVoteHistory ? (
            <div className="border border-purple-600 bg-purple-100 p-2 mb-3">
              <div className="font-bold text-purple-800 text-xs">{dict?.proposal_your_vote_title}</div>
              <div className="text-xs text-purple-700">
                {dict?.proposal_you_voted_prefix} <strong>{userVoteHistory.support ? dict?.proposal_voted_yes_disputer : dict?.proposal_voted_no_proposer}</strong>
              </div>
            </div>
          ) : !context?.roles?.council ? (
            <div className="text-xs text-gray-600 mb-3">
              {dict?.proposal_council_required}
            </div>
          ) : councilWindowEnded ? (
            <div className="text-xs text-gray-600 mb-3">
              {dict?.proposal_council_ended}
            </div>
          ) : null}

          {market.proposal.votes && market.proposal.votes.length > 0 && (
            <div className="border border-black p-2">
              <h3 className="font-bold text-xs mb-2">{dict?.proposal_votes_title}</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {market.proposal.votes.map((v, i) => {
                  const isUserVote = address && v.voter.toLowerCase() === address.toLowerCase();
                  return (
                    <div
                      key={i}
                      className={`text-xs border-b pb-1 ${
                        isUserVote ? "border-purple-600 bg-purple-50" : "border-gray-300"
                      }`}
                    >
                      <div className="break-all">
                        <strong>{v.voter}</strong>
                        {isUserVote && <span className="ml-2 text-purple-600 font-bold">{dict?.proposal_you_tag}</span>}
                      </div>
                      <div>
                        {dict?.proposal_voted_label_short} <strong>{v.support ? dict?.proposal_voted_yes_short : dict?.proposal_voted_no_short}</strong> |
                        <a
                          href={`${network.blockExplorer}/tx/${v.transactionHash}`}
                          target="_blank"
                          className="text-blue-600 underline ml-1"
                        >
                          {dict?.proposal_tx_label}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {finalOutcome && (
        <div className="border-2 border-green-600 bg-green-50 p-3 mb-4">
          <h2 className="text-lg font-bold text-green-800 mb-3">{dict?.proposal_final_outcome_heading}</h2>
          <div className="text-sm mb-2">
            <span className="font-bold">{dict?.proposal_result} </span>
            <span className="text-lg font-bold">{finalOutcome}</span>
          </div>
          <div className="text-xs">
            {finalOutcome === dict?.proposal_outcome_proposer_wins
              ? dict?.proposal_result_proposer
              : dict?.proposal_result_disputer}
          </div>
        </div>
      )}

      {canSettle && (
        <div className="border-2 border-blue-600 bg-blue-50 p-3 mb-4">
          <h2 className="text-lg font-bold text-blue-800 mb-3">{dict?.proposal_settlement_title}</h2>
          <div className="text-sm mb-3 text-blue-700">
            {dict?.proposal_settlement_window_ended?.replace("{which}", hasDispute ? dict?.proposal_settlement_window_council : dict?.proposal_settlement_window_dispute)}
          </div>

          {!hasDispute && (
            <button
              onClick={settleUndisputed}
              disabled={settleLoading}
              className="w-full bg-blue-200 text-black py-2 mb-2 disabled:opacity-50 text-xs font-bold border-2"
            >
              {settleLoading ? dict?.proposal_settling : dict?.proposal_settle_undisputed}
            </button>
          )}

          {hasDispute && (
            <>
              <button
                onClick={executeProposalDispute}
                disabled={executeLoading}
                className="w-full bg-blue-200 text-black py-2 mb-2 disabled:opacity-50 text-xs font-bold border-2"
              >
                {executeLoading ? dict?.proposal_executing : dict?.proposal_settle_dispute}
              </button>

              <button
                onClick={settleExpiredDispute}
                disabled={settleLoading}
                className="w-full bg-purple-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
              >
                {settleLoading ? dict?.proposal_settling : dict?.proposal_settle_expired_dispute}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Proposal;
