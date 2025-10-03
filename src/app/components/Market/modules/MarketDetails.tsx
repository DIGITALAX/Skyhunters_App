import { FunctionComponent, JSX } from "react";
import { MarketDetailsProps } from "../types/market.types";
import { formatEther } from "viem";

const MarketDetails: FunctionComponent<MarketDetailsProps> = ({
  market,
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

  return (
    <div className="border-2 border-black bg-white p-3 mb-4">
      <h1 className="text-lg font-bold text-black mb-3">
        MARKET #{market.marketId}:{" "}
        {market.metadata?.question || "No question available"}
      </h1>

      <table className="w-full text-xs border-collapse">
        <tbody>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              CREATOR
            </td>
            <td className="border border-black p-1">
              <a
                href={`${network.blockExplorer}/address/${market.creator}`}
                target="_blank"
                className="text-blue-600 underline"
              >
                {market.creator}
              </a>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              END TIME
            </td>
            <td className="border border-black p-1">
              {new Date(parseInt(market.endTime) * 1000).toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              PRICE RANGE
            </td>
            <td className="border border-black p-1">
              {Number(market.minPrice)} - {Number(market.maxPrice)} (precision:{" "}
              {Number(market.precision)})
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              URI
            </td>
            <td className="border border-black p-1">
              <a
                href={market.uri}
                target="_blank"
                className="text-blue-600 underline"
              >
                {market.uri}
              </a>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              SOURCE
            </td>
            <td className="border border-black p-1">
              {market.metadata?.source || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              ROUNDING METHOD
            </td>
            <td className="border border-black p-1">
              {market.metadata?.roundingMethod || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              FAILOVER SOURCE
            </td>
            <td className="border border-black p-1">
              {market.metadata?.failoverSource || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              TOTAL VOLUME
            </td>
            <td className="border border-black p-1">
              {formatEther(BigInt(market.totalVolume))} MONA
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              MARKET FEES
            </td>
            <td className="border border-black p-1">
              {formatEther(BigInt(market.marketFees))} MONA
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              STATUS
            </td>
            <td className="border border-black p-1">
              {market.isFinalized ? (
                <span className="font-bold">
                  FINALIZED - RESULT:{" "}
                  {market.finalAnswer === "1" ? "YES" : "NO"}
                </span>
              ) : market.isBlacklisted ? (
                <span className="font-bold text-red-600">BLACKLISTED</span>
              ) : timeUntilEnd > 0 ? (
                <span>
                  ACTIVE - Ends in: {daysLeft}d {hoursLeft}h {minutesLeft}m
                </span>
              ) : (
                <span className="font-bold">ENDED - Awaiting Resolution</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              METADATA URI
            </td>
            <td className="border border-black p-1">
              <a
                href={market.uri}
                target="_blank"
                className="text-blue-600 underline"
              >
                {market.uri}
              </a>
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 bg-gray-200 font-bold">
              CREATION TX
            </td>
            <td className="border border-black p-1">
              Block #{market.blockNumber} |{" "}
              {new Date(
                parseInt(market.blockTimestamp) * 1000
              ).toLocaleString()}{" "}
              |
              <a
                href={`${network.blockExplorer}/tx/${market.transactionHash}`}
                target="_blank"
                className="text-blue-600 underline ml-1"
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
