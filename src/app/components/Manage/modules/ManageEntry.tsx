"use client";

import { AppContext } from "@/app/lib/Providers";
import { useContext } from "react";
import { formatEther } from "viem";
import { useConnect } from "../hooks/useConnect";
import useManage from "../hooks/useManage";
import Countdown from "../../Common/modules/Countdown";

export default function ManageEntry({ dict }: { dict: any }) {
  const { address, isConnected, changeLanguage } = useConnect();
  const context = useContext(AppContext);
  const {
    userInfo,
    userInfoLoading,
    createdMarkets,
    createdMarketsLoading,
    cancelMarket,
    cancellingMarket,
    checkRoleStatus,
    checkingRole,
    redeemingWinnings,
    redeemingFailedActivity,
    redeemingFailedCreated,
    claimingRewards,
    executePenaltyLoading,
    redeemWinnings,
    redeemFailedMarketActivity,
    redeemFailedMarketCreated,
    claimCouncilRewards,
    executePenaltyForgiveness,
    navigateToMarket,
    roleRequirements,
    roleRequirementsLoading,
    getRoleRequirements,
  } = useManage(dict);

  const roleCards = [
    { key: "creator", label: dict?.role_creator, value: 0 },
    { key: "proposer", label: dict?.role_proposer, value: 1 },
    { key: "blacklister", label: dict?.role_blacklister, value: 2 },
    { key: "council", label: dict?.role_council, value: 3 },
  ] as const;

  const yesLabel = dict?.common_yes;
  const noLabel = dict?.common_no;
  const trueLabel = dict?.common_true;
  const falseLabel = dict?.common_false;
  const pendingLabel = dict?.common_pending;
  const marketPrefix = dict?.manage_market_prefix;
  const votePrefix = dict?.manage_vote_prefix;

  return (
    <main className="border-2 border-gray-400 p-4 bg-gray-100 min-h-screen">
      <h2 className="text-lg text-blue-800 mb-3">{dict?.manage_title}</h2>

      <div className="space-y-4">
        {isConnected && userInfoLoading && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              {dict?.manage_loading_title}
            </h3>
            <div className="text-xs">{dict?.manage_loading_body}</div>
          </div>
        )}

        {isConnected && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              {dict?.manage_user_statistics}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center border border-black p-2">
                <div className="font-bold text-xs">
                  {dict?.manage_participation_points}
                </div>
                <div className="text-lg">
                  {userInfo?.participationPoints ?? 0}
                </div>
              </div>
              <div className="text-center border border-black p-2">
                <div className="font-bold text-xs">
                  {dict?.manage_successful_proposals}
                </div>
                <div className="text-lg">
                  {userInfo?.successfulProposals ?? 0}
                </div>
              </div>
              <div className="text-center border border-black p-2">
                <div className="font-bold text-xs">
                  {dict?.manage_successful_disputes}
                </div>
                <div className="text-lg">
                  {userInfo?.successfulDisputes ?? 0}
                </div>
              </div>
              <div className="text-center border border-black p-2">
                <div className="font-bold text-xs">
                  {dict?.manage_failed_actions}
                </div>
                <div className="text-lg">{userInfo?.failedActions ?? 0}</div>
              </div>
            </div>

            <div className="flex flex-row sm:flex-nowrap flex-wrap gap-4">
              <div className="border flex w-full relative items-center justify-center flex-col border-black p-2">
                <div className="font-bold text-xs mb-1">
                  {dict?.manage_council_rewards}
                </div>
                <div className="text-xs">
                  {dict?.manage_pending_label}{" "}
                  {formatEther(BigInt(userInfo?.totalPendingRewards || "0"))}{" "}
                  MONA
                </div>
                <div className="text-xs">
                  {dict?.manage_claimed_label}{" "}
                  {formatEther(BigInt(userInfo?.councilRewardsClaimed || "0"))}{" "}
                  MONA
                </div>
                <div className="text-xs mb-2">
                  {dict?.manage_slash_multiplier}{" "}
                  {(Number(userInfo?.slashMultiplier || "0") / 100).toFixed(2)}%
                </div>
                {BigInt(userInfo?.totalPendingRewards || "0") > BigInt(0) && (
                  <button
                    onClick={claimCouncilRewards}
                    disabled={claimingRewards}
                    className="w-full bg-blue-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                  >
                    {claimingRewards
                      ? dict?.manage_claim_council_rewards_loading
                      : dict?.manage_claim_council_rewards}
                  </button>
                )}
              </div>
              <div className="border flex flex-col w-full relative items-center justify-center border-black p-2">
                <div className="font-bold text-xs mb-1">
                  {dict?.manage_activity_info}
                </div>
                <div className="text-xs">
                  {dict?.manage_first_activity}{" "}
                  {userInfo?.firstActivityBlock ?? 0}
                </div>
                <div className="text-xs">
                  {dict?.manage_eligible_disputes}{" "}
                  {userInfo?.eligibleDisputeCount ?? 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {isConnected &&
          userInfo &&
          userInfo?.marketActivity &&
          userInfo?.marketActivity.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_market_activity}
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userInfo?.marketActivity.map((activity, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className={`font-bold w-fit text-xs mb-1 ${
                        activity.market.isCancelled
                          ? "text-gray-400"
                          : "text-blue-600 underline cursor-pointer"
                      }`}
                      onClick={() =>
                        navigateToMarket(
                          activity.market.marketId,
                          activity.market.isCancelled
                        )
                      }
                    >
                      {activity.market.metadata?.question ||
                        `${marketPrefix} ${activity.market.marketId}`}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        {dict?.manage_yes_shares}{" "}
                        {formatEther(BigInt(activity.yesShares || "0"))}
                      </div>
                      <div>
                        {dict?.manage_no_shares}{" "}
                        {formatEther(BigInt(activity.noShares || "0"))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      {dict?.manage_status_label}{" "}
                      {activity.market.isCancelled
                        ? dict?.manage_status_cancelled
                        : activity.market.isBlacklisted
                        ? dict?.manage_status_blacklisted
                        : activity.market.isExpired
                        ? dict?.manage_status_expired
                        : activity.market.isFinalized
                        ? dict?.manage_status_finalized
                        : dict?.manage_status_active}
                      {activity.market.isFinalized && (
                        <span>
                          {" "}
                          | {dict?.manage_result}{" "}
                          {activity.market.finalAnswer === "1"
                            ? yesLabel
                            : noLabel}
                        </span>
                      )}
                    </div>

                    {(activity.market.isBlacklisted ||
                      activity.market.isExpired ||
                      activity.market.isCancelled) &&
                      !activity.market.isFinalized &&
                      (BigInt(activity.yesShares || "0") > BigInt(0) ||
                        BigInt(activity.noShares || "0") > BigInt(0)) && (
                        <button
                          onClick={() =>
                            redeemFailedMarketActivity(
                              Number(activity.market.marketId)
                            )
                          }
                          disabled={
                            redeemingFailedActivity === activity.market.marketId
                          }
                          className="w-full bg-orange-200 text-black py-1 text-xs border-2 disabled:opacity-50 mb-2"
                        >
                          {redeemingFailedActivity === activity.market.marketId
                            ? dict?.manage_redeeming
                            : dict?.manage_redeem_failed_market}
                        </button>
                      )}

                    {activity.market.isFinalized &&
                      !activity.winningsRedeemed &&
                      ((activity.market.finalAnswer === "1" &&
                        BigInt(activity.yesShares || "0") > BigInt(0)) ||
                        (activity.market.finalAnswer === "0" &&
                          BigInt(activity.noShares || "0") > BigInt(0))) && (
                        <button
                          onClick={() =>
                            redeemWinnings(Number(activity.market.marketId))
                          }
                          disabled={
                            redeemingWinnings === activity.market.marketId
                          }
                          className="w-full bg-green-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                        >
                          {redeemingWinnings === activity.market.marketId
                            ? dict?.manage_redeeming
                            : dict?.manage_redeem_winnings}
                        </button>
                      )}

                    {activity.winningsRedeemed && (
                      <div className="text-xs text-green-600 font-bold">
                        {dict?.manage_winnings_redeemed}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.proposals &&
          userInfo?.proposals.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_your_proposals}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.proposals.map((proposal, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs mb-1 cursor-pointer text-blue-600 underline "
                      onClick={() => navigateToMarket(proposal.proposalId)}
                    >
                      {dict?.manage_proposal} #{proposal.proposalId}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_answer}{" "}
                      {proposal.answer === "1"
                        ? yesLabel
                        : proposal.answer === "0"
                        ? noLabel
                        : pendingLabel}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_disputed}{" "}
                      {proposal.disputed ? yesLabel : noLabel}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_final_answer}{" "}
                      {proposal.finalAnswer === "1"
                        ? yesLabel
                        : proposal.finalAnswer === "0"
                        ? noLabel
                        : pendingLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.disputes &&
          userInfo?.disputes.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_your_disputes}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.disputes.map((dispute, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs mb-1 cursor-pointer text-blue-600 underline"
                      onClick={() => navigateToMarket(dispute.proposalId)}
                    >
                      {dict?.manage_proposal} #{dispute.proposalId}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_original_answer}{" "}
                      {dispute.answer === "1"
                        ? yesLabel
                        : dispute.answer === "0"
                        ? noLabel
                        : pendingLabel}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_dispute_passed}{" "}
                      {dispute.disputePassed ? yesLabel : noLabel}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_final_answer}{" "}
                      {dispute.finalAnswer === "1"
                        ? yesLabel
                        : dispute.finalAnswer === "0"
                        ? noLabel
                        : pendingLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.blacklists &&
          userInfo?.blacklists.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_your_blacklist_proposals}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.blacklists.map((blacklist, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs text-blue-600 underline cursor-pointer mb-1"
                      onClick={() =>
                        blacklist.market &&
                        navigateToMarket(blacklist.market.marketId)
                      }
                    >
                      {dict?.manage_blacklist} #{blacklist.blacklistId}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_votes_yes} {blacklist.yesVotes} |{" "}
                      {dict?.manage_votes_no} {blacklist.noVotes}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_executed}{" "}
                      {blacklist.executed ? yesLabel : noLabel}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_deadline}{" "}
                      {new Date(
                        Number(blacklist.deadline) * 1000
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.winnings &&
          userInfo?.winnings.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_winnings_history}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.winnings.map((winning, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs text-blue-600 underline cursor-pointer mb-1"
                      onClick={() => navigateToMarket(winning.market.marketId)}
                    >
                      {winning.market.metadata?.question ||
                        `${marketPrefix} ${winning.market.marketId}`}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_amount} {formatEther(BigInt(winning.amount))}{" "}
                      MONA
                    </div>
                    <div className="text-xs">
                      {dict?.manage_redeemed}{" "}
                      {new Date(
                        Number(winning.blockTimestamp) * 1000
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.proposalVotes &&
          userInfo?.proposalVotes.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_proposal_votes}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.proposalVotes.map((vote, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs mb-1 cursor-pointer text-blue-600 underline"
                      onClick={() =>
                        vote.proposal?.proposalId &&
                        navigateToMarket(vote.proposal?.proposalId)
                      }
                    >
                      {votePrefix} {index + 1}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_support} {vote.support ? yesLabel : noLabel}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_voted}{" "}
                      {new Date(
                        Number(vote.blockTimestamp) * 1000
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.blacklistVotes &&
          userInfo?.blacklistVotes.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_blacklist_votes}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.blacklistVotes.map((vote, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs mb-1 cursor-pointer text-blue-600 underline"
                      onClick={() =>
                        vote.blacklist?.market?.marketId &&
                        navigateToMarket(vote.blacklist?.market?.marketId)
                      }
                    >
                      {votePrefix} {index + 1}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_support} {vote.support ? yesLabel : noLabel}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_voted}{" "}
                      {new Date(
                        Number(vote.blockTimestamp) * 1000
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.penaltyVotes &&
          userInfo?.penaltyVotes.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_penalty_votes}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.penaltyVotes.map((vote, index) => (
                  <div key={index} className="border border-black p-2">
                    <div className="font-bold text-xs mb-1">
                      {votePrefix} {index + 1}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_support} {vote.support ? yesLabel : noLabel}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_voted}{" "}
                      {new Date(
                        Number(vote.blockTimestamp) * 1000
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.penalties &&
          userInfo?.penalties.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_penalties_created}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.penalties.map((penalty, index) => (
                  <div key={index} className="border border-black p-2">
                    <div className="font-bold text-xs mb-1">
                      {dict?.manage_target} {penalty.targetUser}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_yes_votes} {penalty.yesVotes} |{" "}
                      {dict?.manage_no_votes} {penalty.noVotes}
                    </div>
                    <div className="text-xs mb-1">
                      {dict?.manage_executed}{" "}
                      {penalty.executed ? yesLabel : noLabel}
                    </div>
                    <div className="text-xs mb-2">
                      {dict?.manage_deadline}{" "}
                      {new Date(
                        Number(penalty.deadline) * 1000
                      ).toLocaleString()}
                    </div>

                    {!penalty.executed &&
                      Number(penalty.deadline) * 1000 < Date.now() && (
                        <button
                          onClick={() =>
                            executePenaltyForgiveness(
                              Number(penalty.penaltyForgiveId)
                            )
                          }
                          disabled={
                            executePenaltyLoading === penalty.penaltyForgiveId
                          }
                          className="w-full bg-blue-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                        >
                          {executePenaltyLoading === penalty.penaltyForgiveId
                            ? dict?.manage_executing
                            : dict?.manage_execute_penalty_forgiveness}
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo?.penaltiesRecieved &&
          userInfo?.penaltiesRecieved.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                {dict?.manage_penalties_received}
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo?.penaltiesRecieved.map((penalty, index) => (
                  <div key={index} className="border border-black p-2">
                    <div className="font-bold text-xs mb-1">
                      {dict?.manage_proposer} {penalty.proposer}
                    </div>
                    <div className="text-xs">
                      {dict?.manage_yes_votes} {penalty.yesVotes} |{" "}
                      {dict?.manage_no_votes} {penalty.noVotes}
                    </div>
                    <div className="text-xs mb-1">
                      {dict?.manage_executed}{" "}
                      {penalty.executed ? yesLabel : noLabel}
                    </div>
                    <div className="text-xs mb-2">
                      {dict?.manage_deadline}{" "}
                      {new Date(
                        Number(penalty.deadline) * 1000
                      ).toLocaleString()}
                    </div>

                    {!penalty.executed &&
                      Number(penalty.deadline) * 1000 < Date.now() && (
                        <button
                          onClick={() =>
                            executePenaltyForgiveness(
                              Number(penalty.penaltyForgiveId)
                            )
                          }
                          disabled={
                            executePenaltyLoading === penalty.penaltyForgiveId
                          }
                          className="w-full bg-blue-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                        >
                          {executePenaltyLoading === penalty.penaltyForgiveId
                            ? dict?.manage_executing
                            : dict?.manage_execute_penalty_forgiveness}
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected && (
          <div className="border-2 border-black bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-bold text-black">
                {dict?.manage_roles}
              </h3>
              <button
                onClick={getRoleRequirements}
                disabled={roleRequirementsLoading}
                className="px-2 py-1 border-2 border-black bg-gray-200 text-[10px] uppercase tracking-wider disabled:opacity-50"
              >
                {roleRequirementsLoading
                  ? dict?.manage_refreshing_requirements
                  : dict?.manage_refresh_requirements}
              </button>
            </div>
            <div className="space-y-3">
              {roleCards.map((role) => {
                const hasRole =
                  context?.roles?.[role.key as keyof typeof context.roles];
                const isChecking = checkingRole === role.key;
                const requirement = roleRequirements[role.key];

                return (
                  <div
                    key={role.key}
                    className="border border-black p-2 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold">
                        {role.label}: {hasRole ? trueLabel : falseLabel}
                      </div>
                      <button
                        onClick={() =>
                          checkRoleStatus(
                            role.key as
                              | "creator"
                              | "proposer"
                              | "blacklister"
                              | "council"
                          )
                        }
                        disabled={checkingRole !== null}
                        className="px-2 py-1 border-2 border-black bg-white text-xs disabled:opacity-50"
                      >
                        {isChecking
                          ? dict?.manage_checking_status
                          : dict?.manage_check_status}
                      </button>
                    </div>
                    <div className="mt-2 border-t border-dashed border-gray-300 pt-2">
                      <div className="text-[10px] font-bold text-gray-600 mb-1">
                        {dict?.manage_role_requirements}
                      </div>
                      {roleRequirementsLoading && !requirement ? (
                        <div className="text-[11px] text-gray-500">
                          {dict?.manage_loading_requirements}
                        </div>
                      ) : requirement ? (
                        <>
                          <div className="text-[11px] mb-1">
                            {dict?.manage_threshold}{" "}
                            {requirement.threshold.toString()}
                          </div>
                          <div className="space-y-1">
                            {requirement.tokenRequirements.length > 0 ? (
                              requirement.tokenRequirements.map(
                                (token, index) => (
                                  <div
                                    key={`${token.tokenAddress}-${index}`}
                                    className="border border-gray-300 bg-white p-2 text-[11px]"
                                  >
                                    <div className="truncate">
                                      {dict?.manage_contract}{" "}
                                      {token.tokenAddress}
                                    </div>
                                    <div>
                                      {dict?.manage_amount_required}{" "}
                                      {token.minAmount.toString()}
                                    </div>
                                    <div>
                                      {dict?.manage_is_nft}{" "}
                                      {token.isNFT ? yesLabel : noLabel}
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="text-[11px] text-gray-500">
                                {dict?.manage_no_token_requirements}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-gray-500">
                          {dict?.manage_requirements_unavailable}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isConnected && createdMarkets && createdMarkets.length > 0 && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              {dict?.manage_markets_created}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdMarkets.map((market) => {
                const isCreator =
                  market.creator?.toLowerCase() === address?.toLowerCase();
                const isNotExpired = Number(market.endTime) * 1000 > Date.now();
                const hasNoVolume = parseFloat(market.totalVolume) === 0;
                const canCancel =
                  isCreator &&
                  isNotExpired &&
                  hasNoVolume &&
                  !market.isFinalized &&
                  !market.isCancelled &&
                  !market.isExpired &&
                  !market.isBlacklisted;
                const isCancelling = cancellingMarket === market.marketId;

                return (
                  <div
                    key={market.marketId}
                    className="border-2 border-black bg-white h-fit p-3"
                  >
                    <div className="flex flex-col">
                      <div
                        className={market.isCancelled ? "" : "cursor-pointer"}
                        onClick={() =>
                          navigateToMarket(market.marketId, market.isCancelled)
                        }
                      >
                        <div className="mb-2 flex flex-row flex-wrap gap-1">
                          <span className="text-xs font-bold bg-gray-200 px-2 py-1 border border-black">
                            {market.isCancelled
                              ? dict?.manage_status_cancelled
                              : market.isFinalized
                              ? dict?.manage_status_finalized
                              : dict?.manage_status_active}
                          </span>
                          {market.isBlacklisted && (
                            <span className="text-xs font-bold bg-red-200 px-2 py-1 border border-black">
                              {dict?.manage_blacklisted_badge}
                            </span>
                          )}
                          {canCancel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelMarket(market.marketId);
                              }}
                              disabled={cancellingMarket !== null}
                              className="text-xs font-bold bg-red-300 px-2 py-1 border border-black disabled:opacity-50 hover:bg-red-400"
                            >
                              {isCancelling
                                ? dict?.manage_cancelling
                                : dict?.manage_cancel}
                            </button>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-black mb-2 line-clamp-3">
                          {market.metadata?.question || dict?.manage_no_question}
                        </h3>

                        <div className="text-xs text-black space-y-1">
                          <div>
                            {dict?.manage_volume}{" "}
                            {(parseFloat(market.totalVolume) / 1e18).toFixed(0)}{" "}
                            MONA
                          </div>
                          {!market.isFinalized && !market.isCancelled ? (
                            <div className="font-bold text-red-600">
                              <Countdown endTime={market.endTime} dict={dict} />
                            </div>
                          ) : (
                            <div>
                              {dict?.manage_ended}{" "}
                              {new Date(
                                Number(market.endTime) * 1000
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {market.isFinalized && (
                            <div>
                              {dict?.manage_result}{" "}
                              <strong>
                                {market.finalAnswer === "1"
                                  ? yesLabel
                                  : noLabel}
                              </strong>
                            </div>
                          )}
                          <div
                            className="text-blue-600 underline cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `https://explorer.lens.xyz/tx/${market.transactionHash}`,
                                "_blank"
                              );
                            }}
                          >
                            {dict?.manage_view_tx}{" "}
                            {market.transactionHash.slice(0, 8)}...
                          </div>
                        </div>
                      </div>

                      {market.isBlacklisted &&
                        !market.isFinalized &&
                        !market.isCancelled &&
                        isCreator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              redeemFailedMarketCreated(
                                Number(market.marketId)
                              );
                            }}
                            disabled={
                              redeemingFailedCreated === market.marketId
                            }
                            className="w-full mt-2 bg-orange-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                          >
                            {redeemingFailedCreated === market.marketId
                              ? dict?.manage_redeeming
                              : dict?.manage_redeem_failed_market}
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isConnected && createdMarketsLoading && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              {dict?.manage_loading_created_markets}
            </h3>
            <div className="text-xs">
              {dict?.manage_loading_created_markets_body}
            </div>
          </div>
        )}

        {isConnected && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              LANGUAGE / IDIOMA
            </h3>
            <div className="flex flex-row gap-2">
              <button
                onClick={changeLanguage}
                className="w-full bg-blue-200 text-black py-2 text-xs font-bold border-2"
              >
                {dict?.language_code === "en" ? "AUSSIE" : "CASTELLANO"}
              </button>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              {dict?.manage_account_details}
            </h3>
            <div className="text-xs space-y-1">
              <p>
                {dict?.manage_address} {address}
              </p>
              <p>
                {dict?.manage_network} {dict?.manage_network_lens}{" "}
                {dict?.manage_network_mainnet}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
