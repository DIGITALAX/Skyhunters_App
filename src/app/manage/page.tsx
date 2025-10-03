"use client";

import { useContext } from "react";
import { useConnect } from "../components/Manage/hooks/useConnect";
import useManage from "../components/Manage/hooks/useManage";
import { AppContext } from "../lib/Providers";
import { formatEther } from "viem";

export default function Manage() {
  const { address, isConnected, openModal, disconnect, formatAddress } =
    useConnect();
  const context = useContext(AppContext);
  const {
    userInfo,
    userInfoLoading,
    checkRoleStatus,
    roleStatusLoading,
    executePenaltyLoading,
    redeemWinnings,
    claimCouncilRewards,
    executePenaltyForgiveness,
    navigateToMarket,
  } = useManage();

  return (
    <main className="border-2 border-gray-400 p-4 bg-gray-100 min-h-screen">
      <h2 className="text-lg text-blue-800 mb-3">USER DASHBOARD</h2>

      <div className="space-y-4">
        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">
            WALLET CONNECTION
          </h3>
          {!isConnected ? (
            <button
              onClick={openModal}
              className="px-3 py-1 border-2 border-black bg-yellow-200 text-xs"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs">
                Connected: {formatAddress(address!)}
              </span>
              <button
                onClick={disconnect}
                className="px-2 py-1 border-2 border-black bg-gray-300 text-xs"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {isConnected && userInfoLoading && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              LOADING USER DATA...
            </h3>
            <div className="text-xs">
              Please wait while we fetch your information...
            </div>
          </div>
        )}

        {isConnected && userInfo && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              USER STATISTICS
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center border border-black p-2">
                <div className="font-bold text-xs">PARTICIPATION POINTS</div>
                <div className="text-lg">{userInfo.participationPoints}</div>
              </div>
              <div className="text-center border border-black p-2">
                <div className="font-bold text-xs">SUCCESSFUL PROPOSALS</div>
                <div className="text-lg">{userInfo.successfulProposals}</div>
              </div>
              <div className="text-center border border-black p-2">
                <div className="font-bold text-xs">SUCCESSFUL DISPUTES</div>
                <div className="text-lg">{userInfo.successfulDisputes}</div>
              </div>
              <div className="text-center border border-black p-2">
                <div className="font-bold text-xs">FAILED ACTIONS</div>
                <div className="text-lg">{userInfo.failedActions}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-black p-2">
                <div className="font-bold text-xs mb-1">COUNCIL REWARDS</div>
                <div className="text-xs">
                  Pending:{" "}
                  {formatEther(BigInt(userInfo.totalPendingRewards || "0"))}{" "}
                  MONA
                </div>
                <div className="text-xs">
                  Claimed:{" "}
                  {formatEther(BigInt(userInfo.councilRewardsClaimed || "0"))}{" "}
                  MONA
                </div>
                <div className="text-xs mb-2">
                  Slash Multiplier:{" "}
                  {(Number(userInfo.slashMultiplier || "0") / 100).toFixed(2)}%
                </div>
                {BigInt(userInfo.totalPendingRewards || "0") > BigInt(0) && (
                  <button
                    onClick={claimCouncilRewards}
                    disabled={roleStatusLoading}
                    className="w-full bg-blue-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                  >
                    {roleStatusLoading ? "CLAIMING..." : "CLAIM COUNCIL REWARDS"}
                  </button>
                )}
              </div>
              <div className="border border-black p-2">
                <div className="font-bold text-xs mb-1">ACTIVITY INFO</div>
                <div className="text-xs">
                  First Activity: Block {userInfo.firstActivityBlock}
                </div>
                <div className="text-xs">
                  Eligible Disputes: {userInfo.eligibleDisputeCount}
                </div>
              </div>
            </div>
          </div>
        )}

        {isConnected &&
          userInfo &&
          userInfo.marketActivity &&
          userInfo.marketActivity.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                MARKET ACTIVITY
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userInfo.marketActivity.map((activity, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold w-fit text-xs mb-1 text-blue-600 underline cursor-pointer"
                      onClick={() => navigateToMarket(activity.market.marketId)}
                    >
                      {activity.market.metadata?.question ||
                        "Market " + activity.market.marketId}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        YES Shares:{" "}
                        {formatEther(BigInt(activity.yesShares || "0"))}
                      </div>
                      <div>
                        NO Shares:{" "}
                        {formatEther(BigInt(activity.noShares || "0"))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      Status:{" "}
                      {activity.market.isFinalized
                        ? "FINALIZED"
                        : activity.market.isBlacklisted
                        ? "BLACKLISTED"
                        : "ACTIVE"}
                      {activity.market.isFinalized && (
                        <span>
                          {" "}
                          | Result:{" "}
                          {activity.market.finalAnswer === "1" ? "YES" : "NO"}
                        </span>
                      )}
                    </div>

                    {activity.market.isFinalized &&
                      !activity.winningsRedeemed && (
                        <button
                          onClick={() =>
                            redeemWinnings(Number(activity.market.marketId))
                          }
                          disabled={roleStatusLoading}
                          className="w-full bg-green-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                        >
                          {roleStatusLoading
                            ? "REDEEMING..."
                            : "REDEEM WINNINGS"}
                        </button>
                      )}

                    {activity.winningsRedeemed && (
                      <div className="text-xs text-green-600 font-bold">
                        ✓ WINNINGS REDEEMED
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo.proposals &&
          userInfo.proposals.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                YOUR PROPOSALS
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.proposals.map((proposal, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs mb-1 cursor-pointer text-blue-600 underline "
                      onClick={() => navigateToMarket(proposal.proposalId)}
                    >
                      Proposal #{proposal.proposalId}
                    </div>
                    <div className="text-xs">
                      Answer:{" "}
                      {proposal.answer === "1"
                        ? "YES"
                        : proposal.answer === "0"
                        ? "NO"
                        : "PENDING"}
                    </div>
                    <div className="text-xs">
                      Disputed: {proposal.disputed ? "YES" : "NO"}
                    </div>
                    <div className="text-xs">
                      Final Answer:{" "}
                      {proposal.finalAnswer === "1"
                        ? "YES"
                        : proposal.finalAnswer === "0"
                        ? "NO"
                        : "PENDING"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo.disputes &&
          userInfo.disputes.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                YOUR DISPUTES
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.disputes.map((dispute, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs mb-1 cursor-pointer text-blue-600 underline"
                      onClick={() => navigateToMarket(dispute.proposalId)}
                    >
                      Proposal #{dispute.proposalId}
                    </div>
                    <div className="text-xs">
                      Original Answer:{" "}
                      {dispute.answer === "1"
                        ? "YES"
                        : dispute.answer === "0"
                        ? "NO"
                        : "PENDING"}
                    </div>
                    <div className="text-xs">
                      Dispute Passed: {dispute.disputePassed ? "YES" : "NO"}
                    </div>
                    <div className="text-xs">
                      Final Answer:{" "}
                      {dispute.finalAnswer === "1"
                        ? "YES"
                        : dispute.finalAnswer === "0"
                        ? "NO"
                        : "PENDING"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo.blacklists &&
          userInfo.blacklists.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                YOUR BLACKLIST PROPOSALS
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.blacklists.map((blacklist, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs text-blue-600 underline cursor-pointer mb-1"
                      onClick={() =>
                        blacklist.market &&
                        navigateToMarket(blacklist.market.marketId)
                      }
                    >
                      Blacklist #{blacklist.blacklistId}
                    </div>
                    <div className="text-xs">
                      Votes - YES: {blacklist.yesVotes} | NO:{" "}
                      {blacklist.noVotes}
                    </div>
                    <div className="text-xs">
                      Executed: {blacklist.executed ? "YES" : "NO"}
                    </div>
                    <div className="text-xs">
                      Deadline:{" "}
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
          userInfo.winnings &&
          userInfo.winnings.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                WINNINGS HISTORY
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.winnings.map((winning, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs text-blue-600 underline cursor-pointer mb-1"
                      onClick={() => navigateToMarket(winning.market.marketId)}
                    >
                      {winning.market.metadata?.question ||
                        "Market " + winning.market.marketId}
                    </div>
                    <div className="text-xs">
                      Amount: {formatEther(BigInt(winning.amount))} MONA
                    </div>
                    <div className="text-xs">
                      Redeemed:{" "}
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
          userInfo.proposalVotes &&
          userInfo.proposalVotes.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                PROPOSAL VOTES
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.proposalVotes.map((vote, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs mb-1 cursor-pointer text-blue-600 underline"
                      onClick={() =>
                        vote.proposal?.proposalId &&
                        navigateToMarket(vote.proposal?.proposalId)
                      }
                    >
                      Vote {index + 1}
                    </div>
                    <div className="text-xs">
                      Support: {vote.support ? "YES" : "NO"}
                    </div>
                    <div className="text-xs">
                      Voted:{" "}
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
          userInfo.blacklistVotes &&
          userInfo.blacklistVotes.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                BLACKLIST VOTES
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.blacklistVotes.map((vote, index) => (
                  <div key={index} className="border border-black p-2">
                    <div
                      className="font-bold text-xs mb-1 cursor-pointer text-blue-600 underline"
                      onClick={() =>
                        vote.blacklist?.market?.marketId &&
                        navigateToMarket(vote.blacklist?.market?.marketId)
                      }
                    >
                      Vote {index + 1}
                    </div>
                    <div className="text-xs">
                      Support: {vote.support ? "YES" : "NO"}
                    </div>
                    <div className="text-xs">
                      Voted:{" "}
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
          userInfo.penaltyVotes &&
          userInfo.penaltyVotes.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                PENALTY VOTES
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.penaltyVotes.map((vote, index) => (
                  <div key={index} className="border border-black p-2">
                    <div className="font-bold text-xs mb-1">
                      Vote {index + 1}
                    </div>
                    <div className="text-xs">
                      Support: {vote.support ? "YES" : "NO"}
                    </div>
                    <div className="text-xs">
                      Voted:{" "}
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
          userInfo.penalties &&
          userInfo.penalties.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                PENALTIES CREATED
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.penalties.map((penalty, index) => (
                  <div key={index} className="border border-black p-2">
                    <div className="font-bold text-xs mb-1">
                      Target: {penalty.targetUser}
                    </div>
                    <div className="text-xs">
                      YES Votes: {penalty.yesVotes} | NO Votes:{" "}
                      {penalty.noVotes}
                    </div>
                    <div className="text-xs mb-1">
                      Executed: {penalty.executed ? "YES" : "NO"}
                    </div>
                    <div className="text-xs mb-2">
                      Deadline:{" "}
                      {new Date(
                        Number(penalty.deadline) * 1000
                      ).toLocaleString()}
                    </div>

                    {!penalty.executed && Number(penalty.deadline) * 1000 < Date.now() && (
                      <button
                        onClick={() => executePenaltyForgiveness(Number(penalty.penaltyForgiveId))}
                        disabled={executePenaltyLoading}
                        className="w-full bg-blue-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                      >
                        {executePenaltyLoading ? "EXECUTING..." : "EXECUTE PENALTY FORGIVENESS"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected &&
          userInfo &&
          userInfo.penaltiesRecieved &&
          userInfo.penaltiesRecieved.length > 0 && (
            <div className="border-2 border-black bg-white p-3">
              <h3 className="text-md font-bold text-black mb-2">
                PENALTIES RECEIVED
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userInfo.penaltiesRecieved.map((penalty, index) => (
                  <div key={index} className="border border-black p-2">
                    <div className="font-bold text-xs mb-1">
                      Proposer: {penalty.proposer}
                    </div>
                    <div className="text-xs">
                      YES Votes: {penalty.yesVotes} | NO Votes:{" "}
                      {penalty.noVotes}
                    </div>
                    <div className="text-xs mb-1">
                      Executed: {penalty.executed ? "YES" : "NO"}
                    </div>
                    <div className="text-xs mb-2">
                      Deadline:{" "}
                      {new Date(
                        Number(penalty.deadline) * 1000
                      ).toLocaleString()}
                    </div>

                    {!penalty.executed && Number(penalty.deadline) * 1000 < Date.now() && (
                      <button
                        onClick={() => executePenaltyForgiveness(Number(penalty.penaltyForgiveId))}
                        disabled={executePenaltyLoading}
                        className="w-full bg-blue-200 text-black py-1 text-xs border-2 disabled:opacity-50"
                      >
                        {executePenaltyLoading ? "EXECUTING..." : "EXECUTE PENALTY FORGIVENESS"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {isConnected && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">YOUR ROLES</h3>
            <div className="space-y-3">
              {[
                { key: "creator", label: "Creator", value: 0 },
                { key: "proposer", label: "Proposer", value: 1 },
                { key: "blacklister", label: "Blacklister", value: 2 },
                { key: "council", label: "Council", value: 3 },
              ].map((role) => {
                const hasRole =
                  context?.roles?.[role.key as keyof typeof context.roles];

                return (
                  <div key={role.key} className="border border-black p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold">
                        {role.label}: {hasRole ? "TRUE" : "FALSE"}
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
                        disabled={roleStatusLoading}
                        className="px-2 py-1 border-2 border-black bg-gray-300 text-xs disabled:opacity-50"
                      >
                        {roleStatusLoading ? "Checking..." : "Check Status"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isConnected && (
          <div className="border-2 border-black bg-white p-3">
            <h3 className="text-md font-bold text-black mb-2">
              ACCOUNT DETAILS
            </h3>
            <div className="text-xs space-y-1">
              <p>Address: {address}</p>
              <p>
                Network: Lens Network{" "}
                {process.env.NEXT_PUBLIC_NETWORK === "mainnet"
                  ? "Mainnet"
                  : "Testnet"}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
