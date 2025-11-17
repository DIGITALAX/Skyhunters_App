import { FunctionComponent, JSX, useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { OrderProps } from "../types/market.types";
import InfiniteScroll from "react-infinite-scroll-component";
import { getBuyOrders, getSellOrders } from "@/app/lib/subgraph/queries/getMarkets";
import { getCoreContractAddresses, getCurrentNetwork } from "@/app/lib/constants";

const Orders: FunctionComponent<OrderProps & { dict: any }> = ({
  ordersTab,
  setOrdersTab,
  market,
  network,
  cancelOrder,
  cancelOrderLoading,
  fillOrder,
  fillOrderLoading,
  userShares,
  monaBalance,
  monaAllowance,
  dict,
}): JSX.Element => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const PAGE_SIZE = 20;
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [approvedOrders, setApprovedOrders] = useState<Record<string, boolean>>({});
  const currentNetwork = getCurrentNetwork();
  const contracts = getCoreContractAddresses(currentNetwork.chainId);

  const approveMona = async (orderId: string, amount: bigint) => {
    if (!walletClient || !address || !publicClient) return;
    setApproveLoading(orderId);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.mona,
        abi: [
          {
            type: "function",
            name: "approve",
            inputs: [
              { name: "spender", type: "address", internalType: "address" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
            outputs: [{ name: "", type: "bool", internalType: "bool" }],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "approve",
        args: [contracts.market, amount],
        account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setApprovedOrders({ ...approvedOrders, [orderId]: true });
    } catch (err: any) {
      console.error(err.message);
    }
    setApproveLoading(null);
  };

  const canFillOrder = (order: any, amountStr: string): { canFill: boolean; needsApproval: boolean; costInMona?: bigint; reason?: string } => {
    if (!amountStr || Number(amountStr) === 0) {
      return { canFill: false, needsApproval: false };
    }

    const amount = BigInt(Math.floor(Number(amountStr) * 10 ** 18));
    const priceDecimal = Number(order.price) / 10000;
    const amountDecimal = Number(amountStr);

    if (order.orderType === "1") {
      const costInMona = BigInt(Math.floor(amountDecimal * priceDecimal * 10 ** 18));

      if (monaBalance < costInMona) {
        return {
          canFill: false,
          needsApproval: false,
          costInMona,
          reason: dict?.orders_fill_reason_need_mona
            .replace("{needed}", formatEther(costInMona))
            .replace("{have}", formatEther(monaBalance)),
        };
      }

      if (approvedOrders[order.orderId]) {
        return { canFill: true, needsApproval: false, costInMona };
      }

      if (monaAllowance < costInMona) {
        return {
          canFill: false,
          needsApproval: true,
          costInMona
        };
      }

      return { canFill: true, needsApproval: false, costInMona };
    } else {
      const answer = Number(order.answer);
      const availableShares = answer === 1 ? userShares.yesShares : userShares.noShares;

      if (availableShares < amount) {
        return {
          canFill: false,
          needsApproval: false,
          reason: dict?.orders_fill_reason_need_shares
            .replace("{needed}", formatEther(amount))
            .replace(
              "{outcome}",
              answer === 1 ? dict?.common_yes : dict?.common_no
            )
            .replace("{have}", formatEther(availableShares)),
        };
      }

      return { canFill: true, needsApproval: false };
    }
  };

  const [buyOrders, setBuyOrders] = useState<any[]>([]);
  const [sellOrders, setSellOrders] = useState<any[]>([]);
  const [buyOrdersPage, setBuyOrdersPage] = useState<number>(0);
  const [sellOrdersPage, setSellOrdersPage] = useState<number>(0);
  const [hasMoreBuyOrders, setHasMoreBuyOrders] = useState<boolean>(true);
  const [hasMoreSellOrders, setHasMoreSellOrders] = useState<boolean>(true);
  const [loadingBuyOrders, setLoadingBuyOrders] = useState<boolean>(false);
  const [loadingSellOrders, setLoadingSellOrders] = useState<boolean>(false);
  const [fillAmount, setFillAmount] = useState<Record<string, string>>({});

  const loadBuyOrders = async () => {
    if (loadingBuyOrders || !hasMoreBuyOrders || !market?.marketId) return;
    setLoadingBuyOrders(true);
    const result = await getBuyOrders(Number(market.marketId), PAGE_SIZE, buyOrdersPage * PAGE_SIZE);
    const newOrders = result?.data?.orders || [];
    if (newOrders.length < PAGE_SIZE) setHasMoreBuyOrders(false);
    setBuyOrders([...buyOrders, ...newOrders]);
    setBuyOrdersPage(buyOrdersPage + 1);
    setLoadingBuyOrders(false);
  };

  const loadSellOrders = async () => {
    if (loadingSellOrders || !hasMoreSellOrders || !market?.marketId) return;
    setLoadingSellOrders(true);
    const result = await getSellOrders(Number(market.marketId), PAGE_SIZE, sellOrdersPage * PAGE_SIZE);
    const newOrders = result?.data?.orders || [];
    if (newOrders.length < PAGE_SIZE) setHasMoreSellOrders(false);
    setSellOrders([...sellOrders, ...newOrders]);
    setSellOrdersPage(sellOrdersPage + 1);
    setLoadingSellOrders(false);
  };

  useEffect(() => {
    if (market?.marketId) {
      setBuyOrders([]);
      setSellOrders([]);
      setBuyOrdersPage(0);
      setSellOrdersPage(0);
      setHasMoreBuyOrders(true);
      setHasMoreSellOrders(true);
      loadBuyOrders();
      loadSellOrders();
    }
  }, [market?.marketId]);

  const filterMyOrders = (orders: any[]) => {
    if (!address) return [];
    return orders.filter(
      (order) =>
        order.maker.toLowerCase() === address.toLowerCase() ||
        (order.filler && order.filler.toLowerCase() === address.toLowerCase())
    );
  };

  const displayBuyOrders = ordersTab === "all" ? buyOrders : filterMyOrders(buyOrders);
  const displaySellOrders = ordersTab === "all" ? sellOrders : filterMyOrders(sellOrders);

  return (
    <div className="border-2 border-black bg-white p-3 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-black">{dict?.orders_title}</h2>
        <div className="flex">
          <button
            onClick={() => setOrdersTab("all")}
            className={`px-3 py-1 border-2 text-xs mr-1 ${
              ordersTab === "all" ? "bg-blue-200" : "bg-gray-200"
            }`}

          >
            {dict?.orders_tab_all}
          </button>
          <button
            onClick={() => setOrdersTab("my")}
            className={`px-3 py-1 border-2 text-xs ${
              ordersTab === "my" ? "bg-blue-200" : "bg-gray-200"
            }`}

          >
            {dict?.orders_tab_my}
          </button>
        </div>
      </div>

      <div className="flex flex-row md:flex-nowrap flex-wrap gap-4">
        <div className="border-2 w-full flex-col flex border-black bg-white p-3">
          <h2 className="text-lg font-bold text-black mb-3">
            {dict?.orders_buy_title.replace(
              "{count}",
              String(displayBuyOrders?.length || 0)
            )}
          </h2>
          <div className="max-h-64 overflow-y-auto" id="buyOrdersScroll">
            <InfiniteScroll
              dataLength={displayBuyOrders.length}
              next={loadBuyOrders}
              hasMore={hasMoreBuyOrders}
              loader={
                <div className="text-center text-xs p-2">
                  {dict?.orders_loading_more_buy}
                </div>
              }
              scrollableTarget="buyOrdersScroll"
            >
              {displayBuyOrders && displayBuyOrders.length > 0 ? (
                displayBuyOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="border border-black p-2 mb-2"
                >
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="font-bold">{dict?.orders_order_id}</td>
                        <td>{order.orderId}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_outcome}</td>
                        <td>{order.answer === "1" ? dict?.common_yes : dict?.common_no}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_price}</td>
                        <td>
                          {Number(order.price)} / {Number(market.precision)} ={" "}
                          {(
                            Number(order.price) / Number(market.precision)
                          ).toFixed(4)}{" "}
                          MONA
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_amount}</td>
                        <td>{formatEther(BigInt(order.amount) ?? 0)} {dict?.common_shares}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_filled}</td>
                        <td>
                          {formatEther(BigInt(order.amountFilled || "0"))}{" "}
                          {dict?.common_shares}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_status}</td>
                        <td>
                          {order.cancelled
                            ? dict?.orders_status_cancelled
                            : order.filled
                            ? dict?.orders_status_filled
                            : dict?.orders_status_active}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_maker}</td>
                        <td className="break-all">{order.maker}</td>
                      </tr>
                      {order.filler !==
                        "0x0000000000000000000000000000000000000000" && (
                        <tr>
                          <td className="font-bold">{dict?.orders_filler}</td>
                          <td className="break-all">{order.filler}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="font-bold">{dict?.orders_tx}</td>
                        <td>
                          <a
                            href={`${network.blockExplorer}/tx/${order.transactionHash}`}
                            target="_blank"
                            className="text-blue-600 break-all underline"
                          >
                            {order.transactionHash.slice(0, 10)}...
                          </a>
                        </td>
                      </tr>
                      <tr>
                          <td className="font-bold">{dict?.orders_time}</td>
                          <td>
                          {new Date(
                            parseInt(order.blockTimestamp) * 1000
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {order.maker.toLowerCase() === address?.toLowerCase() &&
                    !order.cancelled &&
                    !order.filled &&
                    !market.isCancelled &&
                    !market.isExpired &&
                    !market.isBlacklisted &&
                    !market.isFinalized && (
                      <button
                        onClick={() => cancelOrder(order.orderId)}
                        disabled={cancelOrderLoading === order.orderId}
                        className="w-full bg-red-200 text-black py-1 mt-2 disabled:opacity-50 text-xs border-2"

                      >
                        {cancelOrderLoading === order.orderId
                          ? dict?.orders_cancelling
                          : dict?.orders_cancel}
                      </button>
                    )}

                  {order.maker.toLowerCase() !== address?.toLowerCase() &&
                    !order.cancelled &&
                    !order.filled &&
                    !market.isCancelled &&
                    !market.isExpired &&
                    !market.isBlacklisted &&
                    !market.isFinalized && (() => {
                      const fillCheck = canFillOrder(order, fillAmount[order.orderId] || "");
                      const availableInOrder = Number(formatEther(BigInt(order.amount) - BigInt(order.amountFilled || "0")));

                      let maxFillAmount = availableInOrder;
                      let maxReason = "";

                      if (order.orderType === "1") {
                        const priceDecimal = Number(order.price) / 10000;
                        const maxFromMona = Number(formatEther(monaBalance)) / priceDecimal;
                        if (maxFromMona < availableInOrder) {
                          maxFillAmount = maxFromMona;
                          maxReason = ` (${dict?.orders_fill_reason_need_mona
                            .replace("{needed}", formatEther(monaBalance))
                            .replace("{have}", formatEther(monaBalance))})`;
                        }
                      } else {
                        const answer = Number(order.answer);
                        const availableShares = answer === 1 ? userShares.yesShares : userShares.noShares;
                        const maxFromShares = Number(formatEther(availableShares));
                        if (maxFromShares < availableInOrder) {
                          maxFillAmount = maxFromShares;
                          maxReason = ` (${dict?.orders_fill_reason_need_shares
                            .replace("{needed}", maxFromShares.toFixed(6))
                            .replace(
                              "{outcome}",
                              answer === 1 ? dict?.common_yes : dict?.common_no
                            )
                            .replace("{have}", maxFromShares.toFixed(6))})`;
                        }
                      }

                      return (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">
                            {dict?.orders_available} {availableInOrder.toFixed(6)} {dict?.common_shares}
                          </div>
                          <input
                            type="number"
                            placeholder={dict?.orders_fill_placeholder}
                            value={fillAmount[order.orderId] || ""}
                            onChange={(e) => {
                              const inputValue = Number(e.target.value);
                              if (inputValue <= maxFillAmount || e.target.value === "") {
                                setFillAmount({ ...fillAmount, [order.orderId]: e.target.value });
                              }
                            }}
                            step="0.000001"
                            className="w-full p-1 border-2 border-black mb-1 text-xs"
                          />
                          <div className="text-xs text-gray-600 mb-1">
                            {dict?.orders_fill_max
                              .replace("{amount}", maxFillAmount.toFixed(6))
                              .replace("{reason}", maxReason)}
                          </div>
                          {!fillCheck.canFill && fillCheck.reason && (
                            <div className="text-xs text-red-600 mb-1">{fillCheck.reason}</div>
                          )}
                          {fillCheck.needsApproval ? (
                            <button
                              onClick={() => approveMona(order.orderId, fillCheck.costInMona!)}
                              disabled={approveLoading === order.orderId}
                              className="w-full bg-yellow-200 text-black py-1 disabled:opacity-50 text-xs border-2"
                            >
                              {approveLoading === order.orderId
                                ? dict?.orders_approving
                                : dict?.orders_approve_mona}
                            </button>
                          ) : (
                            <button
                              onClick={() => fillOrder(order, fillAmount[order.orderId] || "0", (orderId) => {
                                const newFillAmount = { ...fillAmount };
                                delete newFillAmount[orderId];
                                setFillAmount(newFillAmount);
                              })}
                              disabled={
                                fillOrderLoading === order.orderId ||
                                !fillCheck.canFill
                              }
                              className="w-full bg-green-200 text-black py-1 disabled:opacity-50 text-xs border-2"
                            >
                              {fillOrderLoading === order.orderId
                                ? dict?.orders_fill_loading
                                : dict?.orders_fill_button}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                {dict?.orders_empty_buy}
              </div>
            )}
            </InfiniteScroll>
          </div>
        </div>
        <div className="border-2 flex-col flex w-full border-black bg-white p-3">
          <h2 className="text-lg font-bold text-black mb-3">
            {dict?.orders_sell_title.replace(
              "{count}",
              String(displaySellOrders?.length || 0)
            )}
          </h2>
          <div className="max-h-64 overflow-y-auto" id="sellOrdersScroll">
            <InfiniteScroll
              dataLength={displaySellOrders.length}
              next={loadSellOrders}
              hasMore={hasMoreSellOrders}
              loader={
                <div className="text-center text-xs p-2">
                  {dict?.orders_loading_more_sell}
                </div>
              }
              scrollableTarget="sellOrdersScroll"
            >
              {displaySellOrders && displaySellOrders.length > 0 ? (
                displaySellOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="border border-black p-2 mb-2"
                >
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="font-bold">{dict?.orders_order_id}</td>
                        <td>{order.orderId}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_outcome}</td>
                        <td>{order.answer === "1" ? dict?.common_yes : dict?.common_no}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_price}</td>
                        <td>
                          {Number(order.price)} / {Number(market.precision)} ={" "}
                          {(
                            Number(order.price) / Number(market.precision)
                          ).toFixed(4)}{" "}
                          MONA
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_amount}</td>
                        <td>{formatEther(BigInt(order.amount ?? 0))} {dict?.common_shares}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_filled}</td>
                        <td>
                          {formatEther(BigInt(order.amountFilled || "0"))}{" "}
                          {dict?.common_shares}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_status}</td>
                        <td>
                          {order.cancelled
                            ? dict?.orders_status_cancelled
                            : order.filled
                            ? dict?.orders_status_filled
                            : dict?.orders_status_active}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_maker}</td>
                        <td className="break-all">{order.maker}</td>
                      </tr>
                      {order.filler !==
                        "0x0000000000000000000000000000000000000000" && (
                        <tr>
                          <td className="font-bold">{dict?.orders_filler}</td>
                          <td className="break-all">{order.filler}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="font-bold">{dict?.orders_tx}</td>
                        <td>
                          <a
                            href={`${network.blockExplorer}/tx/${order.transactionHash}`}
                            target="_blank"
                            className="text-blue-600 break-all underline"
                          >
                            {order.transactionHash.slice(0, 10)}...
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">{dict?.orders_time}</td>
                        <td>
                          {new Date(
                            parseInt(order.blockTimestamp) * 1000
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {order.maker.toLowerCase() === address?.toLowerCase() &&
                    !order.cancelled &&
                    !order.filled &&
                    !market.isCancelled &&
                    !market.isExpired &&
                    !market.isBlacklisted &&
                    !market.isFinalized && (
                      <button
                        onClick={() => cancelOrder(order.orderId)}
                        disabled={cancelOrderLoading === order.orderId}
                        className="w-full bg-red-200 text-black py-1 mt-2 disabled:opacity-50 text-xs border-2"

                      >
                        {cancelOrderLoading === order.orderId
                          ? dict?.orders_cancelling
                          : dict?.orders_cancel}
                      </button>
                    )}

                  {order.maker.toLowerCase() !== address?.toLowerCase() &&
                    !order.cancelled &&
                    !order.filled &&
                    !market.isCancelled &&
                    !market.isExpired &&
                    !market.isBlacklisted &&
                    !market.isFinalized && (() => {
                      const fillCheck = canFillOrder(order, fillAmount[order.orderId] || "");
                      const availableInOrder = Number(formatEther(BigInt(order.amount) - BigInt(order.amountFilled || "0")));

                      let maxFillAmount = availableInOrder;
                      let maxReason = "";

                      if (order.orderType === "1") {
                        const priceDecimal = Number(order.price) / 10000;
                        const maxFromMona = Number(formatEther(monaBalance)) / priceDecimal;
                        if (maxFromMona < availableInOrder) {
                          maxFillAmount = maxFromMona;
                          maxReason = ` (${dict?.orders_fill_reason_need_mona
                            .replace("{needed}", formatEther(monaBalance))
                            .replace("{have}", formatEther(monaBalance))})`;
                        }
                      } else {
                        const answer = Number(order.answer);
                        const availableShares = answer === 1 ? userShares.yesShares : userShares.noShares;
                        const maxFromShares = Number(formatEther(availableShares));
                        if (maxFromShares < availableInOrder) {
                          maxFillAmount = maxFromShares;
                          maxReason = ` (${dict?.orders_fill_reason_need_shares
                            .replace("{needed}", maxFromShares.toFixed(6))
                            .replace(
                              "{outcome}",
                              answer === 1 ? dict?.common_yes : dict?.common_no
                            )
                            .replace("{have}", maxFromShares.toFixed(6))})`;
                        }
                      }

                      return (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">
                            {dict?.orders_available} {availableInOrder.toFixed(6)} {dict?.common_shares}
                          </div>
                          <input
                            type="number"
                            placeholder={dict?.orders_fill_placeholder}
                            value={fillAmount[order.orderId] || ""}
                            onChange={(e) => {
                              const inputValue = Number(e.target.value);
                              if (inputValue <= maxFillAmount || e.target.value === "") {
                                setFillAmount({ ...fillAmount, [order.orderId]: e.target.value });
                              }
                            }}
                            step="0.000001"
                            className="w-full p-1 border-2 border-black mb-1 text-xs"
                          />
                          <div className="text-xs text-gray-600 mb-1">
                            {dict?.orders_fill_max
                              .replace("{amount}", maxFillAmount.toFixed(6))
                              .replace("{reason}", maxReason)}
                          </div>
                          {!fillCheck.canFill && fillCheck.reason && (
                            <div className="text-xs text-red-600 mb-1">{fillCheck.reason}</div>
                          )}
                          {fillCheck.needsApproval ? (
                            <button
                              onClick={() => approveMona(order.orderId, fillCheck.costInMona!)}
                              disabled={approveLoading === order.orderId}
                              className="w-full bg-yellow-200 text-black py-1 disabled:opacity-50 text-xs border-2"
                            >
                              {approveLoading === order.orderId
                                ? dict?.orders_approving
                                : dict?.orders_approve_mona}
                            </button>
                          ) : (
                            <button
                              onClick={() => fillOrder(order, fillAmount[order.orderId] || "0", (orderId) => {
                                const newFillAmount = { ...fillAmount };
                                delete newFillAmount[orderId];
                                setFillAmount(newFillAmount);
                              })}
                              disabled={
                                fillOrderLoading === order.orderId ||
                                !fillCheck.canFill
                              }
                              className="w-full bg-green-200 text-black py-1 disabled:opacity-50 text-xs border-2"
                            >
                              {fillOrderLoading === order.orderId
                                ? dict?.orders_fill_loading
                                : dict?.orders_fill_button}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                {dict?.orders_empty_sell}
              </div>
            )}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
