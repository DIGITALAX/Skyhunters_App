import { useContext, useEffect, useState } from "react";
import { Market } from "../../Common/types/common.types";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { ABIS } from "@/abis";
import { getMarket } from "@/app/lib/subgraph/queries/getMarkets";
import { AppContext } from "@/app/lib/Providers";
import { getMonaAllowance, getMonaBalance } from "@/app/lib/helpers/mona";
import { ensureMetadata } from "@/app/lib/utils";
import { formatEther } from "viem";

const useMarket = (marketId: number | undefined, dict: any) => {
  const [marketLoading, setMarketLoading] = useState<boolean>(false);
  const [market, setMarket] = useState<Market>();
  const [createOrderLoading, setCreateOrderLoading] = useState<boolean>(false);
  const [cancelOrderLoading, setCancelOrderLoading] = useState<string | null>(
    null
  );
  const [fillOrderLoading, setFillOrderLoading] = useState<string | null>(null);
  const [approveLoading, setApproveLoading] = useState<boolean>(false);
  const [approved, setApproved] = useState<boolean>(false);
  const [splitApproveLoading, setSplitApproveLoading] =
    useState<boolean>(false);
  const [splitApproved, setSplitApproved] = useState<boolean>(false);
  const [splitLoading, setSplitLoading] = useState<boolean>(false);
  const [mergeLoading, setMergeLoading] = useState<boolean>(false);
  const [expireMarketLoading, setExpireMarketLoading] =
    useState<boolean>(false);
  const [redeemFailedLoading, setRedeemFailedLoading] = useState<boolean>(false);
  const [ordersTab, setOrdersTab] = useState<"all" | "my">("all");
  const [splitAmount, setSplitAmount] = useState<string>("");
  const [mergeAmount, setMergeAmount] = useState<string>("");
  const [userShares, setUserShares] = useState<{
    yesShares: bigint;
    noShares: bigint;
  }>({
    yesShares: BigInt(0),
    noShares: BigInt(0),
  });
  const [monaBalance, setMonaBalance] = useState<bigint>(BigInt(0));
  const [monaAllowance, setMonaAllowance] = useState<bigint>(BigInt(0));
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
    orderType: "limit",
  });

  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);

  const parseAmountToBigInt = (amountStr: string): bigint => {
    const num = Number(amountStr);
    const scaled = num * 10 ** 18;
    return BigInt(scaled);
  };

  const handlePlaceOrder = async () => {
    if (!orderValues.amount || !market) return;

    const orderTypeNum = orderValues.side === "buy" ? 0 : 1;
    const answerNum = orderValues.outcome === "yes" ? 1 : 0;
    const amount = parseAmountToBigInt(orderValues.amount);

    if (orderValues.orderType === "market") {
      await executeMarketOrder(orderTypeNum, answerNum, amount);
    } else {
      if (!orderValues.price) return;

      const priceDecimal = Number(orderValues.price);
      const minPriceDecimal = Number(market.minPrice) / 10000;
      const maxPriceDecimal = Number(market.maxPrice) / 10000;

      if (priceDecimal < minPriceDecimal || priceDecimal > maxPriceDecimal) {
        context?.showError(
          dict?.market_price_between
            .replace("{min}", minPriceDecimal.toString())
            .replace("{minPct}", (minPriceDecimal * 100).toString())
            .replace("{max}", maxPriceDecimal.toString())
            .replace("{maxPct}", (maxPriceDecimal * 100).toString())
        );
        return;
      }

      const priceBasisPoints = Math.floor(priceDecimal * 10000);

      await placeLimitOrder(
        orderTypeNum,
        answerNum,
        BigInt(priceBasisPoints),
        amount
      );
    }

    setOrderValues({
      price: "",
      amount: "",
      outcome: "yes",
      side: "buy",
      orderType: "limit",
    });
  };

  const getMarketInfo = async () => {
    if (!marketId) return;
    setMarketLoading(true);
    try {
      const data = await getMarket(marketId);
      let market = {
        ...data?.data?.markets?.[0],
        blacklist: await ensureMetadata(data?.data?.markets?.[0]?.blacklist),
      };
      setMarket(await ensureMetadata(market));
    } catch (err: any) {
      console.error(err.message);
    }
    setMarketLoading(false);
  };

  const approveMonaSpending = async () => {
    if (!walletClient || !address || !publicClient)
      throw new Error("Wallet not connected");

    setApproveLoading(true);
    try {
      const amount = parseAmountToBigInt(orderValues.amount);

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
      context?.showSuccess(dict?.market_spend_approve_success, approveHash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `${dict?.market_spend_approve_failed} ${err.message}`
      );
    }
    setApproveLoading(false);
  };

  const approveSplitPosition = async () => {
    if (!walletClient || !address || !publicClient)
      throw new Error("Wallet not connected");

    setSplitApproveLoading(true);
    try {
      const amount = parseAmountToBigInt(splitAmount);

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
      setSplitApproved(true);
      context?.showSuccess(dict?.market_split_approve_success, approveHash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `${dict?.market_split_approve_failed} ${err.message}`
      );
    }
    setSplitApproveLoading(false);
  };

  const executeMarketOrder = async (
    orderType: number,
    answer: number,
    amount: bigint
  ) => {
    if (!walletClient || !publicClient || !address || !approved || !market)
      return;
    setCreateOrderLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "marketOrder",
        args: [BigInt(market.marketId), amount, orderType, answer],
        account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.market_order_success, hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    setCreateOrderLoading(false);
  };

  const placeLimitOrder = async (
    orderType: number,
    answer: number,
    price: bigint,
    amount: bigint
  ) => {
    if (!walletClient || !publicClient || !address || !market || !approved)
      return;
    setCreateOrderLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "placeLimitOrder",
        args: [BigInt(market.marketId), price, amount, orderType, answer],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.market_limit_success, hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    setCreateOrderLoading(false);
  };

  const cancelOrder = async (orderId: string) => {
    if (!walletClient || !publicClient || !address || !market) return;
    setCancelOrderLoading(orderId);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "cancelOrder",
        args: [BigInt(orderId)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.market_cancel_success, hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    await getMarketInfo();
    setCancelOrderLoading(null);
  };

  const fillOrder = async (
    order: any,
    amountStr: string,
    clearFillAmount: (orderId: string) => void
  ) => {
    if (!walletClient || !publicClient || !address || !market) return;
    setFillOrderLoading(order.orderId);
    try {
      const amount = parseAmountToBigInt(amountStr);
      const orderType = order.orderType === "0" ? 1 : 0;
      const answer = Number(order.answer);

      const priceDecimal = Number(order.price) / 10000;
      const amountDecimal = Number(formatEther(amount));

      if (order.orderType === "1") {
        const monaBalance = await getMonaBalance(
          address,
          publicClient,
          contracts
        );
        const costInMona = parseAmountToBigInt(
          (amountDecimal * priceDecimal).toString()
        );

        if (monaBalance < costInMona) {
          context?.showError(
            dict?.orders_fill_reason_insufficient_balance
              .replace("{needed}", formatEther(costInMona))
              .replace("{have}", formatEther(monaBalance))
          );
          setFillOrderLoading(null);
          return;
        }

        const allowance = await getMonaAllowance(
          address,
          contracts.market,
          publicClient,
          contracts
        );
        if (allowance < costInMona) {
          context?.showError(
            dict?.orders_fill_reason_insufficient_allowance.replace(
              "{amount}",
              formatEther(costInMona)
            )
          );
          setFillOrderLoading(null);
          return;
        }
      } else {
        const requiredShares = answer === 1 ? amount : amount;
        const availableShares =
          answer === 1 ? userShares.yesShares : userShares.noShares;

        if (availableShares < requiredShares) {
          context?.showError(
            dict?.orders_fill_reason_need_shares
              .replace("{needed}", formatEther(requiredShares))
              .replace(
                "{outcome}",
                answer === 1 ? dict?.common_yes : dict?.common_no
              )
              .replace("{have}", formatEther(availableShares))
          );
          setFillOrderLoading(null);
          return;
        }
      }

      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "marketOrder",
        args: [BigInt(market.marketId), amount, orderType, answer],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.market_fill_success, hash);
      clearFillAmount(order.orderId);
    } catch (err: any) {
      context?.showError(err.message);
    }
    await getMarketInfo();
    setFillOrderLoading(null);
  };

  const splitPosition = async (amount: string) => {
    if (!walletClient || !publicClient || !address || !market) return;
    setSplitLoading(true);
    try {
      const amountBigInt = parseAmountToBigInt(amount);
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "splitPosition",
        args: [BigInt(market.marketId), amountBigInt],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.market_split_success, hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    setSplitAmount("");
    await getMarketInfo();
    await getUserShares();
    setSplitLoading(false);
  };

  const mergePositions = async (amount: string) => {
    if (!walletClient || !publicClient || !address || !market) return;
    setMergeLoading(true);
    try {
      const amountBigInt = parseAmountToBigInt(amount);
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "mergePositions",
        args: [BigInt(market.marketId), amountBigInt],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.market_merge_success, hash);
    } catch (err: any) {
      context?.showError(err.message);
    }
    setMergeAmount("");
    await getMarketInfo();
    await getUserShares();
    setMergeLoading(false);
  };

  const expireMarket = async () => {
    if (!walletClient || !publicClient || !address || !market) return;
    setExpireMarketLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "expireMarket",
        args: [BigInt(market.marketId)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.market_expire_success, hash);
      await getMarketInfo();
    } catch (err: any) {
      context?.showError(err.message);
    }
    setExpireMarketLoading(false);
  };

  const redeemFailedMarket = async () => {
    if (!walletClient || !publicClient || !address || !market) return;
    setRedeemFailedLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "redeemFailedMarket",
        args: [BigInt(market.marketId)],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.market_redeem_failed_success, hash);
      await getMarketInfo();
      await getUserShares();
    } catch (err: any) {
      context?.showError(`${dict?.market_redeem_failed_prefix} ${err.message}`);
    }
    setRedeemFailedLoading(false);
  };

  useEffect(() => {
    if (!marketLoading && !market && marketId) {
      getMarketInfo();
    }
  }, [marketId]);

  const getUserShares = async () => {
    if (!address || !publicClient || !market || !market.marketId) return;

    try {
      const balance = (await publicClient.readContract({
        address: contracts.market as `0x${string}`,
        abi: ABIS.Markets,
        functionName: "getUserBalance",
        args: [address, BigInt(market.marketId)],
      })) as any;

      setUserShares({
        yesShares: BigInt(balance.yesShares || 0),
        noShares: BigInt(balance.noShares || 0),
      });
    } catch (err) {
      console.error("Error fetching user shares:", err);
    }
  };

  const getMonaBalanceAndAllowance = async () => {
    if (!address || !publicClient) return;

    try {
      const balance = await getMonaBalance(address, publicClient, contracts);
      const allowance = await getMonaAllowance(
        address,
        contracts.market,
        publicClient,
        contracts
      );

      setMonaBalance(balance);
      setMonaAllowance(allowance);
    } catch (err) {
      console.error("Error fetching MONA balance and allowance:", err);
    }
  };

  const checkApproved = async () => {
    if (!address || !publicClient) return;

    try {
      const amount = parseAmountToBigInt(orderValues.amount);
      const allowance = await getMonaAllowance(
        address,
        contracts.market,
        publicClient,
        contracts
      );

      if (allowance >= amount) {
        setApproved(true);
      } else {
        setApproved(false);
      }
    } catch (err) {
      console.error("Error checking approval:", err);
      setApproved(false);
    }
  };

  const checkSplitApproved = async () => {
    if (
      !address ||
      !publicClient ||
      !splitAmount ||
      Number(splitAmount) === 0
    ) {
      setSplitApproved(false);
      return;
    }

    try {
      const amount = parseAmountToBigInt(splitAmount);
      const allowance = await getMonaAllowance(
        address,
        contracts.market,
        publicClient,
        contracts
      );

      if (allowance >= amount) {
        setSplitApproved(true);
      } else {
        setSplitApproved(false);
      }
    } catch (err) {
      console.error("Error checking split approval:", err);
      setSplitApproved(false);
    }
  };

  useEffect(() => {
    if (address && Number(orderValues.amount) > 0 && publicClient) {
      checkApproved();
    }
  }, [address, orderValues.amount, publicClient]);

  useEffect(() => {
    if (address && publicClient) {
      checkSplitApproved();
    }
  }, [address, splitAmount, publicClient]);

  useEffect(() => {
    if (address && market && publicClient) {
      getUserShares();
      getMonaBalanceAndAllowance();
    }
  }, [address, market, publicClient]);

  return {
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
  };
};

export default useMarket;
