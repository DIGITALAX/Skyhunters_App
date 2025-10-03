import { skyhuntersClient } from "../clients/graphql";
import { gql } from "@apollo/client";

const ALL_MARKETS = `
query($first: Int!, $skip: Int!) {
  markets(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
      marketId
      endTime
      minPrice
      maxPrice
      uri
      metadata {
        question
      }
      isFinalized
      isBlacklisted
      finalAnswer
      totalVolume
      blockNumber
      blockTimestamp
      transactionHash
  }
}
`;

export const getAllMarkets = async (
  first: number,
  skip: number
): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(ALL_MARKETS),
    variables: {
      first,
      skip,
    },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({ timedOut: true });
    }, 60000);
  });

  const result: any = await Promise.race([queryPromise, timeoutPromise]);
  if (result.timedOut) {
    return;
  } else {
    return result;
  }
};

const MARKET = `
query($marketId: Int!) {
  markets(where: {marketId: $marketId}) {
    marketId
    endTime
    minPrice
    maxPrice
    precision
    creator
    finalAnswer
    marketFees
    uri
    metadata {
      question
    }
    isFinalized
    isBlacklisted
    totalVolume
    blockNumber
    blockTimestamp
    transactionHash
    buyOrders {
      orderId
      price
      amount
      amountFilled
      filled
      filler
      maker
      orderType
      answer
      cancelled
      blockNumber
      blockTimestamp
      transactionHash
    }
    sellOrders {
      orderId
      price
      amount
      amountFilled
      filled
      filler
      maker
      orderType
      answer
      cancelled
      blockNumber
      blockTimestamp
      transactionHash   
    }
    proposal {
      proposalId
      proposerBond {
        monaAmount
        isSlashed
      }
      disputeWindowEnds
      councilWindowEnds
      disputerBond {
        monaAmount
        isSlashed
      }
      yesDisputeVotes
      noDisputeVotes
      proposer
      disputer
      answer
      disputed
      disputePassed
      finalAnswer
      expired
      votes {
        voted
        support
        voter
        blockNumber
        blockTimestamp
        transactionHash
      }
      disputeBlockNumber
      disputeBlockTimestamp
      disputeTransactionHash
      proposalBlockNumber
      proposalBlockTimestamp
      proposalTransactionHash
      proposerReward
      disputerReward
    }
    blacklist {
      deadline
      yesVotes
      noVotes
      proposer
      executed
      uri
      metadata {
        reason
        comments 
      }
      votes {
        voted
        support
        voter
        blockNumber
        blockTimestamp
        transactionHash
      }
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
}
`;

export const getMarket = async (marketId: number): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(MARKET),
    variables: {
      marketId,
    },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({ timedOut: true });
    }, 60000);
  });

  const result: any = await Promise.race([queryPromise, timeoutPromise]);
  if (result.timedOut) {
    return;
  } else {
    return result;
  }
};
