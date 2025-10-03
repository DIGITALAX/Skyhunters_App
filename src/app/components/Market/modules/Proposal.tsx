import { formatEther } from "viem";
import useProposal from "../hooks/useProposal";
import { FunctionComponent, JSX, useContext } from "react";
import { ProposalProps } from "../types/market.types";
import { AppContext } from "@/app/lib/Providers";

const Proposal: FunctionComponent<ProposalProps> = ({
  market,
  getMarketInfo,
  network,
}): JSX.Element => {
  const context = useContext(AppContext);
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
    disputeLoading,
    executeLoading,
    proposalVoteLoading,
    settleLoading,
    vote,
    setVote,
    userVoteHistory,
  } = useProposal(market, getMarketInfo);

  const now = Date.now() / 1000;
  const marketEnded = now > parseInt(market.endTime);
  const hasProposal = !!market.proposal;
  const hasDispute = hasProposal && market.proposal.disputed;
  const disputeWindowEnded =
    hasProposal && now > parseInt(market.proposal.disputeWindowEnds);
  const councilWindowEnded =
    hasDispute &&
    market.proposal.councilWindowEnds &&
    now > parseInt(market.proposal.councilWindowEnds);
  const canVote =
    hasDispute &&
    context?.roles?.council &&
    !councilWindowEnded &&
    !userVoteHistory;
  const canDispute = hasProposal && !hasDispute && !disputeWindowEnded;

  return (
    <div>
      {marketEnded && !hasProposal && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">CREATE PROPOSAL</h2>

          {!context?.roles?.proposer ? (
            <div className="text-xs text-red-600 mb-3">
              You need Proposer role to create proposals
            </div>
          ) : (
            <>
              {!bondApproved && (
                <div className="border border-red-600 bg-red-100 p-2 mb-3">
                  <div className="font-bold text-red-800">
                    BOND APPROVAL REQUIRED
                  </div>
                  <div className="text-xs text-red-700 mb-2">
                    You need to approve MONA spending for proposal bond
                  </div>
                  <button
                    onClick={approveBond}
                    disabled={proposalLoading}
                    className="bg-red-200 text-black px-3 py-1 text-xs border-2 disabled:opacity-50"
                  >
                    {proposalLoading ? "APPROVING..." : "APPROVE BOND"}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() =>
                    setProposalValues({ ...proposalValues, answer: "yes" })
                  }
                  className={`px-2 py-1 border-2 border-black text-xs ${
                    proposalValues.answer === "yes"
                      ? "bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  YES
                </button>
                <button
                  onClick={() =>
                    setProposalValues({ ...proposalValues, answer: "no" })
                  }
                  className={`px-2 py-1 border-2 border-black text-xs ${
                    proposalValues.answer === "no"
                      ? "bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  NO
                </button>
              </div>

              <input
                type="text"
                placeholder="Bond Amount (MONA)"
                value={proposalValues.bondAmount}
                onChange={(e) =>
                  setProposalValues({
                    ...proposalValues,
                    bondAmount: e.target.value,
                  })
                }
                className="w-full p-2 border-2 border-black mb-2 text-xs"
              />

              <button
                onClick={createProposal}
                disabled={
                  proposalLoading || !bondApproved || !proposalValues.bondAmount
                }
                className="w-full bg-black text-white py-2 disabled:opacity-50 disabled:bg-gray-400 text-xs font-bold border-2 border-black"
              >
                {proposalLoading ? "CREATING..." : "CREATE PROPOSAL"}
              </button>
            </>
          )}
        </div>
      )}

      {hasProposal && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">PROPOSAL DATA</h2>

          <table className="w-full text-xs border-collapse mb-3">
            <tbody>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  PROPOSAL ID
                </td>
                <td className="border border-black p-1">
                  {market.proposal.proposalId}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  PROPOSER
                </td>
                <td className="border border-black p-1">
                  {market.proposal.proposer}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  PROPOSED ANSWER
                </td>
                <td className="border border-black p-1">
                  {market.proposal.answer === "1" ? "YES" : "NO"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  PROPOSER BOND
                </td>
                <td className="border border-black p-1">
                  {formatEther(BigInt(market.proposal.proposerBond.monaAmount))}{" "}
                  MONA
                  {market.proposal.proposerBond.isSlashed && " (SLASHED)"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  DISPUTE WINDOW ENDS
                </td>
                <td className="border border-black p-1">
                  {new Date(
                    parseInt(market.proposal.disputeWindowEnds) * 1000
                  ).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  FINAL ANSWER
                </td>
                <td className="border border-black p-1">
                  {market.proposal.finalAnswer === "1"
                    ? "YES"
                    : market.proposal.finalAnswer === "0"
                    ? "NO"
                    : "PENDING"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  EXPIRED
                </td>
                <td className="border border-black p-1">
                  {market.proposal.expired ? "YES" : "NO"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  PROPOSER REWARD
                </td>
                <td className="border border-black p-1">
                  {formatEther(BigInt(market.proposal.proposerReward || "0"))}{" "}
                  MONA
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  DISPUTER REWARD
                </td>
                <td className="border border-black p-1">
                  {formatEther(BigInt(market.proposal.disputerReward || "0"))}{" "}
                  MONA
                </td>
              </tr>
            </tbody>
          </table>

          {canDispute && (
            <button
              onClick={disputeProposal}
              disabled={disputeLoading}
              className="w-full bg-red-200 text-black py-2 mb-3 disabled:opacity-50 text-xs font-bold border-2"
            >
              {disputeLoading ? "DISPUTING..." : "DISPUTE PROPOSAL"}
            </button>
          )}
        </div>
      )}

      {hasDispute && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">DISPUTE DATA</h2>

          <table className="w-full text-xs border-collapse mb-3">
            <tbody>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  DISPUTER
                </td>
                <td className="border border-black p-1">
                  {market.proposal.disputer}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  DISPUTER BOND
                </td>
                <td className="border border-black p-1">
                  {formatEther(
                    BigInt(market.proposal.disputerBond?.monaAmount || "0")
                  )}{" "}
                  MONA
                  {market.proposal.disputerBond?.isSlashed && " (SLASHED)"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  COUNCIL WINDOW ENDS
                </td>
                <td className="border border-black p-1">
                  {market.proposal.councilWindowEnds
                    ? new Date(
                        parseInt(market.proposal.councilWindowEnds) * 1000
                      ).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  DISPUTE VOTES
                </td>
                <td className="border border-black p-1">
                  YES: {market.proposal.yesDisputeVotes} | NO:{" "}
                  {market.proposal.noDisputeVotes}
                </td>
              </tr>
            </tbody>
          </table>

          {canVote ? (
            <div className="mb-3">
              <div className="font-bold text-xs mb-2">VOTE ON DISPUTE</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => setVote(true)}
                  className={`px-2 py-1 border-2 border-black text-xs ${
                    vote === true ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  YES (Support Proposer)
                </button>
                <button
                  onClick={() => setVote(false)}
                  className={`px-2 py-1 border-2 border-black text-xs ${
                    vote === false ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  NO (Support Disputer)
                </button>
              </div>
              <button
                onClick={voteOnProposal}
                disabled={proposalVoteLoading || vote === undefined}
                className="w-full bg-blue-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
              >
                {proposalVoteLoading ? "VOTING..." : "SUBMIT VOTE"}
              </button>
            </div>
          ) : userVoteHistory ? (
            <div className="border border-blue-600 bg-blue-100 p-2 mb-3">
              <div className="font-bold text-blue-800">YOUR VOTE</div>
              <div className="text-xs text-blue-700">
                You voted:{" "}
                <strong>{userVoteHistory.support ? "YES" : "NO"}</strong>
              </div>
            </div>
          ) : !context?.roles?.council ? (
            <div className="text-xs text-gray-600 mb-3">
              You need Council role to vote on disputes
            </div>
          ) : councilWindowEnded ? (
            <div className="text-xs text-gray-600 mb-3">
              Council voting window has ended
            </div>
          ) : null}

          {market.proposal.votes && market.proposal.votes.length > 0 && (
            <div className="border border-black p-2">
              <h3 className="font-bold mb-2">COUNCIL VOTES</h3>
              <div className="max-h-32 overflow-y-auto">
                {market.proposal.votes.map((vote, i) => (
                  <div
                    key={i}
                    className="text-xs border-b border-gray-300 pb-1 mb-1"
                  >
                    <strong>{vote.voter}</strong> voted{" "}
                    <strong>{vote.support ? "YES" : "NO"}</strong> | Block #
                    {vote.blockNumber} |
                    <a
                      href={`${network.blockExplorer}/tx/${vote.transactionHash}`}
                      target="_blank"
                      className="text-blue-600 underline ml-1"
                    >
                      TX
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasProposal && (disputeWindowEnded || councilWindowEnded) && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">SETTLEMENT</h2>

          {!hasDispute && disputeWindowEnded && (
            <button
              onClick={settleUndisputed}
              disabled={settleLoading}
              className="w-full bg-green-200 text-black py-2 mb-2 disabled:opacity-50 text-xs font-bold border-2"
            >
              {settleLoading ? "SETTLING..." : "SETTLE UNDISPUTED PROPOSAL"}
            </button>
          )}

          {hasDispute && councilWindowEnded && (
            <>
              <button
                onClick={executeProposalDispute}
                disabled={executeLoading}
                className="w-full bg-blue-200 text-black py-2 mb-2 disabled:opacity-50 text-xs font-bold border-2"
              >
                {executeLoading ? "EXECUTING..." : "EXECUTE DISPUTE DECISION"}
              </button>

              <button
                onClick={settleExpiredDispute}
                disabled={settleLoading}
                className="w-full bg-red-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
              >
                {settleLoading ? "SETTLING..." : "SETTLE EXPIRED DISPUTE"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Proposal;
