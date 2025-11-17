import { useEffect, useState } from "react";
import { Blacklist, Proposal } from "../../Common/types/common.types";
import { PenaltyForgive } from "../../Manage/types/manage.types";
import {
  getBlacklists,
  getPenalties,
  getProposals,
  getDisputes,
} from "@/app/lib/subgraph/queries/getStatsData";
import { ensureMetadata } from "@/app/lib/utils";

const PAGE_SIZE = 20;

const useStats = () => {
  const [allBlacklists, setAllBlacklists] = useState<Blacklist[]>([]);
  const [allDisputes, setAllDisputes] = useState<Proposal[]>([]);
  const [allForgiveness, setAllForgiveness] = useState<PenaltyForgive[]>([]);
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);

  const [blacklistsPage, setBlacklistsPage] = useState<number>(0);
  const [disputesPage, setDisputesPage] = useState<number>(0);
  const [forgivenessPage, setForgivenessPage] = useState<number>(0);
  const [proposalsPage, setProposalsPage] = useState<number>(0);

  const [hasMoreBlacklists, setHasMoreBlacklists] = useState<boolean>(true);
  const [hasMoreDisputes, setHasMoreDisputes] = useState<boolean>(true);
  const [hasMoreForgiveness, setHasMoreForgiveness] = useState<boolean>(true);
  const [hasMoreProposals, setHasMoreProposals] = useState<boolean>(true);

  const [loadingBlacklists, setLoadingBlacklists] = useState<boolean>(false);
  const [loadingDisputes, setLoadingDisputes] = useState<boolean>(false);
  const [loadingForgiveness, setLoadingForgiveness] = useState<boolean>(false);
  const [loadingProposals, setLoadingProposals] = useState<boolean>(false);

  const loadBlacklists = async () => {
    if (loadingBlacklists || !hasMoreBlacklists) return;
    setLoadingBlacklists(true);
    try {
      const result = await getBlacklists(PAGE_SIZE, blacklistsPage * PAGE_SIZE);
      let newBlacklists = result?.data?.blacklists || [];
      newBlacklists = await Promise.all(
        newBlacklists?.map(async (bl: any) => {
          const blacklist = await ensureMetadata(bl);
          const market = await ensureMetadata(bl?.market);
          return {
            ...blacklist,
            market,
          };
        })
      );


      if (newBlacklists.length < PAGE_SIZE) {
        setHasMoreBlacklists(false);
      }

      setAllBlacklists([...allBlacklists, ...newBlacklists]);
      setBlacklistsPage(blacklistsPage + 1);
    } catch (err: any) {
      console.error(err.message);
    }
    setLoadingBlacklists(false);
  };

  const loadDisputes = async () => {
    if (loadingDisputes || !hasMoreDisputes) return;
    setLoadingDisputes(true);
    try {
      const result = await getDisputes(PAGE_SIZE, disputesPage * PAGE_SIZE);
      let newDisputes = result?.data?.proposals || [];
      newDisputes = await Promise.all(
        newDisputes?.map(async (prop: any) => {
          const market = await ensureMetadata(prop?.market);
          return {
            ...prop,
            market,
          };
        })
      );

      if (newDisputes.length < PAGE_SIZE) {
        setHasMoreDisputes(false);
      }

      setAllDisputes([...allDisputes, ...newDisputes]);
      setDisputesPage(disputesPage + 1);
    } catch (err: any) {
      console.error(err.message);
    }
    setLoadingDisputes(false);
  };

  const loadForgiveness = async () => {
    if (loadingForgiveness || !hasMoreForgiveness) return;
    setLoadingForgiveness(true);
    try {
      const result = await getPenalties(PAGE_SIZE, forgivenessPage * PAGE_SIZE);
      const newForgiveness = result?.data?.penaltyForgives || [];

      if (newForgiveness.length < PAGE_SIZE) {
        setHasMoreForgiveness(false);
      }

      setAllForgiveness([...allForgiveness, ...newForgiveness]);
      setForgivenessPage(forgivenessPage + 1);
    } catch (err: any) {
      console.error(err.message);
    }
    setLoadingForgiveness(false);
  };

  const loadProposals = async () => {
    if (loadingProposals || !hasMoreProposals) return;
    setLoadingProposals(true);
    try {
      const result = await getProposals(PAGE_SIZE, proposalsPage * PAGE_SIZE);
      let newProposals = result?.data?.proposals || [];
      newProposals = await Promise.all(
        newProposals?.map(async (prop: any) => {
          const market = await ensureMetadata(prop?.market);
          return {
            ...prop,
            market,
          };
        })
      );

      if (newProposals.length < PAGE_SIZE) {
        setHasMoreProposals(false);
      }

      setAllProposals([...allProposals, ...newProposals]);
      setProposalsPage(proposalsPage + 1);
    } catch (err: any) {
      console.error(err.message);
    }
    setLoadingProposals(false);
  };

  useEffect(() => {
    if (allBlacklists.length === 0 && hasMoreBlacklists) {
      loadBlacklists();
    }
  }, []);

  useEffect(() => {
    if (allDisputes.length === 0 && hasMoreDisputes) {
      loadDisputes();
    }
  }, []);

  useEffect(() => {
    if (allForgiveness.length === 0 && hasMoreForgiveness) {
      loadForgiveness();
    }
  }, []);

  useEffect(() => {
    if (allProposals.length === 0 && hasMoreProposals) {
      loadProposals();
    }
  }, []);

  return {
    allBlacklists,
    allDisputes,
    allForgiveness,
    allProposals,
    hasMoreBlacklists,
    hasMoreDisputes,
    hasMoreForgiveness,
    hasMoreProposals,
    loadingBlacklists,
    loadingDisputes,
    loadingForgiveness,
    loadingProposals,
    loadBlacklists,
    loadDisputes,
    loadForgiveness,
    loadProposals,
  };
};

export default useStats;
