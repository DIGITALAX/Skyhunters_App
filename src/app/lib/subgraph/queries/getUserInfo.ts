import { skyhuntersClient } from "../clients/graphql";
import { gql } from "@apollo/client";

const USER_PROPOSAL_VOTE = `
query($voter: String!, $proposalId: Int!) {
  proposalVotes(where: {voter: $voter, proposal_: {proposalId: $proposalId}}) {
      voted
      support
      voter
  }
}
`;

export const getUserProposalVote = async (
  voter: string,
  proposalId: number
): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(USER_PROPOSAL_VOTE),
    variables: {
      voter: voter.toLowerCase(),
      proposalId,
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
query($voter: String!, $blacklistId: Int!) {
  blacklistVotes(where: {voter: $voter, blacklist_: {blacklistId: $blacklistId}}) {
      voted
      support
      voter
  }
}
`;

export const getUserBlacklistVote = async (
  voter: string,
  blacklistId: number
): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(USER_BLACKLIST_VOTE),
    variables: {
      voter: voter.toLowerCase(),
      blacklistId,
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
          isCancelled
          isExpired
          isFinalized
          isBlacklisted
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
          blacklistId
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

