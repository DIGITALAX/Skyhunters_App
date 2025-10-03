"use client";

import useExplore from "./components/Common/hooks/useExplore";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Home() {
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
      <div>
        <h2 className="text-lg text-blue-800 mb-3">Explore Markets</h2>

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "finalized", label: "Finalized" },
            { value: "blacklisted", label: "Blacklisted" },
            { value: "proposed", label: "Proposed" },
            { value: "disputed", label: "Disputed" },
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
              Loading more markets...
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {explore?.map((market) => (
              <div
                key={market.marketId}
                className="border-2 border-black bg-white cursor-pointer h-48 p-3"
                onClick={() => handleMarketClick(market.marketId)}
              >
                <div className="h-full flex flex-col">
                  <div className="mb-2">
                    <span className="text-xs font-bold bg-gray-200 px-2 py-1 border border-black">
                      {market.isFinalized ? "FINALIZED" : "ACTIVE"}
                    </span>
                    {market.isBlacklisted && (
                      <span className="text-xs font-bold bg-red-200 px-2 py-1 border border-black ml-1">
                        BLACKLISTED
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-black mb-2 line-clamp-3 flex-1">
                    {market.metadata?.question || "No question available"}
                  </h3>

                  <div className="text-xs text-black space-y-1">
                    <div>Volume: {(parseFloat(market.totalVolume) / 1e18).toFixed(0)} MONA</div>
                    <div>Ends: {formatDate(market.endTime)}</div>
                    {market.isFinalized && (
                      <div>Result: <strong>{market.finalAnswer === "1" ? "YES" : "NO"}</strong></div>
                    )}
                    <div 
                      className="text-blue-600 underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://block-explorer.testnet.lens.dev/tx/${market.transactionHash}`, '_blank');
                      }}
                    >
                      View TX: {market.transactionHash.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {explore?.length === 0 && !exploreLoading && (
              <div className="border border-gray-400 p-4 bg-white text-center text-gray-500">
                No markets found
              </div>
            )}
          </div>
        </InfiniteScroll>
      </div>
    </main>
  );
}
