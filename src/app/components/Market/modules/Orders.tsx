import { FunctionComponent, JSX } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { OrderProps } from "../types/market.types";

const Orders: FunctionComponent<OrderProps> = ({
  ordersTab,
  setOrdersTab,
  market,
  network,
  cancelOrder,
  orderLoading,
}): JSX.Element => {
  const { address } = useAccount();

  const filterMyOrders = (orders: any[]) => {
    if (!address) return [];
    return orders.filter(
      (order) =>
        order.maker.toLowerCase() === address.toLowerCase() ||
        (order.filler && order.filler.toLowerCase() === address.toLowerCase())
    );
  };

  const displayBuyOrders =
    ordersTab === "all"
      ? market?.buyOrders || []
      : filterMyOrders(market?.buyOrders || []);
  const displaySellOrders =
    ordersTab === "all"
      ? market?.sellOrders || []
      : filterMyOrders(market?.sellOrders || []);

  return (
    <div className="border-2 border-black bg-white p-3 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-black">ORDERS</h2>
        <div className="flex">
          <button
            onClick={() => setOrdersTab("all")}
            className={`px-3 py-1 border-2 text-xs mr-1 ${
              ordersTab === "all" ? "bg-blue-200" : "bg-gray-200"
            }`}
           
          >
            All Orders
          </button>
          <button
            onClick={() => setOrdersTab("my")}
            className={`px-3 py-1 border-2 text-xs ${
              ordersTab === "my" ? "bg-blue-200" : "bg-gray-200"
            }`}
           
          >
            My Orders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-black bg-white p-3">
          <h2 className="text-lg font-bold text-black mb-3">
            BUY ORDERS ({displayBuyOrders?.length || 0})
          </h2>
          <div className="max-h-64 overflow-y-auto">
            {displayBuyOrders && displayBuyOrders.length > 0 ? (
              displayBuyOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="border border-black p-2 mb-2"
                >
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="font-bold">ORDER ID:</td>
                        <td>{order.orderId}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">OUTCOME:</td>
                        <td>{order.answer === "1" ? "YES" : "NO"}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">PRICE:</td>
                        <td>
                          {Number(order.price)} / {Number(market.precision)} ={" "}
                          {(
                            Number(order.price) / Number(market.precision)
                          ).toFixed(4)}{" "}
                          MONA
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">AMOUNT:</td>
                        <td>{formatEther(BigInt(order.amount))} shares</td>
                      </tr>
                      <tr>
                        <td className="font-bold">FILLED:</td>
                        <td>
                          {formatEther(BigInt(order.amountFilled || "0"))}{" "}
                          shares
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">STATUS:</td>
                        <td>
                          {order.cancelled
                            ? "CANCELLED"
                            : order.filled
                            ? "FILLED"
                            : "ACTIVE"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">MAKER:</td>
                        <td className="break-all">{order.maker}</td>
                      </tr>
                      {order.filler !==
                        "0x0000000000000000000000000000000000000000" && (
                        <tr>
                          <td className="font-bold">FILLER:</td>
                          <td className="break-all">{order.filler}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="font-bold">TX:</td>
                        <td>
                          <a
                            href={`${network.blockExplorer}/tx/${order.transactionHash}`}
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            {order.transactionHash.slice(0, 10)}...
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">TIME:</td>
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
                    !order.filled && (
                      <button
                        onClick={() => cancelOrder(order.orderId)}
                        disabled={orderLoading}
                        className="w-full bg-red-200 text-black py-1 mt-2 disabled:opacity-50 text-xs border-2"
                       
                      >
                        {orderLoading ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No buy orders</div>
            )}
          </div>
        </div>
        <div className="border-2 border-black bg-white p-3">
          <h2 className="text-lg font-bold text-black mb-3">
            SELL ORDERS ({displaySellOrders?.length || 0})
          </h2>
          <div className="max-h-64 overflow-y-auto">
            {displaySellOrders && displaySellOrders.length > 0 ? (
              displaySellOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="border border-black p-2 mb-2"
                >
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="font-bold">ORDER ID:</td>
                        <td>{order.orderId}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">OUTCOME:</td>
                        <td>{order.answer === "1" ? "YES" : "NO"}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">PRICE:</td>
                        <td>
                          {Number(order.price)} / {Number(market.precision)} ={" "}
                          {(
                            Number(order.price) / Number(market.precision)
                          ).toFixed(4)}{" "}
                          MONA
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">AMOUNT:</td>
                        <td>{formatEther(BigInt(order.amount))} shares</td>
                      </tr>
                      <tr>
                        <td className="font-bold">FILLED:</td>
                        <td>
                          {formatEther(BigInt(order.amountFilled || "0"))}{" "}
                          shares
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">STATUS:</td>
                        <td>
                          {order.cancelled
                            ? "CANCELLED"
                            : order.filled
                            ? "FILLED"
                            : "ACTIVE"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">MAKER:</td>
                        <td className="break-all">{order.maker}</td>
                      </tr>
                      {order.filler !==
                        "0x0000000000000000000000000000000000000000" && (
                        <tr>
                          <td className="font-bold">FILLER:</td>
                          <td className="break-all">{order.filler}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="font-bold">TX:</td>
                        <td>
                          <a
                            href={`${network.blockExplorer}/tx/${order.transactionHash}`}
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            {order.transactionHash.slice(0, 10)}...
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">TIME:</td>
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
                    !order.filled && (
                      <button
                        onClick={() => cancelOrder(order.orderId)}
                        disabled={orderLoading}
                        className="w-full bg-red-200 text-black py-1 mt-2 disabled:opacity-50 text-xs border-2"
                       
                      >
                        {orderLoading ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No sell orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
