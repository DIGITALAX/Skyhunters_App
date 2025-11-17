"use client";

import useMarket from "@/app/components/Market/hooks/useMarket";
import { useParams } from "next/navigation";
import { getCurrentNetwork } from "@/app/lib/constants";
import MarketDetails from "@/app/components/Market/modules/MarketDetails";
import Proposal from "@/app/components/Market/modules/Proposal";
import Blacklist from "@/app/components/Market/modules/Blacklist";
import Orders from "@/app/components/Market/modules/Orders";

export default function MarketEntry({ dict }: { dict: any }) {
  const { marketId } = useParams();
  const network = getCurrentNetwork();
  const {
    marketLoading,
    market,
    createOrderLoading,
    cancelOrderLoading,
    fillOrderLoading,
    approveLoading,
    splitLoading,
    mergeLoading,
    expireMarketLoading,
    redeemFailedLoading,
    setOrderValues,
    approved,
    orderValues,
    handlePlaceOrder,
    approveMonaSpending,
    approveSplitPosition,
    getMarketInfo,
    cancelOrder,
    fillOrder,
    splitPosition,
    mergePositions,
    expireMarket,
    redeemFailedMarket,
    ordersTab,
    setOrdersTab,
    splitAmount,
    setSplitAmount,
    mergeAmount,
    setMergeAmount,
    userShares,
    monaBalance,
    monaAllowance,
    splitApproved,
    splitApproveLoading,
  } = useMarket(Number(marketId), dict);

  if (marketLoading)
    return (
      <div className="border-2 border-black p-4 bg-gray-100">
        {dict?.market_loading}
      </div>
    );
  if (!market)
    return (
      <div className="border-2 border-black p-4 bg-gray-100">
        {dict?.market_not_found}
      </div>
    );

  const canRedeemFailed =
    (market.isBlacklisted || market.isExpired || market.isCancelled) &&
    !market.isFinalized &&
    (Number(userShares.yesShares) > 0 || Number(userShares.noShares) > 0);

  return (
    <main className="border-2 border-black p-4 bg-gray-100 min-h-screen">
      <MarketDetails dict={dict} market={market} network={network} />

      {canRedeemFailed && (
        <div className="border-2 border-orange-600 bg-orange-50 p-3 mb-4">
          <h2 className="text-lg font-bold text-orange-800 mb-3">
            {market.isBlacklisted
              ? dict?.market_redeem_title_blacklisted
              : market.isCancelled
              ? dict?.market_redeem_title_cancelled
              : dict?.market_redeem_title_expired}
          </h2>
          <div className="text-sm mb-3 text-orange-700">
            {market.isBlacklisted
              ? dict?.market_redeem_body_blacklisted
              : market.isCancelled
              ? dict?.market_redeem_body_cancelled
              : dict?.market_redeem_body_expired}
          </div>
          <button
            onClick={redeemFailedMarket}
            disabled={redeemFailedLoading}
            className="w-full bg-orange-600 text-white py-2 disabled:opacity-50 text-xs font-bold border-2 border-orange-700"
          >
            {redeemFailedLoading
              ? dict?.market_redeeming
              : dict?.market_redeem_button}
          </button>
        </div>
      )}

      <Proposal
        market={market}
        dict={dict}
        network={network}
        getMarketInfo={getMarketInfo}
        expireMarket={expireMarket}
        expireMarketLoading={expireMarketLoading}
      />
      <Blacklist
        dict={dict}
        market={market}
        network={network}
        getMarketInfo={getMarketInfo}
      />

      <div className="border-2 border-black bg-white p-3 mb-4">
        <h2 className="text-lg font-bold text-black mb-3">
          {dict?.market_split_merge_title}
        </h2>

        <div className="flex md:flex-nowrap flex-wrap flex-row gap-4">
          {Date.now() / 1000 < parseInt(market.endTime) && (
            <div className="flex flex-col w-full">
              <div className="font-bold text-xs mb-1">
                {dict?.market_split_title}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {dict?.market_split_desc}
              </div>
              <input
                type="number"
                placeholder={dict?.market_split_placeholder}
                value={splitAmount}
                onChange={(e) => {
                  const inputValue = Number(e.target.value);
                  const maxMona = Number(monaBalance) / 10 ** 18;
                  if (inputValue <= maxMona || e.target.value === "") {
                    setSplitAmount(e.target.value);
                  }
                }}
                step="0.000001"
                className="w-full p-2 border-2 border-black mb-2 text-xs"
              />
              <div className="text-xs text-gray-600 mb-2">
                Max: {(Number(monaBalance) / 10 ** 18).toFixed(6)} MONA
              </div>
              {!splitApproved && Number(splitAmount) > 0 ? (
                <button
                  onClick={() => approveSplitPosition()}
                  disabled={splitApproveLoading}
                  className="w-full bg-yellow-200 text-black py-1 disabled:opacity-50 text-xs border-2"
                >
                  {splitApproveLoading
                    ? dict?.market_split_approving
                    : dict?.market_split_approve}
                </button>
              ) : (
                <button
                  onClick={() => splitPosition(splitAmount)}
                  disabled={splitLoading || !splitAmount || !splitApproved}
                  className="w-full bg-gray-200 text-black py-1 disabled:opacity-50 text-xs border-2"
                >
                  {splitLoading
                    ? dict?.market_split_action_loading
                    : dict?.market_split_action}
                </button>
              )}
            </div>
          )}

          {(Date.now() / 1000 < parseInt(market.endTime) ||
            market.isFinalized ||
            market.isBlacklisted) && (
            <div className="flex w-full flex-col">
              <div className="font-bold text-xs mb-1">
                {dict?.market_merge_title}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {dict?.market_merge_desc}
              </div>
              <input
                type="number"
                placeholder={dict?.market_merge_placeholder}
                value={mergeAmount}
                onChange={(e) => setMergeAmount(e.target.value)}
                max={
                  Number(
                    userShares.yesShares < userShares.noShares
                      ? userShares.yesShares
                      : userShares.noShares
                  ) /
                  10 ** 18
                }
                step="0.000001"
                className="w-full p-2 border-2 border-black mb-2 text-xs"
              />
              <div className="text-xs text-gray-600 mb-2">
                {dict?.market_merge_max}{" "}
                {(
                  Number(
                    userShares.yesShares < userShares.noShares
                      ? userShares.yesShares
                      : userShares.noShares
                  ) /
                  10 ** 18
                ).toFixed(6)}{" "}
                shares
              </div>
              <button
                onClick={() => mergePositions(mergeAmount)}
                disabled={mergeLoading || !mergeAmount}
                className="w-full bg-gray-200 text-black py-1 disabled:opacity-50 text-xs border-2"
              >
                {mergeLoading
                  ? dict?.market_merge_action_loading
                  : dict?.market_merge_action}
              </button>
            </div>
          )}
        </div>
      </div>

      <Orders
        ordersTab={ordersTab}
        setOrdersTab={setOrdersTab}
        market={market}
        network={network}
        cancelOrder={cancelOrder}
        cancelOrderLoading={cancelOrderLoading}
        fillOrder={fillOrder}
        fillOrderLoading={fillOrderLoading}
        userShares={userShares}
        monaBalance={monaBalance}
        monaAllowance={monaAllowance}
        dict={dict}
      />
      {!market.isFinalized &&
        !market.isBlacklisted &&
        Date.now() / 1000 < parseInt(market.endTime) && (
          <div className="border-2 border-black bg-white p-3 mb-4">
            <h2 className="text-lg font-bold text-black mb-3">
              {dict?.market_place_order_title}
            </h2>

            {orderValues.side === "sell" &&
              Number(orderValues.amount) > 0 &&
              (() => {
                const amountNeeded = BigInt(
                  Math.floor(Number(orderValues.amount) * 10 ** 18)
                );
                const hasEnoughShares =
                  orderValues.outcome === "yes"
                    ? userShares.yesShares >= amountNeeded
                    : userShares.noShares >= amountNeeded;

                if (!hasEnoughShares) {
                  return (
                    <div className="border border-yellow-600 bg-yellow-100 p-2 mb-3">
                      <div className="font-bold text-yellow-800">
                        {dict?.market_insufficient_shares_title}
                      </div>
                      <div className="text-xs text-yellow-700 mb-2">
                        {dict?.market_insufficient_shares_body
                          .replace("{needed}", orderValues.amount)
                          .replace(
                            "{outcome}",
                            orderValues.outcome === "yes"
                              ? dict?.common_yes
                              : dict?.common_no
                          )
                          .replace(
                            "{have}",
                            (
                              Number(
                                orderValues.outcome === "yes"
                                  ? userShares.yesShares
                                  : userShares.noShares
                              ) /
                              10 ** 18
                            ).toString()
                          )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

            {!approved && Number(orderValues.amount) > 0 && (
              <div className="border border-red-600 bg-red-100 p-2 mb-3">
                <div className="font-bold text-red-800">
                  {dict?.market_approval_required_title}
                </div>
                <div className="text-xs text-red-700 mb-2">
                  {dict?.market_approval_required_body}
                </div>
                <button
                  onClick={() => approveMonaSpending()}
                  disabled={approveLoading}
                  className="bg-red-200 text-black px-3 py-1 text-xs border-2 disabled:opacity-50"
                >
                  {approveLoading
                    ? dict?.market_approving
                    : dict?.market_approve_mona}
                </button>
              </div>
            )}

            <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2 mb-3">
              {Number(market.totalVolume) > 0 && (
                <button
                  onClick={() =>
                    setOrderValues({ ...orderValues, orderType: "market" })
                  }
                  className={`px-2 flex w-full relative justify-center items-center text-center py-1 border-2 text-xs ${
                    orderValues.orderType === "market"
                      ? "bg-blue-200"
                      : "bg-gray-200"
                  }`}
                >
                  {dict?.market_tab_market}
                </button>
              )}
              <button
                onClick={() =>
                  setOrderValues({ ...orderValues, orderType: "limit" })
                }
                className={`px-2 flex w-full relative justify-center items-center text-center py-1 border-2 text-xs ${
                  orderValues.orderType === "limit"
                    ? "bg-blue-200"
                    : "bg-gray-200"
                }`}
              >
                {dict?.market_tab_limit}
              </button>
              <button
                onClick={() => setOrderValues({ ...orderValues, side: "buy" })}
                className={`px-2 flex w-full relative justify-center items-center text-center py-1 border-2 text-xs ${
                  orderValues.side === "buy" ? "bg-green-200" : "bg-gray-200"
                }`}
              >
                {dict?.market_tab_buy}
              </button>
              <button
                onClick={() => setOrderValues({ ...orderValues, side: "sell" })}
                className={`px-2 flex w-full relative justify-center items-center text-center py-1 border-2 text-xs ${
                  orderValues.side === "sell" ? "bg-red-200" : "bg-gray-200"
                }`}
              >
                {dict?.market_tab_sell}
              </button>
            </div>

            <div className="relative flex flex-row sm:flex-nowrap flex-wrap gap-2 mb-3">
              <button
                onClick={() =>
                  setOrderValues({ ...orderValues, outcome: "yes" })
                }
                className={`px-2 flex w-full relative items-center justify-center text-center py-1 border-2 text-xs ${
                  orderValues.outcome === "yes" ? "bg-green-200" : "bg-gray-200"
                }`}
              >
                {dict?.market_outcome_yes}
              </button>
              <button
                onClick={() =>
                  setOrderValues({ ...orderValues, outcome: "no" })
                }
                className={`px-2 py-1 flex w-full relative items-center justify-center text-center border-2 text-xs ${
                  orderValues.outcome === "no" ? "bg-red-200" : "bg-gray-200"
                }`}
              >
                {dict?.market_outcome_no}
              </button>
            </div>

            <input
              type="number"
              placeholder={dict?.market_amount_placeholder}
              value={orderValues.amount}
              onChange={(e) => {
                const inputValue = Number(e.target.value);
                let maxAmount = Infinity;

                if (
                  orderValues.side === "buy" &&
                  orderValues.orderType === "limit" &&
                  orderValues.price
                ) {
                  maxAmount =
                    Number(monaBalance) / 10 ** 18 / Number(orderValues.price);
                } else if (orderValues.side === "sell") {
                  const availableShares =
                    orderValues.outcome === "yes"
                      ? Number(userShares.yesShares) / 10 ** 18
                      : Number(userShares.noShares) / 10 ** 18;
                  maxAmount = availableShares;
                }

                if (inputValue <= maxAmount || e.target.value === "") {
                  setOrderValues({ ...orderValues, amount: e.target.value });
                }
              }}
              step="0.000001"
              className="w-full p-2 border-2 border-black mb-2 text-xs"
            />
            <div className="text-xs text-gray-600 mb-2">
              {orderValues.side === "buy" &&
              orderValues.orderType === "limit" &&
              orderValues.price
                ? dict?.market_max_mona
                    .replace(
                      "{amount}",
                      (
                        Number(monaBalance) /
                        10 ** 18 /
                        Number(orderValues.price)
                      ).toFixed(6)
                    )
                    .replace(
                      "{mona}",
                      (Number(monaBalance) / 10 ** 18).toFixed(6)
                    )
                    .replace("{price}", orderValues.price)
                : orderValues.side === "sell"
                ? dict?.market_max_shares
                    .replace(
                      "{amount}",
                      (orderValues.outcome === "yes"
                        ? Number(userShares.yesShares) / 10 ** 18
                        : Number(userShares.noShares) / 10 ** 18
                      ).toFixed(6)
                    )
                    .replace(
                      "{outcome}",
                      orderValues.outcome === "yes"
                        ? dict?.common_yes
                        : dict?.common_no
                    )
                : null}
            </div>

            {orderValues.orderType === "limit" && (
              <div>
                <div className="text-xs text-gray-600 mb-1">
                  {dict?.market_price_label
                    .replace(
                      "{min}",
                      (Number(market.minPrice) / 100).toString()
                    )
                    .replace(
                      "{max}",
                      (Number(market.maxPrice) / 100).toString()
                    )}
                </div>
                <input
                  type="number"
                  placeholder={dict?.market_price_placeholder
                    .replace(
                      "{min}",
                      (Number(market.minPrice) / 10000).toString()
                    )
                    .replace(
                      "{max}",
                      (Number(market.maxPrice) / 10000).toString()
                    )}
                  value={orderValues.price}
                  onChange={(e) =>
                    setOrderValues({ ...orderValues, price: e.target.value })
                  }
                  min={Number(market.minPrice) / 10000}
                  max={Number(market.maxPrice) / 10000}
                  step="0.01"
                  className="w-full p-2 border-2 border-black mb-2 text-xs"
                />
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={
                createOrderLoading ||
                !approved ||
                !orderValues.amount ||
                (orderValues.orderType === "limit" && !orderValues.price)
              }
              className="w-full bg-blue-200 text-black py-2 disabled:opacity-50 text-xs font-bold border-2"
            >
              {createOrderLoading
                ? dict?.orders_processing
                : dict?.orders_place_button.replace(
                    "{type}",
                    orderValues.orderType.charAt(0).toUpperCase() +
                      orderValues.orderType.slice(1)
                  )}
            </button>
          </div>
        )}
    </main>
  );
}
