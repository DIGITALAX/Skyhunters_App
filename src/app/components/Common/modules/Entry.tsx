"use client";

import { FunctionComponent } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useExplore from "../hooks/useExplore";
import Countdown from "./Countdown";

const Entry: FunctionComponent<{ dict: any }> = ({ dict }) => {
  const {
    explore,
    exploreLoading,
    hasMoreExplore,
    loadMoreExplore,
    handleMarketClick,
    formatDate,
    filter,
    setFilter,
  } = useExplore();

  return (
    <main className="border-2 border-gray-400 p-4 bg-gray-100">
      <div className="flex flex-col gap-4 w-full h-fit relative">
        <h2 className="text-lg text-blue-800 mb-3">{dict?.explore_title}</h2>

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { value: "all", label: dict?.explore_filter_all },
            { value: "active", label: dict?.explore_filter_active },
            { value: "finalized", label: dict?.explore_filter_finalized },
            { value: "blacklisted", label: dict?.explore_filter_blacklisted },
            { value: "proposed", label: dict?.explore_filter_proposed },
            { value: "disputed", label: dict?.explore_filter_disputed },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-3 py-1 border-2 text-xs ${
                filter === filterOption.value
                  ? "bg-blue-200 text-black"
                  : "bg-gray-200 text-black"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        <InfiniteScroll
          dataLength={explore?.length || 0}
          next={loadMoreExplore}
          hasMore={hasMoreExplore}
          loader={
            <div className="border border-gray-400 p-4 bg-white text-center">
              {dict?.explore_loading}
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {explore?.map((market) => (
              <div
                key={market.marketId}
                className={`border-2 border-black bg-white h-48 p-3 ${
                  market.isCancelled ? "opacity-50" : "cursor-pointer"
                }`}
                onClick={() =>
                  !market.isCancelled && handleMarketClick(market.marketId)
                }
              >
                <div className="h-full flex flex-col">
                  <div className="mb-2">
                    <span className="text-xs font-bold bg-gray-200 px-2 py-1 border border-black">
                      {market.isCancelled
                        ? dict?.explore_cancelled
                        : market.isBlacklisted
                        ? dict?.manage_status_blacklisted
                        : market.isExpired
                        ? dict?.manage_status_expired
                        : market.isFinalized
                        ? dict?.manage_status_finalized
                        : dict?.manage_status_active}
                    </span>
                    {market.isBlacklisted && (
                      <span className="text-xs font-bold bg-red-200 px-2 py-1 border border-black ml-1">
                        {dict?.manage_blacklisted_badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-black mb-2 line-clamp-3 flex-1">
                    {market.metadata?.question || dict?.manage_no_question}
                  </h3>

                  <div className="text-xs text-black space-y-1">
                    <div>
                      {dict?.explore_volume}{" "}
                      {(parseFloat(market.totalVolume) / 1e18).toFixed(0)} MONA
                    </div>
                    {!market.isFinalized && !market.isCancelled ? (
                      <div className="font-bold text-red-600">
                        <Countdown endTime={market.endTime} dict={dict} />
                      </div>
                    ) : (
                      <div>
                        {dict?.explore_ended} {formatDate(market.endTime)}
                      </div>
                    )}
                    {market.isFinalized && (
                      <div>
                        {dict?.manage_result}{" "}
                        <strong>
                          {market.finalAnswer === "1"
                            ? dict?.common_yes
                            : dict?.common_no}
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
                      {dict?.manage_view_tx} {market.transactionHash.slice(0, 8)}
                      ...
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {explore?.length === 0 && !exploreLoading && (
              <div className="border border-gray-400 p-4 bg-white text-center text-gray-500 mb-6">
                {dict?.explore_no_markets}
              </div>
            )}
          </div>
        </InfiniteScroll>
      </div>
    </main>
  );
};

export default Entry;
