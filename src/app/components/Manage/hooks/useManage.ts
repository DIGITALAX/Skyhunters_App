import { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { getUser } from "@/app/lib/subgraph/queries/getUserInfo";
import { AppContext } from "@/app/lib/Providers";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { ABIS } from "@/abis";
import { User } from "../types/manage.types";
import { useRouter } from "next/navigation";
import { dummyUser } from "@/app/lib/dummy";

const useManage = () => {
  const [userInfo, setUserInfo] = useState<User | undefined>();
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(false);
  const [roleStatusLoading, setRoleStatusLoading] = useState<boolean>(false);
  const [executePenaltyLoading, setExecutePenaltyLoading] = useState<boolean>(false);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const context = useContext(AppContext);
  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);
  const router = useRouter();

  const checkRoleStatus = async (
    roleType: "creator" | "proposer" | "blacklister" | "council"
  ) => {
    if (!address || !publicClient) return;
    setRoleStatusLoading(true);
    try {
      let roleEnum: number;
      switch (roleType) {
        case "creator":
          roleEnum = 0;
          break;
        case "proposer":
          roleEnum = 1;
          break;
        case "blacklister":
          roleEnum = 2;
          break;
        case "council":
          roleEnum = 3;
          break;
        default:
          return;
      }

      const hasRoleFromContract = await publicClient.readContract({
        address: contracts.accessControl as `0x${string}`,
        abi: ABIS.AccessControl,
        functionName: "hasRole",
        args: [address, roleEnum],
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
          `Role ${roleType} updated: ${hasRoleFromContract ? "TRUE" : "FALSE"}`
        );
      } else {
        context?.showSuccess(
          `Role ${roleType} confirmed: ${
            hasRoleFromContract ? "TRUE" : "FALSE"
          }`
        );
      }
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`Failed to check role ${roleType}: ${err.message}`);
    }
    setRoleStatusLoading(false);
  };

  const redeemWinnings = async (marketId: number) => {
    if (!address || !walletClient || !publicClient) return;
    setRoleStatusLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.market as `0x${string}`,
        abi: ABIS.Markets,
        functionName: "redeemWinnings",
        args: [marketId],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess("Winnings redeemed successfully!", hash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`Failed to redeem winnings: ${err.message}`);
    }
    setRoleStatusLoading(false);
  };

  const claimCouncilRewards = async () => {
    if (!address || !walletClient || !publicClient) return;
    setRoleStatusLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.council as `0x${string}`,
        abi: ABIS.Council,
        functionName: "claimRewards",
        args: [],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess("Council rewards claimed successfully!", hash);
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`Failed to claim council rewards: ${err.message}`);
    }
    setRoleStatusLoading(false);
  };

  const getUserInfo = async () => {
    if (!address) return;
    setUserInfoLoading(true);
    try {
      // const data = await getUser(address);
      // setUserInfo(data?.data?.users?.[0]);
      setUserInfo(dummyUser)
    } catch (err: any) {
      console.error(err.message);
    }
    setUserInfoLoading(false);
  };

  const executePenaltyForgiveness = async (penaltyForgiveId: number) => {
    if (!address || !walletClient || !publicClient) return;
    setExecutePenaltyLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.council as `0x${string}`,
        abi: ABIS.Council,
        functionName: "executePenaltyForgiveness",
        args: [penaltyForgiveId],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      context?.showSuccess("Penalty forgiveness executed successfully!", hash);
      getUserInfo();
    } catch (err: any) {
      console.error(err.message);
      context?.showError(`Failed to execute penalty forgiveness: ${err.message}`);
    }
    setExecutePenaltyLoading(false);
  };

  const navigateToMarket = (marketId: string) => {
    router.push(`/market/${marketId}`);
  };


  useEffect(() => {
    if (address && !userInfoLoading) {
      getUserInfo();
    }
  }, [address]);

  return {
    userInfo,
    checkRoleStatus,
    userInfoLoading,
    roleStatusLoading,
    executePenaltyLoading,
    redeemWinnings,
    claimCouncilRewards,
    executePenaltyForgiveness,
    navigateToMarket,
    getUserInfo
  };
};

export default useManage;
