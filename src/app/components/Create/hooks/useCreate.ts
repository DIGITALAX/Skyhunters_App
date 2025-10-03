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

const useCreate = () => {
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
  const [creating, setCreating] = useState<boolean>(false);
  const [minInitialLiquidity, setMinInitialLiquidity] = useState<bigint>();
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: string[];
  }>({ valid: true, errors: [] });

  useEffect(() => {
    if (createValues.question) {
      const result = validateMarketQuestion(createValues.question);
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
      context?.showError("Please connect your wallet");
      return;
    }

    if (!context?.roles?.creator) {
      context?.showError("You must have Creator role to create markets");
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
          ? BigInt(createValues.initialBuyPrice)
          : BigInt(0),
        initialSellPrice: createValues.initialSellPrice
          ? BigInt(createValues.initialSellPrice)
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
      context?.showSuccess("Market created successfully!", hash);

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
      context?.showError(`Failed to create market: ${err.message}`);
    }
    setCreating(false);
  };

  const validateCreateInputs = (): string[] => {
    const errors: string[] = [];

    if (!validation.valid) {
      errors.push(...validation.errors);
    }

    if (!createValues.question) {
      errors.push("Question is required");
    }

    if (!createValues.endDate) {
      errors.push("End date is required");
    } else {
      const endTime = new Date(createValues.endDate).getTime();
      const minEndTime = Date.now() + 60 * 1000;
      if (endTime <= minEndTime) {
        errors.push("End date must be at least 1 minute in the future");
      }
    }

    if (!createValues.source) {
      errors.push("Source is required");
    }

    if (!createValues.failoverSource) {
      errors.push("Failover source is required");
    }

    if (!createValues.roundingMethod) {
      errors.push("Rounding method is required");
    }

    const precision = Number(createValues.precision || "10000");
    const minPrice = Number(createValues.minPrice || "100");
    const maxPrice = Number(createValues.maxPrice || "9900");

    if (minPrice >= maxPrice) {
      errors.push("Min price must be less than max price");
    }

    const hasLiquidity = Number(createValues.initialLiquidity) > 0;
    if (hasLiquidity) {
      const liquidityAmount = BigInt(Number(createValues.initialLiquidity) * 10 ** 18);
      if (liquidityAmount < minInitialLiquidity!) {
        const minInMona = Number(minInitialLiquidity) / 10 ** 18;
        errors.push(`Initial liquidity must be at least ${minInMona} MONA`);
      }

      const buyPrice = Number(createValues.initialBuyPrice);
      const sellPrice = Number(createValues.initialSellPrice);

      if (!createValues.initialBuyPrice || !createValues.initialSellPrice) {
        errors.push("Buy and sell prices are required when providing liquidity");
      } else if (buyPrice >= sellPrice) {
        errors.push("Buy price must be less than sell price");
      } else if (buyPrice < minPrice) {
        errors.push("Buy price must be at least the minimum price");
      } else if (sellPrice > maxPrice) {
        errors.push("Sell price must not exceed the maximum price");
      }
    }

    return errors;
  };

  const approveLiquidity = async () => {
    if (!walletClient || !address || !publicClient) {
      throw new Error("Wallet not connected");
    }

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
        address: contracts.market as `0x${string}`,
        abi: ABIS.Markets,
        functionName: "getMinInitialLiquidity",
      });
      setMinInitialLiquidity(BigInt(minLiq as string));
    } catch (err) {
      console.error("Error getting min initial liquidity:", err);
    }
  };

  return {
    isConnected,
    creating,
    liquidityApproved,
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
