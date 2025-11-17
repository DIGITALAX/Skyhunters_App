"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import { useConnect } from "../../Manage/hooks/useConnect";
import { AppContext } from "@/app/lib/Providers";
import useCouncil from "../hooks/useCouncil";
import useStats from "../hooks/useStats";
import Countdown from "../../Common/modules/Countdown";

export default function CouncilEntry({ dict }: { dict: any }) {
  const { isConnected } = useConnect();
  const context = useContext(AppContext);
  const router = useRouter();
  const yesLabel = dict?.common_yes;
  const noLabel = dict?.common_no;
  const pendingLabel = dict?.common_pending;
  const {
    councilLoading,
    activeTab,
    setActiveTab,
    votes,
    disputeVoteLoading,
    blacklistVoteLoading,
    penaltyVoteLoading,
    proposePenaltyLoading,
    executeBlacklistLoading,
    voteOnDispute,
    voteOnBlacklist,
    voteOnPenalty,
    executeMarketBlacklist,
    hasUserVoted,
    getTimeUntilDeadline,
    proposePenaltyForgiveness,
    targetAddress,
    setTargetAddress,
  } = useCouncil(dict);

  const {
    allBlacklists,
    allDisputes,
    allForgiveness,
    allProposals,
    hasMoreBlacklists,
    hasMoreDisputes,
    hasMoreForgiveness,
    hasMoreProposals,
    loadingBlacklists,
    loadingDisputes,
    loadingForgiveness,
    loadingProposals,
    loadBlacklists,
    loadDisputes,
    loadForgiveness,
    loadProposals,
  } = useStats();

  if (!isConnected) {
    return (
      <div className="border-2 border-gray-400 p-4 bg-gray-100 min-h-screen">
        <h2 className="text-lg text-blue-800 mb-3">{dict?.council_title}</h2>
        <div className="border-2 border-red-600 bg-red-100 p-3 text-xs">
          {dict?.council_connect_wallet_notice}
        </div>
      </div>
    );
  }

  if (!context?.roles?.council) {
    return (
      <div className="border-2 border-gray-400 p-4 bg-gray-100 min-h-screen">
        <h2 className="text-lg text-blue-800 mb-3">{dict?.council_title}</h2>
        <div className="border-2 border-red-600 bg-red-100 p-3 text-xs">
          {dict?.council_role_required}
        </div>
      </div>
    );
  }

  return (
    <main className="border-2 border-gray-400 p-4 bg-gray-100 min-h-screen">
      <h2 className="text-lg text-blue-800 mb-3">{dict?.council_title}</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "proposals", label: dict?.council_tab_proposals },
          { key: "blacklists", label: dict?.council_tab_blacklists },
          { key: "forgive penalties", label: dict?.council_tab_forgive },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1 border-2 border-gray-400 text-xs ${
              activeTab === tab.key
                ? "bg-blue-200 border-blue-600"
                : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {councilLoading && (
        <div className="border border-gray-400 p-2 bg-white mb-3">
          <div className="text-xs">{dict?.council_loading_votes}</div>
        </div>
      )}

      {activeTab === "proposals" && (
        <div className="border border-gray-400 p-2 bg-white">
          <h3 className="font-bold mb-3">{dict?.council_all_proposals}</h3>

          <InfiniteScroll
            dataLength={allProposals.length}
            next={loadProposals}
            hasMore={hasMoreProposals}
            loader={
              <div className="border border-gray-400 p-2 bg-gray-50 text-center text-xs">
                {dict?.council_loading_more_proposals}
              </div>
            }
          >
            <div className="space-y-3">
              {allProposals.map((proposal, index) => (
                <div
                  key={index}
                  className="border-2 border-black bg-gray-50 p-3"
                >
                  <div className="font-bold text-xs mb-2">
                    {dict?.council_proposal_label} #{proposal.proposalId}
                  </div>

                  {proposal.market && (
                    <>
                      <div className="text-xs mb-1">
                        <span className="font-bold">
                          {dict?.council_market_id}
                        </span>{" "}
                        {proposal.market.marketId}
                      </div>
                      <div
                        className="text-xs mb-2 text-blue-600 underline cursor-pointer"
                        onClick={() =>
                          router.push(`/market/${proposal.market?.marketId}`)
                        }
                      >
                        {proposal.market.metadata?.question ||
                          dict?.council_no_question}
                      </div>
                    </>
                  )}

                  <div className="text-xs mb-1">
                    {dict?.council_answer}{" "}
                    {proposal.finalAnswer
                      ? proposal.finalAnswer === "1"
                        ? yesLabel
                        : noLabel
                      : proposal.answer === "1"
                      ? dict?.council_answer_yes_proposed
                      : proposal.answer === "0"
                      ? dict?.council_answer_no_proposed
                      : pendingLabel}
                  </div>

                  <div className="text-xs mb-1">
                    {dict?.council_proposer} {proposal.proposer?.slice(0, 6)}...
                    {proposal.proposer?.slice(-4)}
                  </div>

                  {proposal.disputed && (
                    <div className="text-xs mb-1 text-red-600 font-bold">
                      {dict?.council_disputed}
                      {proposal.disputer && (
                        <span className="text-gray-600 font-normal">
                          {" "}
                          {dict?.council_disputed_by}{" "}
                          {proposal.disputer.slice(0, 6)}...
                          {proposal.disputer.slice(-4)}
                        </span>
                      )}
                    </div>
                  )}

                  {proposal.expired && (
                    <div className="text-xs mb-1 text-gray-600">
                      {dict?.council_expired}
                    </div>
                  )}
                </div>
              ))}

              {allProposals.length === 0 && !loadingProposals && (
                <div className="text-xs text-gray-600 text-center p-4">
                  {dict?.council_no_proposals}
                </div>
              )}
            </div>
          </InfiniteScroll>

          <div className="border-t-2 border-black mt-4 pt-4">
            <h3 className="font-bold mb-3">{dict?.council_disputes_title}</h3>

            <InfiniteScroll
              dataLength={allDisputes.length}
              next={loadDisputes}
              hasMore={hasMoreDisputes}
              loader={
                <div className="border border-gray-400 p-2 bg-gray-50 text-center text-xs">
                  {dict?.council_loading_more_disputes}
                </div>
              }
            >
              <div className="space-y-3">
                {allDisputes.map((dispute, index) => (
                  <div
                    key={index}
                    className="border-2 border-red-600 bg-red-50 p-3"
                  >
                    <div className="font-bold text-xs mb-2">
                      {dict?.council_dispute_on_proposal} #{dispute.proposalId}
                    </div>

                    {dispute.market && (
                      <>
                        <div className="text-xs mb-1">
                          <span className="font-bold">
                            {dict?.council_market_id}
                          </span>{" "}
                          {dispute.market.marketId}
                        </div>
                        <div
                          className="text-xs mb-2 text-blue-600 underline cursor-pointer"
                          onClick={() =>
                            router.push(`/market/${dispute.market?.marketId}`)
                          }
                        >
                          {dispute.market.metadata?.question ||
                            dict?.council_no_question}
                        </div>
                      </>
                    )}

                    <div className="text-xs mb-1">
                      {dict?.council_original_answer}{" "}
                      {dispute.answer === "1"
                        ? yesLabel
                        : dispute.answer === "0"
                        ? noLabel
                        : pendingLabel}
                    </div>

                    <div className="text-xs mb-1">
                      {dict?.council_council_votes} - {dict?.council_votes_yes}{" "}
                      {dispute.yesDisputeVotes || "0"} | {dict?.council_votes_no}{" "}
                      {dispute.noDisputeVotes || "0"}
                    </div>

                    <div className="text-xs mb-1 text-gray-600">
                      {dict?.council_voting_period}{" "}
                      <Countdown
                        endTime={dispute.councilWindowEnds}
                        dict={dict}
                      />
                    </div>

                    <div className="text-xs mb-1 font-bold">
                      {dict?.council_outcome}{" "}
                      {dispute.disputePassed
                        ? dict?.council_outcome_dispute_passed
                        : dispute.finalAnswer
                        ? dict?.council_outcome_dispute_rejected
                        : dict?.council_outcome_pending}
                    </div>

                    <div className="text-xs mb-2 text-gray-600">
                      {dict?.council_proposer} {dispute.proposer?.slice(0, 6)}...
                      {dispute.proposer?.slice(-4)}
                      {dispute.disputer && (
                        <span>
                          {" "}
                          | {dict?.council_disputed_by}{" "}
                          {dispute.disputer.slice(0, 6)}...
                          {dispute.disputer.slice(-4)}
                        </span>
                      )}
                    </div>

                    {!hasUserVoted(dispute) &&
                    getTimeUntilDeadline(dispute.councilWindowEnds) !==
                      dict?.council_expired ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            voteOnDispute(Number(dispute.proposalId), true)
                          }
                          disabled={
                            disputeVoteLoading === `${dispute.proposalId}-true`
                          }
                          className="px-2 py-1 border-2 border-black bg-green-200 text-xs disabled:opacity-50"
                        >
                          {disputeVoteLoading === `${dispute.proposalId}-true`
                            ? dict?.council_voting
                            : dict?.council_support_dispute}
                        </button>
                        <button
                          onClick={() =>
                            voteOnDispute(Number(dispute.proposalId), false)
                          }
                          disabled={
                            disputeVoteLoading === `${dispute.proposalId}-false`
                          }
                          className="px-2 py-1 border-2 border-black bg-red-200 text-xs disabled:opacity-50"
                        >
                          {disputeVoteLoading === `${dispute.proposalId}-false`
                            ? dict?.council_voting
                            : dict?.council_reject_dispute}
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 font-bold">
                        {hasUserVoted(dispute)
                          ? dict?.council_already_voted
                          : dict?.council_voting_ended}
                      </div>
                    )}
                  </div>
                ))}

                {allDisputes.length === 0 && !loadingDisputes && (
                  <div className="text-xs text-gray-600 text-center p-4">
                    {dict?.council_no_proposals}
                  </div>
                )}
              </div>
            </InfiniteScroll>
          </div>
        </div>
      )}

      {activeTab === "blacklists" && (
        <div className="border border-gray-400 p-2 bg-white">
          <h3 className="font-bold mb-3">{dict?.council_blacklist_title}</h3>

          <InfiniteScroll
            dataLength={allBlacklists.length}
            next={loadBlacklists}
            hasMore={hasMoreBlacklists}
            loader={
              <div className="border border-gray-400 p-2 bg-gray-50 text-center text-xs">
                {dict?.council_loading_more_blacklists}
              </div>
            }
          >
            <div className="space-y-3">
              {allBlacklists.map((blacklist, index) => (
                <div
                  key={index}
                  className="border-2 border-black bg-gray-50 p-3"
                >
                  <div className="font-bold text-xs mb-2">
                    {dict?.council_blacklist_label} #{blacklist.blacklistId}
                  </div>

                  {blacklist.market && (
                    <>
                      <div className="text-xs mb-1">
                        <span className="font-bold">
                          {dict?.council_market_id}
                        </span>{" "}
                        {blacklist.market.marketId}
                      </div>
                      <div
                        className="text-xs mb-2 text-blue-600 underline cursor-pointer"
                        onClick={() =>
                          router.push(`/market/${blacklist.market?.marketId}`)
                        }
                      >
                        {blacklist.market.metadata?.question ||
                          dict?.council_no_question}
                      </div>
                    </>
                  )}

                  <div className="text-xs mb-1">
                    {dict?.council_council_votes} - {dict?.council_votes_yes}{" "}
                    {blacklist.yesVotes} | {dict?.council_votes_no}{" "}
                    {blacklist.noVotes}
                  </div>

                  <div className="text-xs mb-1 text-gray-600">
                    {dict?.council_voting_period}{" "}
                    <Countdown endTime={blacklist.deadline} dict={dict} />
                  </div>

                  <div className="text-xs mb-1 font-bold">
                    {dict?.council_outcome}{" "}
                    {blacklist.executed
                      ? dict?.council_outcome_executed
                      : Number(blacklist.yesVotes) > Number(blacklist.noVotes)
                      ? dict?.council_outcome_passed
                      : Number(blacklist.yesVotes) < Number(blacklist.noVotes)
                      ? dict?.council_outcome_rejected
                      : dict?.council_outcome_pending}
                  </div>

                  <div className="text-xs mb-1 text-gray-600">
                    {dict?.council_proposer} {blacklist.proposer.slice(0, 6)}...
                    {blacklist.proposer.slice(-4)}
                  </div>

                  {blacklist.metadata && (
                    <div className="text-xs mb-2 text-gray-600">
                      {dict?.council_reason} {blacklist.metadata.reason}
                    </div>
                  )}

                  {!hasUserVoted(blacklist) &&
                  getTimeUntilDeadline(blacklist.deadline) !== dict?.council_expired ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          voteOnBlacklist(Number(blacklist.blacklistId), true)
                        }
                        disabled={
                          blacklistVoteLoading ===
                          `${blacklist.blacklistId}-true`
                        }
                        className="px-2 py-1 border-2 border-black bg-green-200 text-xs disabled:opacity-50"
                      >
                        {blacklistVoteLoading ===
                        `${blacklist.blacklistId}-true`
                          ? dict?.council_voting
                          : dict?.council_support_blacklist}
                      </button>
                      <button
                        onClick={() =>
                          voteOnBlacklist(Number(blacklist.blacklistId), false)
                        }
                        disabled={
                          blacklistVoteLoading ===
                          `${blacklist.blacklistId}-false`
                        }
                        className="px-2 py-1 border-2 border-black bg-red-200 text-xs disabled:opacity-50"
                      >
                        {blacklistVoteLoading ===
                        `${blacklist.blacklistId}-false`
                          ? dict?.council_voting
                          : dict?.council_reject_blacklist}
                      </button>
                    </div>
                  ) : getTimeUntilDeadline(blacklist.deadline) === dict?.council_expired &&
                    !blacklist.executed &&
                    Number(blacklist.yesVotes) > Number(blacklist.noVotes) &&
                    context?.roles?.blacklister &&
                    blacklist.market &&
                    Date.now() / 1000 < parseInt(blacklist.market.endTime) ? (
                    <button
                      onClick={() =>
                        executeMarketBlacklist(Number(blacklist.blacklistId))
                      }
                      disabled={
                        executeBlacklistLoading ===
                        String(blacklist.blacklistId)
                      }
                      className="w-full bg-purple-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
                    >
                      {executeBlacklistLoading === String(blacklist.blacklistId)
                        ? dict?.council_executing
                        : dict?.council_execute_blacklist}
                    </button>
                  ) : (
                    <div className="text-xs text-gray-600 font-bold">
                      {hasUserVoted(blacklist)
                        ? dict?.council_already_voted
                        : dict?.council_voting_ended}
                    </div>
                  )}
                </div>
              ))}

              {allBlacklists.length === 0 && !loadingBlacklists && (
                <div className="text-xs text-gray-600 text-center p-4">
                  {dict?.council_no_blacklists}
                </div>
              )}
            </div>
          </InfiniteScroll>
        </div>
      )}

      {activeTab === "forgive penalties" && (
        <div className="border border-gray-400 p-2 bg-white">
          <h3 className="font-bold mb-3">{dict?.council_penalty_title}</h3>

          <div className="border-2 border-black bg-gray-50 p-3 mb-4">
            <h4 className="font-bold text-xs mb-2">
              {dict?.council_penalty_create_title}
            </h4>
            <div className="text-xs text-gray-600 mb-2">
              {dict?.council_penalty_create_subtitle}
            </div>
            <input
              type="text"
              placeholder={dict?.council_penalty_target_placeholder}
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              className="w-full p-2 border-2 border-black mb-2 text-xs"
            />
            <button
              onClick={proposePenaltyForgiveness}
              disabled={proposePenaltyLoading || !targetAddress}
              className="w-full bg-blue-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
            >
              {proposePenaltyLoading
                ? dict?.council_penalty_creating
                : dict?.council_penalty_create}
            </button>
          </div>

          <h4 className="font-bold text-xs mb-3">
            {dict?.council_penalty_all_title}
          </h4>

          <InfiniteScroll
            dataLength={allForgiveness.length}
            next={loadForgiveness}
            hasMore={hasMoreForgiveness}
            loader={
              <div className="border border-gray-400 p-2 bg-gray-50 text-center text-xs">
                {dict?.council_loading_more_penalties}
              </div>
            }
          >
            <div className="space-y-3">
              {allForgiveness.map((penalty, index) => (
                <div
                  key={index}
                  className="border-2 border-black bg-gray-50 p-3"
                >
                  <div className="font-bold text-xs mb-2">
                    {dict?.council_penalty_label} #{penalty.penaltyForgiveId}
                  </div>

                  <div className="text-xs mb-1">
                    {dict?.council_target_user} {penalty.targetUser.slice(0, 6)}
                    ...
                    {penalty.targetUser.slice(-4)}
                  </div>

                  <div className="text-xs mb-1">
                    {dict?.council_council_votes} - {dict?.council_votes_yes}{" "}
                    {penalty.yesVotes} | {dict?.council_votes_no}{" "}
                    {penalty.noVotes}
                  </div>

                  <div className="text-xs mb-1 text-gray-600">
                    {dict?.council_voting_period}{" "}
                    <Countdown endTime={penalty.deadline} dict={dict} />
                  </div>

                  <div className="text-xs mb-1 font-bold">
                    {dict?.council_outcome}{" "}
                    {penalty.executed
                      ? dict?.council_outcome_executed
                      : dict?.council_outcome_pending}
                  </div>

                  <div className="text-xs mb-2 text-gray-600">
                    {dict?.council_proposer} {penalty.proposer.slice(0, 6)}...
                    {penalty.proposer.slice(-4)}
                  </div>

                  {!hasUserVoted(penalty) &&
                  getTimeUntilDeadline(penalty.deadline) !== dict?.council_expired ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          voteOnPenalty(Number(penalty.penaltyForgiveId), true)
                        }
                        disabled={
                          penaltyVoteLoading ===
                          `${penalty.penaltyForgiveId}-true`
                        }
                        className="px-2 py-1 border-2 border-black bg-green-200 text-xs disabled:opacity-50"
                      >
                        {penaltyVoteLoading ===
                        `${penalty.penaltyForgiveId}-true`
                          ? dict?.council_voting
                          : dict?.council_forgive_penalty}
                      </button>
                      <button
                        onClick={() =>
                          voteOnPenalty(Number(penalty.penaltyForgiveId), false)
                        }
                        disabled={
                          penaltyVoteLoading ===
                          `${penalty.penaltyForgiveId}-false`
                        }
                        className="px-2 py-1 border-2 border-black bg-red-200 text-xs disabled:opacity-50"
                      >
                        {penaltyVoteLoading ===
                        `${penalty.penaltyForgiveId}-false`
                          ? dict?.council_voting
                          : dict?.council_maintain_penalty}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 font-bold">
                      {hasUserVoted(penalty)
                        ? dict?.council_already_voted
                        : dict?.council_voting_ended}
                    </div>
                  )}
                </div>
              ))}

              {allForgiveness.length === 0 && !loadingForgiveness && (
                <div className="text-xs text-gray-600 text-center p-4">
                  {dict?.council_no_penalties}
                </div>
              )}
            </div>
          </InfiniteScroll>
        </div>
      )}
    </main>
  );
}
