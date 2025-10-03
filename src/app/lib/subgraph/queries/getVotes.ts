import { skyhuntersClient } from "../clients/graphql";
import { gql } from "@apollo/client";

const COUNCIL_VOTES = `
query($currentBlocktimestamp: Int!) {
  blacklists(where: {deadline_lt: $currentBlocktimestamp}) {
    market {
        marketId
    }
    deadline
    yesVotes
    noVotes
    blacklistId
    proposer
    executed
    uri
    votes {
        voter
        voted
    }
    metadata
  }
  proposals(where: {councilWindowEnds_lt: $currentBlocktimestamp}) {
    proposalId
    yesDisputeVotes
    noDisputeVotes
    answer
    disputeBlockNumber
    disputeBlockTimestamp
    disputeTransactionHash
    disputer
    votes {
        voter
        voted
    }
  }
  penaltyForgives(where: {deadline_lt: $currentBlocktimestamp}) {
    deadline
    yesVotes
    noVotes
    targetUser
    proposer
    votes {
        voter
        voted
    }
    blockNumber
    blockTimestamp
    transactionHash
  }
}
`;

export const getCouncilVotes = async (
  currentBlocktimestamp: number,
): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(COUNCIL_VOTES),
    variables: {
 currentBlocktimestamp
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
