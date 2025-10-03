import { FunctionComponent, JSX, useContext } from "react";
import { BlacklistProps } from "../types/market.types";
import useBlacklist from "../hooks/useBlacklist";
import { AppContext } from "@/app/lib/Providers";

const Blacklist: FunctionComponent<BlacklistProps> = ({
  market,
  getMarketInfo,
  network,
}): JSX.Element => {
  const context = useContext(AppContext);
  const {
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
  } = useBlacklist(market, getMarketInfo);

  const now = Date.now() / 1000;
  const hasBlacklist = !!market.blacklist;
  const votingEnded = hasBlacklist && now > parseInt(market.blacklist.deadline);
  const canVote = hasBlacklist && context?.roles?.council && !votingEnded && !userVoteHistory && !market.blacklist.executed;
  const canExecute = hasBlacklist && votingEnded && !market.blacklist.executed;

  return (
    <div>
      {!hasBlacklist && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">CREATE BLACKLIST PROPOSAL</h2>
          
          {!context?.roles?.blacklister ? (
            <div className="text-xs text-red-600 mb-3">
              You need Blacklister role to create blacklist proposals
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Reason for blacklisting"
                value={blacklistValues.reason}
                onChange={(e) => setBlacklistValues({ ...blacklistValues, reason: e.target.value })}
                className="w-full p-2 border-2 border-black mb-2 text-xs"
              />
              
              <textarea
                placeholder="Additional comments"
                value={blacklistValues.comments}
                onChange={(e) => setBlacklistValues({ ...blacklistValues, comments: e.target.value })}
                className="w-full p-2 border-2 border-black mb-2 text-xs h-20 resize-none"
              />
              
              <button
                onClick={createBlacklist}
                disabled={blacklistLoading || !blacklistValues.reason}
                className="w-full bg-red-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
              >
                {blacklistLoading ? "CREATING..." : "CREATE BLACKLIST PROPOSAL"}
              </button>
            </>
          )}
        </div>
      )}

      {hasBlacklist && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">BLACKLIST DATA</h2>

          <table className="w-full text-xs border-collapse mb-3">
            <tbody>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  BLACKLIST ID
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.blacklistId}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  PROPOSER
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.proposer}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  DEADLINE
                </td>
                <td className="border border-black p-1">
                  {new Date(
                    parseInt(market.blacklist.deadline) * 1000
                  ).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  VOTES
                </td>
                <td className="border border-black p-1">
                  YES: {market.blacklist.yesVotes} | NO: {market.blacklist.noVotes}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  EXECUTED
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.executed ? "YES" : "NO"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  REASON URI
                </td>
                <td className="border border-black p-1">
                  <a
                    href={market.blacklist.uri}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    {market.blacklist.uri}
                  </a>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  REASON
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.metadata?.reason || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  COMMENTS
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.metadata?.comments || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
          
          {canVote ? (
            <div className="mb-3">
              <div className="font-bold text-xs mb-2">VOTE ON BLACKLIST</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => setVote(true)}
                  className={`px-2 py-1 border-2 border-black text-xs ${
                    vote === true ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  YES (Support Blacklist)
                </button>
                <button
                  onClick={() => setVote(false)}
                  className={`px-2 py-1 border-2 border-black text-xs ${
                    vote === false ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  NO (Oppose Blacklist)
                </button>
              </div>
              <button
                onClick={voteOnBlacklist}
                disabled={blacklistVoteLoading || vote === undefined}
                className="w-full bg-red-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
              >
                {blacklistVoteLoading ? "VOTING..." : "SUBMIT VOTE"}
              </button>
            </div>
          ) : userVoteHistory ? (
            <div className="border border-red-600 bg-red-100 p-2 mb-3">
              <div className="font-bold text-red-800">YOUR VOTE</div>
              <div className="text-xs text-red-700">
                You voted: <strong>{userVoteHistory.support ? "YES" : "NO"}</strong>
              </div>
            </div>
          ) : !context?.roles?.council ? (
            <div className="text-xs text-gray-600 mb-3">
              You need Council role to vote on blacklist proposals
            </div>
          ) : votingEnded ? (
            <div className="text-xs text-gray-600 mb-3">
              Voting period has ended
            </div>
          ) : market.blacklist.executed ? (
            <div className="text-xs text-gray-600 mb-3">
              Blacklist proposal has been executed
            </div>
          ) : null}
          
          {canExecute && (
            <button
              onClick={executeBlacklistDispute}
              disabled={executeLoading}
              className="w-full bg-blue-200 text-black py-2 mb-3 disabled:opacity-50 text-xs font-bold border-2"
            >
              {executeLoading ? "EXECUTING..." : "EXECUTE BLACKLIST DECISION"}
            </button>
          )}
          
          {market.blacklist.votes && market.blacklist.votes.length > 0 && (
            <div className="border border-black p-2">
              <h3 className="font-bold mb-2">BLACKLIST VOTES</h3>
              <div className="max-h-32 overflow-y-auto">
                {market.blacklist.votes.map((vote, i) => (
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
    </div>
  );
};

export default Blacklist;
