import { ABIS } from "@/abis";
import {
  getCoreContractAddresses,
  getCurrentNetwork,
} from "@/app/lib/constants";
import { AppContext } from "@/app/lib/Providers";
import { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { RoleType } from "../../Manage/types/manage.types";
import { Role } from "../types/common.types";
import { getRoleInfo } from "@/app/lib/subgraph/queries/getRoleInfo";

const useRole = () => {
  const context = useContext(AppContext);
  const { address } = useAccount();
  const [roleLoading, setRoleLoading] = useState<boolean>(false);
  const [reqs, setReqs] = useState<Role>();
  const publicClient = usePublicClient();
  const network = getCurrentNetwork();
  const contracts = getCoreContractAddresses(network.chainId);

  const getRole = async () => {
    if (!address || !publicClient) return;
    setRoleLoading(true);
    try {
      const [blacklister, creator, proposer, council]: boolean[] = [
        (await publicClient.readContract({
          address: contracts.accessControl as `0x${string}`,
          abi: ABIS.AccessControl,
          functionName: "hasRole",
          args: [address, RoleType.BLACKLISTER],
        })) as boolean,
        (await publicClient.readContract({
          address: contracts.accessControl as `0x${string}`,
          abi: ABIS.AccessControl,
          functionName: "hasRole",
          args: [address, RoleType.CREATOR],
        })) as boolean,
        (await publicClient.readContract({
          address: contracts.accessControl as `0x${string}`,
          abi: ABIS.AccessControl,
          functionName: "hasRole",
          args: [address, RoleType.PROPOSER],
        })) as boolean,
        (await publicClient.readContract({
          address: contracts.accessControl as `0x${string}`,
          abi: ABIS.AccessControl,
          functionName: "hasRole",
          args: [address, RoleType.COUNCIL],
        })) as boolean,
      ];

      context?.setRoles({
        creator,
        proposer,
        blacklister,
        council,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setRoleLoading(false);
  };

  const getRoleReqs = async () => {
    try {
      const data = await getRoleInfo();
      setReqs(
        data?.data?.roles?.map((role: any) => ({
          ...role,
          role: Number(role.role),
        }))
      );
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (address && !context?.roles && publicClient) {
      getRole();
    }

    if (Number(context?.roleInfo?.length) < 1) {
      getRoleReqs();
    }
  }, [address, publicClient]);

  return { roleLoading };
};

export default useRole;
