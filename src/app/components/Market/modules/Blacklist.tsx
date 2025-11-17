import { FunctionComponent, JSX, useContext } from "react";
import { BlacklistProps } from "../types/market.types";
import useBlacklist from "../hooks/useBlacklist";
import { AppContext } from "@/app/lib/Providers";
import Countdown from "../../Common/modules/Countdown";

const Blacklist: FunctionComponent<BlacklistProps> = ({
  market,
  getMarketInfo,
  network,
  dict,
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
  } = useBlacklist(market, getMarketInfo, dict);

  const now = Date.now() / 1000;
  const marketEnded = now > parseInt(market.endTime);
  const hasBlacklist = !!market.blacklist;
  const votingEnded = hasBlacklist && now > parseInt(market.blacklist.deadline);
  const canVote =
    hasBlacklist &&
    context?.roles?.council &&
    !votingEnded &&
    !userVoteHistory &&
    !market.blacklist.executed;
  const quorumReached =
    hasBlacklist &&
    Number(market.blacklist.yesVotes) > Number(market.blacklist.noVotes);
  const canExecute =
    hasBlacklist &&
    votingEnded &&
    !market.blacklist.executed &&
    quorumReached &&
    context?.roles?.blacklister &&
    !marketEnded;

  return (
    <div>
      {!hasBlacklist && !marketEnded && context?.roles?.blacklister && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">
            {dict?.blacklist_create_title}
          </h2>

          <input
            type="text"
            placeholder={dict?.blacklist_reason_placeholder}
            value={blacklistValues.reason}
            onChange={(e) =>
              setBlacklistValues({ ...blacklistValues, reason: e.target.value })
            }
            className="w-full p-2 border-2 border-black mb-2 text-xs"
          />

          <textarea
            placeholder={dict?.blacklist_comments_placeholder}
            value={blacklistValues.comments}
            onChange={(e) =>
              setBlacklistValues({
                ...blacklistValues,
                comments: e.target.value,
              })
            }
            className="w-full p-2 border-2 border-black mb-2 text-xs h-20 resize-none"
          />

          <button
            onClick={createBlacklist}
            disabled={blacklistLoading || !blacklistValues.reason}
            className="w-full bg-red-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
          >
            {blacklistLoading
              ? dict?.blacklist_creating
              : dict?.blacklist_create_button}
          </button>
        </div>
      )}

      {hasBlacklist && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">
            {dict?.blacklist_data_title}
          </h2>

          <table className="w-full text-xs border-collapse mb-3">
            <tbody>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_id}
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.blacklistId}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_proposer}
                </td>
                <td className="border break-all border-black p-1">
                  {market.blacklist.proposer}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_deadline}
                </td>
                <td className="border border-black p-1">
                  {new Date(
                    parseInt(market.blacklist.deadline) * 1000
                  ).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_voting_period}
                </td>
                <td className="border border-black p-1">
                  <Countdown endTime={market.blacklist.deadline} dict={dict} />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_votes}
                </td>
                <td className="border border-black p-1">
                  {dict?.blacklist_vote_yes_label}: {market.blacklist.yesVotes} |{" "}
                  {dict?.blacklist_vote_no_label}: {market.blacklist.noVotes}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_outcome}
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.executed
                    ? dict?.blacklist_outcome_executed
                    : quorumReached
                    ? dict?.blacklist_outcome_passed
                    : votingEnded
                    ? dict?.blacklist_outcome_rejected
                    : dict?.blacklist_outcome_pending}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_executed}
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.executed
                    ? dict?.blacklist_executed_yes
                    : dict?.blacklist_executed_no}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_reason_uri}
                </td>
                <td className="border border-black p-1">
                  <a
                    href={market.blacklist.uri}
                    target="_blank"
                    className="text-blue-600 break-all underline"
                  >
                    {market.blacklist.uri}
                  </a>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_reason}
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.metadata?.reason ||
                    dict?.common_not_available}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 bg-gray-200 font-bold">
                  {dict?.blacklist_comments}
                </td>
                <td className="border border-black p-1">
                  {market.blacklist.metadata?.comments ||
                    dict?.common_not_available}
                </td>
              </tr>
            </tbody>
          </table>

          {canVote ? (
            <div className="mb-3">
              <div className="font-bold text-xs mb-2">
                {dict?.blacklist_vote_title}
              </div>
              <div className="flex flex-row sm:flex-nowrap flex-wrap gap-2 mb-2">
                <button
                  onClick={() => setVote(true)}
                  className={`px-2 py-1 items-center justify-center border-2 text-center flex w-full border-black text-xs ${
                    vote === true ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {dict?.blacklist_vote_yes}
                </button>
                <button
                  onClick={() => setVote(false)}
                  className={`px-2 py-1 items-center justify-center border-2 text-center flex w-full border-black text-xs ${
                    vote === false ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {dict?.blacklist_vote_no}
                </button>
              </div>
              <button
                onClick={voteOnBlacklist}
                disabled={blacklistVoteLoading || vote === undefined}
                className="w-full bg-red-200 text-black py-2 disabled:opacity-50 text-xs font-bold flex text-center items-center justify-center border-2"
              >
                {blacklistVoteLoading
                  ? dict?.blacklist_vote_submitting
                  : dict?.blacklist_vote_submit}
              </button>
            </div>
          ) : userVoteHistory ? (
            <div className="border border-red-600 bg-red-100 p-2 mb-3">
              <div className="font-bold text-red-800">
                {dict?.blacklist_your_vote_title}
              </div>
              <div className="text-xs text-red-700">
                {dict?.blacklist_you_voted}{" "}
                <strong>
                  {userVoteHistory.support
                    ? dict?.blacklist_vote_yes_label
                    : dict?.blacklist_vote_no_label}
                </strong>
              </div>
            </div>
          ) : !context?.roles?.council ? (
            <div className="text-xs text-gray-600 mb-3">
              {dict?.blacklist_council_required}
            </div>
          ) : votingEnded ? (
            <div className="text-xs text-gray-600 mb-3">
              {dict?.blacklist_voting_ended}
            </div>
          ) : market.blacklist.executed ? (
            <div className="text-xs text-gray-600 mb-3">
              {dict?.blacklist_executed_text}
            </div>
          ) : null}

          {canExecute && (
            <button
              onClick={executeBlacklistDispute}
              disabled={executeLoading}
              className="w-full bg-blue-200 text-black py-2 mb-3 disabled:opacity-50 text-xs font-bold border-2"
            >
              {executeLoading
                ? dict?.blacklist_executing
                : dict?.blacklist_execute_button}
            </button>
          )}

          {market.blacklist.votes && market.blacklist.votes.length > 0 && (
            <div className="border border-black p-2">
              <h3 className="font-bold mb-2">{dict?.blacklist_votes_title}</h3>
              <div className="max-h-32 overflow-y-auto">
                {market.blacklist.votes.map((vote, i) => (
                  <div
                    key={i}
                    className="text-xs border-b border-gray-300 pb-1 mb-1"
                  >
                    <strong>{vote.voter}</strong>{" "}
                    {dict?.blacklist_vote_row.replace(
                      "{vote}",
                      vote.support
                        ? dict?.blacklist_vote_yes_label
                        : dict?.blacklist_vote_no_label
                    )}{" "}
                    | {dict?.common_block_number?.replace("{number}", vote.blockNumber)} |
                    <a
                      href={`${network.blockExplorer}/tx/${vote.transactionHash}`}
                      target="_blank"
                      className="text-blue-600 break-all underline ml-1"
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
