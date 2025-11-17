import { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { getUser } from "@/app/lib/subgraph/queries/getUserInfo";
import { getMarketsByCreator } from "@/app/lib/subgraph/queries/getMarkets";
import { AppContext } from "@/app/lib/Providers";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { ABIS } from "@/abis";
import {
  RoleKey,
  RoleRequirement,
  TokenRequirement,
  User,
} from "../types/manage.types";
import { useRouter } from "next/navigation";
import { ensureMetadata } from "@/app/lib/utils";

const ROLE_ENUM: Record<RoleKey, number> = {
  creator: 0,
  proposer: 1,
  blacklister: 2,
  council: 3,
};

const initialRoleRequirements: Record<RoleKey, RoleRequirement | null> = {
  creator: null,
  proposer: null,
  blacklister: null,
  council: null,
};

const useManage = (dict: any) => {
  const roleLabels: Record<RoleKey, string> = {
    creator: dict?.role_creator,
    proposer: dict?.role_proposer,
    blacklister: dict?.role_blacklister,
    council: dict?.role_council,
  };
  const [userInfo, setUserInfo] = useState<User | undefined>();
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(false);
  const [createdMarkets, setCreatedMarkets] = useState<any[]>([]);
  const [createdMarketsLoading, setCreatedMarketsLoading] =
    useState<boolean>(false);
  const [cancellingMarket, setCancellingMarket] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState<string | null>(null);
  const [redeemingWinnings, setRedeemingWinnings] = useState<string | null>(
    null
  );
  const [redeemingFailedActivity, setRedeemingFailedActivity] = useState<string | null>(null);
  const [redeemingFailedCreated, setRedeemingFailedCreated] = useState<string | null>(null);
  const [claimingRewards, setClaimingRewards] = useState<boolean>(false);
  const [executePenaltyLoading, setExecutePenaltyLoading] = useState<
    string | null
  >(null);
  const [roleRequirements, setRoleRequirements] = useState<
    Record<RoleKey, RoleRequirement | null>
  >(initialRoleRequirements);
  const [roleRequirementsLoading, setRoleRequirementsLoading] =
    useState<boolean>(false);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const context = useContext(AppContext);
  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);
  const router = useRouter();

  const checkRoleStatus = async (roleType: RoleKey) => {
    if (!address || !publicClient) return;
    setCheckingRole(roleType);
    try {
      const hasRoleFromContract = await publicClient.readContract({
        address: contracts.accessControl as `0x${string}`,
        abi: ABIS.AccessControl,
        functionName: "hasRole",
        args: [ROLE_ENUM[roleType], address],
      });

      const currentRoleValue = context?.roles?.[roleType] || false;

      if (hasRoleFromContract !== currentRoleValue) {
        const updatedRoles = {
          creator: context?.roles?.creator || false,
          proposer: context?.roles?.proposer || false,
          blacklister: context?.roles?.blacklister || false,
          council: context?.roles?.council || false,
          [roleType]: hasRoleFromContract,
        };
        context?.setRoles(updatedRoles);
        context?.showSuccess(
          `${dict?.manage_role_updated_prefix} ${roleLabels[roleType]} ${dict?.manage_role_status_separator} ${
            hasRoleFromContract ? dict?.common_true : dict?.common_false
          }`
        );
      } else {
        context?.showSuccess(
          `${dict?.manage_role_confirmed_prefix} ${
            hasRoleFromContract ? dict?.common_true : dict?.common_false
          }`
        );
      }
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `${dict?.manage_role_check_failed_prefix} ${roleLabels[roleType]}: ${err.message}`
      );
    }
    setCheckingRole(null);
  };

  const getRoleRequirements = async () => {
    if (!publicClient || !contracts.accessControl) return;
    setRoleRequirementsLoading(true);
    try {
      const results = await Promise.all(
        (Object.keys(ROLE_ENUM) as RoleKey[]).map(async (role) => {
          const response = (await publicClient.readContract({
            address: contracts.accessControl as `0x${string}`,
            abi: ABIS.AccessControl,
            functionName: "getRoleRequirements",
            args: [ROLE_ENUM[role]],
          })) as readonly [readonly TokenRequirement[], bigint];

          const [tokens, threshold] = response;

          return {
            role,
            details: {
              tokenRequirements: tokens.map((token) => ({
                tokenAddress: token.tokenAddress,
                minAmount: token.isNFT
                  ? token.minAmount
                  : Number(token.minAmount) / 10 ** 18,
                isNFT: token.isNFT,
              })),
              threshold: BigInt(threshold ?? 0),
            },
          };
        })
      );


      const formatted = results.reduce(
        (acc, curr) => {
          acc[curr.role] = curr.details as any;
          return acc;
        },
        { ...initialRoleRequirements }
      );

      setRoleRequirements(formatted);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `${dict?.manage_role_requirements_failed_prefix} ${err.message}`
      );
    }
    setRoleRequirementsLoading(false);
  };

  const redeemWinnings = async (marketId: number) => {
    if (!address || !walletClient || !publicClient) return;
    setRedeemingWinnings(marketId.toString());
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market as `0x${string}`,
        abi: ABIS.Markets,
        functionName: "redeemWinnings",
        args: [marketId],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.manage_redeem_success, hash);
      getUserInfo();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`${dict?.manage_redeem_failed_prefix} ${err.message}`);
    }
    setRedeemingWinnings(null);
  };

  const redeemFailedMarketActivity = async (marketId: number) => {
    if (!address || !walletClient || !publicClient) return;
    setRedeemingFailedActivity(marketId.toString());
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market as `0x${string}`,
        abi: ABIS.Markets,
        functionName: "redeemFailedMarket",
        args: [marketId],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.manage_redeem_failed_market_success, hash);
      getUserInfo();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `${dict?.manage_redeem_failed_market_failed_prefix} ${err.message}`
      );
    }
    setRedeemingFailedActivity(null);
  };

  const redeemFailedMarketCreated = async (marketId: number) => {
    if (!address || !walletClient || !publicClient) return;
    setRedeemingFailedCreated(marketId.toString());
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market as `0x${string}`,
        abi: ABIS.Markets,
        functionName: "redeemFailedMarket",
        args: [marketId],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.manage_redeem_failed_market_success, hash);
      getCreatedMarkets();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `${dict?.manage_redeem_failed_market_failed_prefix} ${err.message}`
      );
    }
    setRedeemingFailedCreated(null);
  };

  const claimCouncilRewards = async () => {
    if (!address || !walletClient || !publicClient) return;
    setClaimingRewards(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.council as `0x${string}`,
        abi: ABIS.Council,
        functionName: "claimRewards",
        args: [],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.manage_claim_rewards_success, hash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `${dict?.manage_claim_rewards_failed_prefix} ${err.message}`
      );
    }
    setClaimingRewards(false);
  };

  const getUserInfo = async () => {
    if (!address) return;
    setUserInfoLoading(true);
    try {
      const data = await getUser(address);
      setUserInfo(data?.data?.users?.[0]);
    } catch (err: any) {
      console.error(err.message);
    }
    setUserInfoLoading(false);
  };

  const getCreatedMarkets = async () => {
    if (!address) return;
    setCreatedMarketsLoading(true);
    try {
      const data = await getMarketsByCreator(address);
      let allMarkets = await Promise.all(
        data?.data?.markets?.map(async (market: any) => {
          return await ensureMetadata(market);
        })
      );
      setCreatedMarkets(allMarkets);
    } catch (err: any) {
      console.error(err.message);
    }
    setCreatedMarketsLoading(false);
  };

  const cancelMarket = async (marketId: string) => {
    if (!address || !walletClient || !publicClient) return;
    setCancellingMarket(marketId);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market as `0x${string}`,
        abi: ABIS.Markets,
        functionName: "cancelMarket",
        args: [Number(marketId)],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.manage_cancel_success, hash);
      getCreatedMarkets();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`${dict?.manage_cancel_failed_prefix} ${err.message}`);
    }
    setCancellingMarket(null);
  };

  const executePenaltyForgiveness = async (penaltyForgiveId: number) => {
    if (!address || !walletClient || !publicClient) return;
    setExecutePenaltyLoading(penaltyForgiveId.toString());
    try {
      const hash = await walletClient.writeContract({
        address: contracts.council as `0x${string}`,
        abi: ABIS.Council,
        functionName: "executePenaltyForgiveness",
        args: [penaltyForgiveId],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess(dict?.manage_penalty_success, hash);
      getUserInfo();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(
        `${dict?.manage_penalty_failed_prefix} ${err.message}`
      );
    }
    setExecutePenaltyLoading(null);
  };

  const navigateToMarket = (marketId: string, isCancelled?: boolean) => {
    if (isCancelled) return;
    router.push(`/market/${marketId}`);
  };

  useEffect(() => {
    if (address && !userInfoLoading) {
      getUserInfo();
      getCreatedMarkets();
    }
  }, [address]);

  useEffect(() => {
    if (publicClient) {
      getRoleRequirements();
    }
  }, [publicClient]);

  return {
    userInfo,
    checkRoleStatus,
    userInfoLoading,
    createdMarkets,
    createdMarketsLoading,
    cancelMarket,
    cancellingMarket,
    checkingRole,
    redeemingWinnings,
    redeemingFailedActivity,
    redeemingFailedCreated,
    claimingRewards,
    executePenaltyLoading,
    redeemWinnings,
    redeemFailedMarketActivity,
    redeemFailedMarketCreated,
    claimCouncilRewards,
    executePenaltyForgiveness,
    navigateToMarket,
    getUserInfo,
    roleRequirements,
    roleRequirementsLoading,
    getRoleRequirements,
  };
};

export default useManage;
