"use client";

import useMarket from "@/app/components/Market/hooks/useMarket";
import { useParams } from "next/navigation";
import { getCurrentNetwork } from "@/app/lib/constants";
import MarketDetails from "@/app/components/Market/modules/MarketDetails";
import Proposal from "@/app/components/Market/modules/Proposal";
import Blacklist from "@/app/components/Market/modules/Blacklist";
import Orders from "@/app/components/Market/modules/Orders";

export default function Market() {
  const { marketId } = useParams();
  const network = getCurrentNetwork();
  const {
    marketLoading,
    market,
    orderLoading,
    setOrderValues,
    approved,
    orderValues,
    handlePlaceOrder,
    approveMonaSpending,
    getMarketInfo,
    cancelOrder,
    splitPosition,
    mergePositions,
    ordersTab,
    setOrdersTab,
    splitAmount,
    setSplitAmount,
    mergeAmount,
    setMergeAmount,
  } = useMarket(Number(marketId));

  if (marketLoading)
    return (
      <div className="border-2 border-black p-4 bg-gray-100">
        Loading market data...
      </div>
    );
  if (!market)
    return (
      <div className="border-2 border-black p-4 bg-gray-100">
        ERROR: Market not found
      </div>
    );

  return (
    <main className="border-2 border-black p-4 bg-gray-100 min-h-screen">
      <MarketDetails market={market} network={network} />
       <Proposal
          market={market}
          network={network}
          getMarketInfo={getMarketInfo}
        />
      {market.blacklist && (
        <Blacklist
          market={market}
          network={network}
          getMarketInfo={getMarketInfo}
        />
      )}

      <div className="border-2 border-black bg-white p-3 mb-4">
        <h2 className="text-lg font-bold text-black mb-3">
          SPLIT/MERGE POSITIONS
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-bold text-xs mb-1">SPLIT POSITION</div>
            <div className="text-xs text-gray-600 mb-2">
              Convert MONA to YES + NO shares
            </div>
            <input
              type="text"
              placeholder="Amount (MONA)"
              value={splitAmount}
              onChange={(e) => setSplitAmount(e.target.value)}
              className="w-full p-2 border-2 border-black mb-2 text-xs"
            />
            <button
              onClick={() => splitPosition(splitAmount)}
              disabled={orderLoading || !splitAmount}
              className="w-full bg-gray-200 text-black py-1 disabled:opacity-50 text-xs border-2"
             
            >
              {orderLoading ? "Splitting..." : "Split Position"}
            </button>
          </div>

          <div>
            <div className="font-bold text-xs mb-1">MERGE POSITIONS</div>
            <div className="text-xs text-gray-600 mb-2">
              Convert YES + NO shares to MONA
            </div>
            <input
              type="text"
              placeholder="Amount (shares)"
              value={mergeAmount}
              onChange={(e) => setMergeAmount(e.target.value)}
              className="w-full p-2 border-2 border-black mb-2 text-xs"
            />
            <button
              onClick={() => mergePositions(mergeAmount)}
              disabled={orderLoading || !mergeAmount}
              className="w-full bg-gray-200 text-black py-1 disabled:opacity-50 text-xs border-2"
             
            >
              {orderLoading ? "Merging..." : "Merge Positions"}
            </button>
          </div>
        </div>
      </div>

      <Orders
        ordersTab={ordersTab}
        setOrdersTab={setOrdersTab}
        market={market}
        network={network}
        cancelOrder={cancelOrder}
        orderLoading={orderLoading}
      />
      {!market.isFinalized && !market.isBlacklisted && (
        <div className="border-2 border-black bg-white p-3 mb-4">
          <h2 className="text-lg font-bold text-black mb-3">PLACE ORDER</h2>

          {!approved && (
            <div className="border border-red-600 bg-red-100 p-2 mb-3">
              <div className="font-bold text-red-800">APPROVAL REQUIRED</div>
              <div className="text-xs text-red-700 mb-2">
                You need to approve MONA spending before placing orders
              </div>
              <button
                onClick={() => approveMonaSpending()}
                disabled={orderLoading}
                className="bg-red-200 text-black px-3 py-1 text-xs border-2 disabled:opacity-50"
               
              >
                {orderLoading ? "Approving..." : "Approve MONA Spending"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2 mb-3">
            <button
              onClick={() =>
                setOrderValues({ ...orderValues, orderType: "market" })
              }
              className={`px-2 py-1 border-2 text-xs ${
                orderValues.orderType === "market"
                  ? "bg-blue-200"
                  : "bg-gray-200"
              }`}
             
            >
              Market
            </button>
            <button
              onClick={() =>
                setOrderValues({ ...orderValues, orderType: "limit" })
              }
              className={`px-2 py-1 border-2 text-xs ${
                orderValues.orderType === "limit"
                  ? "bg-blue-200"
                  : "bg-gray-200"
              }`}
             
            >
              Limit
            </button>
            <button
              onClick={() => setOrderValues({ ...orderValues, side: "buy" })}
              className={`px-2 py-1 border-2 text-xs ${
                orderValues.side === "buy" ? "bg-green-200" : "bg-gray-200"
              }`}
             
            >
              Buy
            </button>
            <button
              onClick={() => setOrderValues({ ...orderValues, side: "sell" })}
              className={`px-2 py-1 border-2 text-xs ${
                orderValues.side === "sell" ? "bg-red-200" : "bg-gray-200"
              }`}
             
            >
              Sell
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setOrderValues({ ...orderValues, outcome: "yes" })}
              className={`px-2 py-1 border-2 text-xs ${
                orderValues.outcome === "yes"
                  ? "bg-green-200"
                  : "bg-gray-200"
              }`}
             
            >
              Yes
            </button>
            <button
              onClick={() => setOrderValues({ ...orderValues, outcome: "no" })}
              className={`px-2 py-1 border-2 text-xs ${
                orderValues.outcome === "no"
                  ? "bg-red-200"
                  : "bg-gray-200"
              }`}
             
            >
              No
            </button>
          </div>

          <input
            type="text"
            placeholder="AMOUNT (MONA)"
            value={orderValues.amount}
            onChange={(e) =>
              setOrderValues({ ...orderValues, amount: e.target.value })
            }
            className="w-full p-2 border-2 border-black mb-2 text-xs"
          />

          {orderValues.orderType === "limit" && (
            <input
              type="text"
              placeholder="PRICE (MONA)"
              value={orderValues.price}
              onChange={(e) =>
                setOrderValues({ ...orderValues, price: e.target.value })
              }
              className="w-full p-2 border-2 border-black mb-2 text-xs"
            />
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={
              orderLoading ||
              !approved ||
              !orderValues.amount ||
              (orderValues.orderType === "limit" && !orderValues.price)
            }
            className="w-full bg-blue-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
           
          >
            {orderLoading
              ? "Processing..."
              : `Place ${orderValues.orderType.charAt(0).toUpperCase() + orderValues.orderType.slice(1)} Order`}
          </button>
        </div>
      )}
    </main>
  );
}
