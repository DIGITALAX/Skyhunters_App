import { useContext, useEffect, useState } from "react";
import { Market } from "../../Common/types/common.types";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { ABIS } from "@/abis";
import { getMarket } from "@/app/lib/subgraph/queries/getMarkets";
import { DUMMY_MARKETS } from "@/app/lib/dummy";
import { AppContext } from "@/app/lib/Providers";
import { getMonaAllowance, getMonaBalance } from "@/app/lib/helpers/mona";

const useMarket = (marketId: number | undefined) => {
  const [marketLoading, setMarketLoading] = useState<boolean>(false);
  const [market, setMarket] = useState<Market>();
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [approved, setApproved] = useState<boolean>(false);
  const [ordersTab, setOrdersTab] = useState<"all" | "my">("all");
  const [splitAmount, setSplitAmount] = useState<string>("");
  const [mergeAmount, setMergeAmount] = useState<string>("");
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const context = useContext(AppContext);
  const [orderValues, setOrderValues] = useState<{
    price: string;
    amount: string;
    outcome: "yes" | "no";
    side: "buy" | "sell";
    orderType: "market" | "limit";
  }>({
    price: "",
    amount: "",
    outcome: "yes",
    side: "buy",
    orderType: "market",
  });

  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);

  const handlePlaceOrder = async () => {
    if (!orderValues.amount || !market) return;

    const orderTypeNum = orderValues.side === "buy" ? 0 : 1;
    const answerNum = orderValues.outcome === "yes" ? 1 : 0;

    if (orderValues.orderType === "market") {
      await executeMarketOrder(
        orderTypeNum,
        answerNum,
        BigInt(Number(orderValues.amount) * 10 ** 18)
      );
    } else {
      if (!orderValues.price) return;
      await placeLimitOrder(
        orderTypeNum,
        answerNum,
        BigInt(orderValues.price),
        BigInt(Number(orderValues.amount) * 10 ** 18)
      );
    }

    setOrderValues({
      price: "",
      amount: "",
      outcome: "yes",
      side: "buy",
      orderType: "market",
    });
  };

  const getMarketInfo = async () => {
    if (!marketId) return;
    setMarketLoading(true);
    try {
      setMarket(DUMMY_MARKETS[0]);
      // const data = await getMarket(marketId);
      // setMarket(data?.data?.markets?.[0]);
    } catch (err: any) {
      console.error(err.message);
    }
    setMarketLoading(false);
  };

  const approveMonaSpending = async () => {
    if (!walletClient || !address || !publicClient)
      throw new Error("Wallet not connected");

    const amount = BigInt(Number(orderValues.amount) * 10 ** 18);

    const approveHash = await walletClient.writeContract({
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
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    setApproved(true);
  };

  const executeMarketOrder = async (
    orderType: number,
    answer: number,
    amount: bigint
  ) => {
    if (!walletClient || !publicClient || !address || !approved || !market)
      return;
    setOrderLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "marketOrder",
        args: [BigInt(market.marketId), orderType, answer, amount],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess("Market order executed successfully", hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    setOrderLoading(false);
  };

  const placeLimitOrder = async (
    orderType: number,
    answer: number,
    price: bigint,
    amount: bigint
  ) => {
    if (!walletClient || !publicClient || !address || !market || !approved)
      return;
    setOrderLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "placeLimitOrder",
        args: [BigInt(market.marketId), price, amount, orderType, answer],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess("Limit order placed successfully", hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    setOrderLoading(false);
  };

  const cancelOrder = async (orderId: string) => {
    if (!walletClient || !publicClient || !address || !market) return;
    setOrderLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "cancelOrder",
        args: [BigInt(market.marketId), BigInt(orderId)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess("Order cancelled successfully", hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    await getMarketInfo();
    setOrderLoading(false);
  };

  const splitPosition = async (amount: string) => {
    if (!walletClient || !publicClient || !address || !market) return;
    setOrderLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "splitPosition",
        args: [BigInt(market.marketId), BigInt(Number(amount) * 10 ** 18)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess("Position split successfully", hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    setSplitAmount("");
    await getMarketInfo();
    setOrderLoading(false);
  };

  const mergePositions = async (amount: string) => {
    if (!walletClient || !publicClient || !address || !market) return;
    setOrderLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "mergePositions",
        args: [BigInt(market.marketId), BigInt(Number(amount) * 10 ** 18)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess("Positions merged successfully", hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    setMergeAmount("");
    await getMarketInfo();
    setOrderLoading(false);
  };

  useEffect(() => {
    if (!marketLoading && !market && marketId) {
      getMarketInfo();
    }
  }, [marketId]);

  const checkApproved = async () => {
    if (!address || !publicClient) return;
    const monaBalance = await getMonaBalance(address, publicClient, contracts);
    const allowance = await getMonaAllowance(
      address,
      contracts.market,
      publicClient,
      contracts
    );

    if (allowance < monaBalance) {
      setApproved(false);
    } else {
      setApproved(true);
    }
  };

  useEffect(() => {
    if (address && Number(orderValues.amount) > 0 && publicClient) {
      checkApproved();
    }
  }, [address, orderValues.amount, publicClient]);

  return {
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
  };
};

export default useMarket;
