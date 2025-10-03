import { skyhuntersClient } from "../clients/graphql";
import { gql } from "@apollo/client";

const USER_MARKET_VOTE = `
query($voter: String!, $marketId: Int!) {
  proposalDisputeVotes(where: {voter: $voter, marketId: $marketId}) {
      voted
      support
      blockNumber
      blockTimestamp
      transactionHash
  }
}
`;

export const getUserMarketVote = async (
  voter: string,
  marketId: number
): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(USER_MARKET_VOTE),
    variables: {
      voter,
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



const USER_BLACKLIST_VOTE = `
query($voter: String!, $marketId: Int!) {
  blacklistVotes(where: {voter: $voter, marketId: $marketId}) {
      voted
      support
      blockNumber
      blockTimestamp
      transactionHash
  }
}
`;

export const getUserBlacklistVote = async (
  voter: string,
  marketId: number
): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(USER_BLACKLIST_VOTE),
    variables: {
      voter,
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


const USER = `
query($id: String!) {
  users(where: {id: $id}) {
      marketActivity {
        yesShares
        noShares
        market {
          finalAnswer
          marketId
        }
        winningsRedeemed
      }
      winnings {
        market
        amount
        blockNumber
        blockTimestamp
        transactionHash
      }
      proposals {
        proposalId
        proposerBond
        answer
        disputed
        finalAnswer
        expired
        proposalBlockNumber
        proposalBlockTimestamp
        proposalTransactionHash
      }
      disputes {
        proposalId
        disputerBond
        answer
        disputed
        finalAnswer
        expired
        disputeBlockNumber
        disputeBlockTimestamp
        disputeTransactionHash
      }
      blacklists {
        market {
          marketId
        }
        blacklistId
        deadline
        yesVotes
        noVotes
        blockNumber
        blockTimestamp
        transactionHash
      }
      penalties {
        deadline
        yesVotes
        noVotes
        targetUser
        executed
        blockNumber
        blockTimestamp
        transactionHash
      }
      penaltiesRecieved {
        deadline
        yesVotes
        noVotes
        proposer
        executed
        blockNumber
        blockTimestamp
        transactionHash
      }
      proposalVotes {
        voted
        support
        blockNumber
        proposal {
          proposalId
        }
        blockTimestamp
        transactionHash
      }
      blacklistVotes {
        voted
        support
        blacklist {
          market {
            marketId
          }
        }
        blockNumber
        blockTimestamp
        transactionHash
      }
      penaltyVotes {
        voted
        support
        blockNumber
        blockTimestamp
        transactionHash
      }
      totalPendingRewards
      participationPoints
      firstActivityBlock
      eligibleDisputeCount
      successfulProposals
      successfulDisputes
      failedActions
      slashMultiplier
      councilRewardsClaimed
  }
}
`;


export const getUser = async (
 id: string
): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(USER),
    variables: {
    id
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

