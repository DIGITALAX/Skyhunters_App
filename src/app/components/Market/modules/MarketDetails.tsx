import { FunctionComponent, JSX } from "react";
import { MarketDetailsProps } from "../types/market.types";
import { formatEther } from "viem";
import Countdown from "../../Common/modules/Countdown";

const MarketDetails: FunctionComponent<MarketDetailsProps> = ({
  market,
  dict,
  network,
}): JSX.Element => {
  const timeUntilEnd = market?.endTime
    ? new Date(parseInt(market.endTime) * 1000).getTime() - Date.now()
    : 0;
  const daysLeft = Math.floor(timeUntilEnd / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor(
    (timeUntilEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutesLeft = Math.floor(
    (timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60)
  );

  const now = Date.now() / 1000;
  const marketEnded = now > parseInt(market.endTime);
  const proposalWindowEnded =
    market.proposalWindowEnds && now > parseInt(market.proposalWindowEnds);
  const hasProposal = !!market.proposal;

  return (
    <div className="border-2 border-black bg-white p-3 mb-4">
      <h1 className="text-lg font-bold text-black mb-3">
        {dict?.market_details_title
          ?.replace("{id}", market.marketId)
          ?.replace("{question}", market.metadata?.question || dict?.market_details_no_question)}
      </h1>

      <table className="w-full text-xs border-collapse">
        <tbody>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_creator}
            </td>
            <td className="border border-black p-1">
              <a
                href={`${network.blockExplorer}/address/${market.creator}`}
                target="_blank"
                className="text-blue-600 break-all underline"
              >
                {market.creator}
              </a>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_end_time}
            </td>
            <td className="border border-black p-1">
              {new Date(parseInt(market.endTime) * 1000).toLocaleString()}
            </td>
          </tr>
          {marketEnded &&
            !hasProposal &&
            !market.isFinalized &&
            !market.isExpired &&
            !market.isBlacklisted &&
            !market.isCancelled && (
              <>
                <tr>
                  <td className="border border-black p-1 bg-yellow-200 font-bold">
                    {dict?.market_details_proposal_ends}
                  </td>
                  <td className="border border-black p-1 bg-yellow-50">
                    {new Date(
                      parseInt(market.proposalWindowEnds) * 1000
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 bg-yellow-200 font-bold">
                    {dict?.market_details_proposal_period}
                  </td>
                  <td className="border border-black p-1 bg-yellow-50">
                    {proposalWindowEnded ? (
                      <span className="font-bold text-red-600">
                        {dict?.market_details_proposal_period_ended}
                      </span>
                    ) : (
                      <Countdown
                        endTime={market.proposalWindowEnds}
                        dict={dict}
                      />
                    )}
                  </td>
                </tr>
              </>
            )}
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_price_range}
            </td>
            <td className="border border-black p-1">
              {Number(market.minPrice)} - {Number(market.maxPrice)} (precision:{" "}
              {Number(market.precision)})
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_source}
            </td>
            <td className="border border-black p-1">
              {market.metadata?.source || dict?.common_not_available}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_rounding}
            </td>
            <td className="border border-black p-1">
              {market.metadata?.roundingMethod || dict?.common_not_available}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_failover}
            </td>
            <td className="border border-black p-1">
              {market.metadata?.failoverSource || dict?.common_not_available}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_total_volume}
            </td>
            <td className="border border-black p-1">
              {formatEther(BigInt(market.totalVolume ?? 0))} MONA
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_market_fees}
            </td>
            <td className="border border-black p-1">
              {formatEther(BigInt(market.marketFees ?? 0))} MONA
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_status}
            </td>
            <td className="border border-black p-1">
              {market.isCancelled ? (
                <span className="font-bold text-gray-600">{dict?.market_details_status_cancelled}</span>
              ) : market.isBlacklisted ? (
                <span className="font-bold text-red-600">{dict?.market_details_status_blacklisted}</span>
              ) : market.isExpired ? (
                <span className="font-bold text-orange-600">{dict?.market_details_status_expired}</span>
              ) : market.isFinalized ? (
                <span className="font-bold">
                  {dict?.market_details_status_finalized}{" "}
                  {market.finalAnswer === "1" ? dict?.common_yes : dict?.common_no}
                </span>
              ) : timeUntilEnd > 0 ? (
                <span>
                  {dict?.market_details_status_active} {daysLeft}d {hoursLeft}h {minutesLeft}m
                </span>
              ) : (
                <span className="font-bold">{dict?.market_details_status_ended}</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_metadata_uri}
            </td>
            <td className="border border-black p-1">
              <a
                href={market.uri}
                target="_blank"
                className="text-blue-600 break-all underline"
              >
                {market.uri}
              </a>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              {dict?.market_details_creation_tx}
            </td>
            <td className="border border-black p-1 flex flex-wrap">
              {dict?.common_block_number?.replace("{number}", market.blockNumber)} |{" "}
              {new Date(
                parseInt(market.blockTimestamp) * 1000
              ).toLocaleString()}{" "}
              |
              <a
                href={`${network.blockExplorer}/tx/${market.transactionHash}`}
                target="_blank"
                className="text-blue-600 break-all underline ml-1"
              >
                {market.transactionHash}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MarketDetails;
