import { useCallback, useEffect, useRef, useState } from "react";
import { Market } from "../types/common.types";
import { getAllMarkets } from "@/app/lib/subgraph/queries/getMarkets";
import { DUMMY_MARKETS } from "@/app/lib/dummy";
import { useRouter } from "next/navigation";

const useExplore = () => {
  const [explore, setExplore] = useState<Market[]>([]);
  const [exploreLoading, setExploreLoading] = useState<boolean>(false);
  const [exploreSkip, setExploreSkip] = useState<number>(0);
  const [hasMoreExplore, setHasMoreExplore] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("all");
  const lastRequestTime = useRef<number>(0);
  const requestCache = useRef<{ [key: string]: any }>({});
  const router = useRouter();
  const getAllExplore = useCallback(
    async (reset: boolean = false) => {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;

      if (timeSinceLastRequest < 1000) {
        return;
      }

      if (exploreLoading) {
        return;
      }

      setExploreLoading(true);
      lastRequestTime.current = now;

      try {
        const skipValue = reset ? 0 : exploreSkip;
        const cacheKey = `explore-all-${skipValue}`;

        if (requestCache.current[cacheKey] && !reset) {
          const cachedData = requestCache.current[cacheKey];
          const newExplore = [...explore, ...(cachedData || [])];
          setExploreSkip((prev) => prev + 20);
          setExploreLoading(false);
          setExplore(newExplore);
          return;
        }

        // const data = await getAllMarkets(20, skipValue);
        // let allExplore = data?.data?.markets;
        let allExplore = DUMMY_MARKETS;
        if (!allExplore || allExplore.length < 20) {
          setHasMoreExplore(false);
        }

        requestCache.current[cacheKey] = allExplore;

        if (reset) {
          setExplore(allExplore || []);
          setExploreSkip(20);
        } else {
          const newExplore = [...explore, ...(allExplore || [])];
          setExplore(newExplore);
          setExploreSkip((prev) => prev + 20);
        }
      } catch (err: any) {
        console.error(err.message);
      }
      setExploreLoading(false);
    },
    [exploreSkip, explore, exploreLoading]
  );

  useEffect(() => {
    if (explore?.length < 1 && !exploreLoading) {
      getAllExplore(true);
    }
  }, [getAllExplore, explore?.length, exploreLoading]);

  const loadMoreExplore = useCallback(() => {
    if (!exploreLoading && hasMoreExplore) {
      getAllExplore(false);
    }
  }, [getAllExplore, exploreLoading, hasMoreExplore]);


  const handleMarketClick = (marketId: string) => {
    router.push(`/market/${marketId}`);
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const filteredExplore = explore.filter((market) => {
    if (filter === "all") return true;
    if (filter === "active") return !market.isFinalized && !market.isBlacklisted;
    if (filter === "finalized") return market.isFinalized;
    if (filter === "blacklisted") return market.isBlacklisted;
    if (filter === "proposed") return market.proposal && !market.proposal.disputed;
    if (filter === "disputed") return market.proposal?.disputed;
    return true;
  });

  return {
    exploreLoading,
    loadMoreExplore,
    hasMoreExplore,
    explore: filteredExplore,
    handleMarketClick,
    formatDate,
    filter,
    setFilter,
  };
};

export default useExplore;
