import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useConnect } from "../../Manage/hooks/useConnect";
import { AppContext } from "@/app/lib/Providers";
import { useContext, useEffect, useState } from "react";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { validateMarketQuestion } from "@/app/constants/marketValidation";
import { ABIS } from "@/abis";
import { getMonaAllowance, getMonaBalance } from "@/app/lib/helpers/mona";

const useCreate = (dict: any) => {
  const { isConnected } = useConnect();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const context = useContext(AppContext);
  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);
  const [createValues, setCreateValues] = useState<{
    category: string;
    question: string;
    source: string;
    failoverSource: string;
    roundingMethod: string;
    precision: string;
    minPrice: string;
    maxPrice: string;
    endDate: string;
    initialLiquidity: string;
    initialBuyPrice: string;
    initialSellPrice: string;
    initialAnswer: "yes" | "no";
  }>({
    category: "",
    question: "",
    source: "",
    failoverSource: "",
    roundingMethod: "",
    precision: "10000",
    minPrice: "100",
    maxPrice: "9900",
    endDate: "",
    initialLiquidity: "",
    initialBuyPrice: "",
    initialSellPrice: "",
    initialAnswer: "no",
  });
  const [liquidityApproved, setLiquidityApproved] = useState<boolean>(false);
  const [approveLoading, setApproveLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [minInitialLiquidity, setMinInitialLiquidity] = useState<bigint>();
  const [votingPeriod, setVotingPeriod] = useState<bigint>()
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: string[];
  }>({ valid: true, errors: [] });

  useEffect(() => {
    if (createValues.question) {
      const result = validateMarketQuestion(createValues.question, dict);
      setValidation(result);
    } else {
      setValidation({ valid: true, errors: [] });
    }
  }, [createValues.question]);

  useEffect(() => {
    if (address && publicClient && Number(createValues.initialLiquidity) > 0) {
      checkLiquidityApproved();
    } else {
      setLiquidityApproved(false);
    }
  }, [address, createValues.initialLiquidity, publicClient]);

  useEffect(() => {
    if (!minInitialLiquidity && publicClient) {
      getMinInitialLiquidity();
    }
  }, [publicClient]);

  const handleCreateMarket = async () => {
    if (!address || !walletClient || !publicClient) {
      context?.showError(dict?.create_connect_wallet_error);
      return;
    }

    if (!context?.roles?.creator) {
      context?.showError(dict?.create_creator_role_error);
      return;
    }

    const validationErrors = validateCreateInputs();
    if (validationErrors.length > 0) {
      context?.showError(validationErrors[0]);
      return;
    }

    setCreating(true);
    try {
      const endTime = Math.floor(new Date(createValues.endDate).getTime() / 1000);
      const liquidityAmount = createValues.initialLiquidity
        ? BigInt(Number(createValues.initialLiquidity) * 10 ** 18)
        : BigInt(0);

      if (liquidityAmount > 0 && !liquidityApproved) {
        await approveLiquidity();
      }

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: createValues.question,
          source: createValues.source,
          failoverSource: createValues.failoverSource,
          roundingMethod: createValues.roundingMethod,
        }),
      });

      const result = await response.json();
      const uri = "ipfs://" + result.hash;

      const liquidityStruct = {
        initialLiquidity: liquidityAmount,
        initialAnswer: createValues.initialAnswer === "yes" ? 1 : 0,
        initialBuyPrice: createValues.initialBuyPrice
          ? BigInt(Math.floor(Number(createValues.initialBuyPrice) * 10000))
          : BigInt(0),
        initialSellPrice: createValues.initialSellPrice
          ? BigInt(Math.floor(Number(createValues.initialSellPrice) * 10000))
          : BigInt(0),
      };

      const hash = await walletClient.writeContract({
        address: contracts.market as `0x${string}`,
        abi: ABIS.Markets,
        functionName: "createMarket",
        args: [
          uri,
          BigInt(endTime),
          BigInt(createValues.precision || "10000"),
          BigInt(createValues.minPrice || "100"),
          BigInt(createValues.maxPrice || "9900"),
          liquidityStruct,
        ],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.create_success, hash);

      setCreateValues({
        category: "",
        question: "",
        source: "",
        failoverSource: "",
        roundingMethod: "",
        precision: "10000",
        minPrice: "100",
        maxPrice: "9900",
        endDate: "",
        initialLiquidity: "",
        initialBuyPrice: "",
        initialSellPrice: "",
        initialAnswer: "no",
      });
      setLiquidityApproved(false);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`${dict?.create_failure_prefix} ${err.message}`);
    }
    setCreating(false);
  };

  const validateCreateInputs = (): string[] => {
    const errors: string[] = [];

    if (!validation.valid) {
      errors.push(...validation.errors);
    }

    if (!createValues.question) {
      errors.push(dict?.create_validation_question_required);
    }

    if (!createValues.endDate) {
      errors.push(dict?.create_validation_end_date_required);
    } else {
      const endTime = new Date(createValues.endDate).getTime();
      const oneHourInMs = 60 * 60 * 1000;
      const votingPeriodInMs = votingPeriod ? Number(votingPeriod) * 1000 : 0;
      const minEndTime = Date.now() + votingPeriodInMs + oneHourInMs;
      if (endTime <= minEndTime) {
        const votingPeriodHours = votingPeriod ? Number(votingPeriod) / 3600 : 0;
        errors.push(
          dict?.create_validation_end_date_future_hours.replace(
            "{hours}",
            (votingPeriodHours + 1).toString()
          )
        );
      }
    }

    if (!createValues.source) {
      errors.push(dict?.create_validation_source_required);
    }

    if (!createValues.failoverSource) {
      errors.push(dict?.create_validation_failover_required);
    }

    if (!createValues.roundingMethod) {
      errors.push(dict?.create_validation_rounding_required);
    }

    const precision = Number(createValues.precision || "10000");
    const minPrice = Number(createValues.minPrice || "100");
    const maxPrice = Number(createValues.maxPrice || "9900");

    if (minPrice >= maxPrice) {
      errors.push(dict?.create_validation_min_less_than_max);
    }

    const hasLiquidity = Number(createValues.initialLiquidity) > 0;
    if (hasLiquidity) {
      const liquidityAmount = BigInt(Number(createValues.initialLiquidity) * 10 ** 18);
      if (liquidityAmount < minInitialLiquidity!) {
        const minInMona = Number(minInitialLiquidity) / 10 ** 18;
        errors.push(
          `${dict?.create_validation_min_liquidity} ${minInMona} MONA`
        );
      }

      const buyPrice = Number(createValues.initialBuyPrice);
      const sellPrice = Number(createValues.initialSellPrice);
      const minPriceDecimal = minPrice / 10000;
      const maxPriceDecimal = maxPrice / 10000;

      if (!createValues.initialBuyPrice || !createValues.initialSellPrice) {
        errors.push(dict?.create_validation_prices_required);
      } else if (buyPrice >= sellPrice) {
        errors.push(dict?.create_validation_buy_less_sell);
      } else if (buyPrice < minPriceDecimal) {
        errors.push(
          `${dict?.create_validation_buy_min_prefix} ${minPriceDecimal} (${minPriceDecimal * 100}%)`
        );
      } else if (sellPrice > maxPriceDecimal) {
        errors.push(
          `${dict?.create_validation_sell_max_prefix} ${maxPriceDecimal} (${maxPriceDecimal * 100}%)`
        );
      }
    }

    return errors;
  };

  const approveLiquidity = async () => {
    if (!walletClient || !address || !publicClient) {
      throw new Error("Wallet not connected");
    }

    setApproveLoading(true);
    try {
      const liquidityAmount = BigInt(Number(createValues.initialLiquidity) * 10 ** 18);

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
        args: [contracts.market, liquidityAmount],
        account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      setLiquidityApproved(true);
      context?.showSuccess(dict?.create_liquidity_approve_success, approveHash);
    } catch (err: any) {
      context?.showError(
        `${dict?.create_liquidity_approve_failed_prefix} ${err.message}`
      );
    }
    setApproveLoading(false);
  };

  const checkLiquidityApproved = async () => {
    if (!address || !publicClient || !createValues.initialLiquidity) {
      setLiquidityApproved(false);
      return;
    }

    try {
      const liquidityAmount = BigInt(Number(createValues.initialLiquidity) * 10 ** 18);
      const allowance = await getMonaAllowance(
        address,
        contracts.market,
        publicClient,
        contracts
      );

      setLiquidityApproved(allowance >= liquidityAmount);
    } catch (err) {
      console.error("Error checking liquidity approval:", err);
      setLiquidityApproved(false);
    }
  };

  const getMinInitialLiquidity = async () => {
    if (!publicClient) return;
    try {
      const minLiq = await publicClient.readContract({
        address: contracts.market,
        abi: ABIS.Markets,
        functionName: "getMinInitialLiquidity",
      });
      setMinInitialLiquidity(BigInt(minLiq as string));

       const votingPeriod = await publicClient.readContract({
        address: contracts.council,
        abi: ABIS.Council,
        functionName: "getVotingPeriod",
      });
      setMinInitialLiquidity(BigInt(minLiq as string));
      setVotingPeriod(BigInt(Number(votingPeriod)))
    } catch (err) {
      console.error("Error getting min initial liquidity:", err);
    }
  };

  return {
    isConnected,
    creating,
    liquidityApproved,
    approveLoading,
    approveLiquidity,
    handleCreateMarket,
    validation,
    createValues,
    setCreateValues,
    validateCreateInputs,
    checkLiquidityApproved,
    minInitialLiquidity,
  };
};

export default useCreate;
