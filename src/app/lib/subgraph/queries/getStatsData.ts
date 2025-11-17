import { skyhuntersClient } from "../clients/graphql";
import { gql } from "@apollo/client";

const BLACKLISTS_QUERY = `
query($first: Int!, $skip: Int!) {
    blacklists(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
        id
        market {
            marketId
            uri
            metadata {
                question
            }
        }
        deadline
        yesVotes
        noVotes
        blacklistId
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
            blacklist
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
`;

const PENALTIES_QUERY = `
query($first: Int!, $skip: Int!) {
    penaltyForgives(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
        deadline
        yesVotes
        noVotes
        targetUser
        penaltyForgiveId
        proposer
        executed
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
`;

const DISPUTES_QUERY = `
query($first: Int!, $skip: Int!) {
    proposals(first: $first, skip: $skip, where: { disputer_not: null }, orderBy: disputeBlockTimestamp, orderDirection: desc) {
        proposalId
        market {
            marketId
            uri
            metadata {
                question
            }
        }
        proposerBond {
            proposal
            monaAmount
            isSlashed
        }
        disputeWindowEnds
        councilWindowEnds
        disputerBond {
            proposal
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
            proposal
            blockNumber
            blockTimestamp
            transactionHash
            marketId
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
}
`;

const PROPOSALS_QUERY = `
query($first: Int!, $skip: Int!) {
    proposals(first: $first, skip: $skip, orderBy: proposalBlockTimestamp, orderDirection: desc) {
        proposalId
        market {
            marketId
            uri
            metadata {
                question
            }
        }
        proposerBond {
            proposal
            monaAmount
            isSlashed
        }
        disputeWindowEnds
        councilWindowEnds
        disputerBond {
            proposal
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
            proposal
            blockNumber
            blockTimestamp
            transactionHash
            marketId
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
}
`;

export const getBlacklists = async (first: number, skip: number): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(BLACKLISTS_QUERY),
    variables: { first, skip },
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

export const getPenalties = async (first: number, skip: number): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(PENALTIES_QUERY),
    variables: { first, skip },
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

export const getDisputes = async (first: number, skip: number): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(DISPUTES_QUERY),
    variables: { first, skip },
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

export const getProposals = async (first: number, skip: number): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(PROPOSALS_QUERY),
    variables: { first, skip },
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
