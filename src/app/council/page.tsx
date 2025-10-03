"use client";

import { useContext } from "react";
import { AppContext } from "../lib/Providers";
import { useConnect } from "../components/Manage/hooks/useConnect";
import useCouncil from "../components/Council/hooks/useCouncil";
import { useRouter } from "next/navigation";

export default function Council() {
  const { isConnected } = useConnect();
  const context = useContext(AppContext);
  const router = useRouter();
  const {
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
    proposePenaltyForgiveness,
    targetAddress,
    setTargetAddress,
  } = useCouncil();

  if (!isConnected) {
    return (
      <div className="border-2 border-gray-400 p-4 bg-gray-100 min-h-screen">
        <h2 className="text-lg text-blue-800 mb-3">COUNCIL DASHBOARD</h2>
        <div className="border-2 border-red-600 bg-red-100 p-3 text-xs">
          Please connect your wallet to access council functions
        </div>
      </div>
    );
  }

  // if (!context?.roles?.council) {
  //   return (
  //     <div className="border-2 border-gray-400 p-4 bg-gray-100 min-h-screen">
  //       <h2 className="text-lg text-blue-800 mb-3">COUNCIL DASHBOARD</h2>
  //       <div className="border-2 border-red-600 bg-red-100 p-3 text-xs">
  //         You need Council role to access this page
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <main className="border-2 border-gray-400 p-4 bg-gray-100 min-h-screen">
      <h2 className="text-lg text-blue-800 mb-3">COUNCIL DASHBOARD</h2>

      <div className="mb-4 flex space-x-2">
        {["disputes", "blacklists", "forgive penalties"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1 border-2 border-gray-400 text-xs ${
              activeTab === tab
                ? "bg-blue-200 border-blue-600"
                : "bg-gray-200"
            }`}
           
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {councilLoading && (
        <div className="border border-gray-400 p-2 bg-white mb-3">
          <div className="text-xs">Loading council votes...</div>
        </div>
      )}

      {activeTab === "disputes" && (
        <div className="border border-gray-400 p-2 bg-white">
          <h3 className="font-bold mb-2">Proposal Disputes</h3>
          
          {votes.disputes.length === 0 ? (
            <div className="text-xs text-gray-600">No active proposal disputes</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {votes.disputes.map((dispute, index) => (
                <div key={index} className="border-b border-gray-200 pb-2">
                  <div 
                    className="font-bold text-xs mb-1 text-blue-600 underline cursor-pointer"
                    onClick={() => router.push(`/market/${dispute.proposalId}`)}
                  >
                    Proposal #{dispute.proposalId}
                  </div>
                  
                  <div className="text-xs mb-1">
                    Original Answer: {dispute.answer === "1" ? "YES" : dispute.answer === "0" ? "NO" : "PENDING"}
                  </div>
                  
                  <div className="text-xs mb-1">
                    Council Votes - YES: {dispute.yesDisputeVotes || "0"} | NO: {dispute.noDisputeVotes || "0"}
                  </div>
                  
                  <div className="text-xs mb-1 text-gray-600">
                    Time Left: {getTimeUntilDeadline(dispute.councilWindowEnds)}
                  </div>
                  
                  <div className="text-xs mb-2 text-gray-600">
                    Proposer: {dispute.proposer?.slice(0, 6)}...{dispute.proposer?.slice(-4)}
                    {dispute.disputer && (
                      <span> | Disputer: {dispute.disputer.slice(0, 6)}...{dispute.disputer.slice(-4)}</span>
                    )}
                  </div>

                  {!hasUserVoted(dispute) && getTimeUntilDeadline(dispute.councilWindowEnds) !== "EXPIRED" ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => voteOnDispute(Number(dispute.proposalId), true)}
                        disabled={disputeVoteLoading}
                        className="px-2 py-1 border-2 bg-green-200 text-xs disabled:opacity-50"
                       
                      >
                        {disputeVoteLoading ? "Voting..." : "Support Dispute"}
                      </button>
                      <button
                        onClick={() => voteOnDispute(Number(dispute.proposalId), false)}
                        disabled={disputeVoteLoading}
                        className="px-2 py-1 border-2 bg-red-200 text-xs disabled:opacity-50"
                       
                      >
                        {disputeVoteLoading ? "Voting..." : "Reject Dispute"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 font-bold">
                      {hasUserVoted(dispute) ? "Already Voted" : "Voting Ended"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "blacklists" && (
        <div className="border border-gray-400 p-2 bg-white">
          <h3 className="font-bold mb-2">Blacklist Proposals</h3>
          
          {votes.blacklists.length === 0 ? (
            <div className="text-xs text-gray-600">No active blacklist proposals</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {votes.blacklists.map((blacklist, index) => (
                <div key={index} className="border-b border-gray-200 pb-2">
                  <div 
                    className="font-bold text-xs mb-1 text-blue-600 underline cursor-pointer"
                    onClick={() => blacklist.market && router.push(`/market/${blacklist.market.marketId}`)}
                  >
                    Blacklist #{blacklist.blacklistId}
                  </div>
                  
                  {blacklist.market && (
                    <div className="text-xs mb-1">
                      Market: {blacklist.market.metadata?.question || `Market ${blacklist.market.marketId}`}
                    </div>
                  )}
                  
                  <div className="text-xs mb-1">
                    Votes - YES: {blacklist.yesVotes} | NO: {blacklist.noVotes}
                  </div>
                  
                  <div className="text-xs mb-1 text-gray-600">
                    Time Left: {getTimeUntilDeadline(blacklist.deadline)}
                  </div>
                  
                  <div className="text-xs mb-1 text-gray-600">
                    Proposer: {blacklist.proposer.slice(0, 6)}...{blacklist.proposer.slice(-4)}
                  </div>

                  {blacklist.metadata && (
                    <div className="text-xs mb-2 text-gray-600">
                      Reason: {blacklist.metadata.reason}
                    </div>
                  )}

                  {!hasUserVoted(blacklist) && getTimeUntilDeadline(blacklist.deadline) !== "EXPIRED" ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => voteOnBlacklist(Number(blacklist.blacklistId), true)}
                        disabled={blacklistVoteLoading}
                        className="px-2 py-1 border-2 bg-green-200 text-xs disabled:opacity-50"
                       
                      >
                        {blacklistVoteLoading ? "Voting..." : "Support Blacklist"}
                      </button>
                      <button
                        onClick={() => voteOnBlacklist(Number(blacklist.blacklistId), false)}
                        disabled={blacklistVoteLoading}
                        className="px-2 py-1 border-2 bg-red-200 text-xs disabled:opacity-50"
                       
                      >
                        {blacklistVoteLoading ? "Voting..." : "Reject Blacklist"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 font-bold">
                      {hasUserVoted(blacklist) ? "Already Voted" : "Voting Ended"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "forgive penalties" && (
        <div className="border border-gray-400 p-2 bg-white">
          <h3 className="font-bold mb-3">Penalty Forgiveness</h3>

          <div className="border-2 border-black bg-gray-50 p-3 mb-4">
            <h4 className="font-bold text-xs mb-2">CREATE PENALTY FORGIVENESS PROPOSAL</h4>
            <div className="text-xs text-gray-600 mb-2">
              Propose to forgive penalties for a user address
            </div>
            <input
              type="text"
              placeholder="Target User Address (0x...)"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              className="w-full p-2 border-2 border-black mb-2 text-xs"
            />
            <button
              onClick={proposePenaltyForgiveness}
              disabled={proposePenaltyLoading || !targetAddress}
              className="w-full bg-blue-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
            >
              {proposePenaltyLoading ? "Creating..." : "Propose Penalty Forgiveness"}
            </button>
          </div>

          <h4 className="font-bold text-xs mb-2">ACTIVE PROPOSALS</h4>

          {votes.penalties.length === 0 ? (
            <div className="text-xs text-gray-600">No active penalty forgiveness proposals</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {votes.penalties.map((penalty, index) => (
                <div key={index} className="border-b border-gray-200 pb-2">
                  <div className="font-bold text-xs mb-1">
                    Penalty Forgiveness Request
                  </div>

                  <div className="text-xs mb-1">
                    Target User: {penalty.targetUser.slice(0, 6)}...{penalty.targetUser.slice(-4)}
                  </div>

                  <div className="text-xs mb-1">
                    Votes - YES: {penalty.yesVotes} | NO: {penalty.noVotes}
                  </div>

                  <div className="text-xs mb-1 text-gray-600">
                    Time Left: {getTimeUntilDeadline(penalty.deadline)}
                  </div>

                  <div className="text-xs mb-2 text-gray-600">
                    Proposer: {penalty.proposer.slice(0, 6)}...{penalty.proposer.slice(-4)}
                  </div>

                  {!hasUserVoted(penalty) && getTimeUntilDeadline(penalty.deadline) !== "EXPIRED" ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => voteOnPenalty(Number(penalty.penaltyForgiveId), true)}
                        disabled={penaltyVoteLoading}
                        className="px-2 py-1 border-2 bg-green-200 text-xs disabled:opacity-50"

                      >
                        {penaltyVoteLoading ? "Voting..." : "Forgive Penalty"}
                      </button>
                      <button
                        onClick={() => voteOnPenalty(Number(penalty.penaltyForgiveId), false)}
                        disabled={penaltyVoteLoading}
                        className="px-2 py-1 border-2 bg-red-200 text-xs disabled:opacity-50"

                      >
                        {penaltyVoteLoading ? "Voting..." : "Maintain Penalty"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 font-bold">
                      {hasUserVoted(penalty) ? "Already Voted" : "Voting Ended"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}