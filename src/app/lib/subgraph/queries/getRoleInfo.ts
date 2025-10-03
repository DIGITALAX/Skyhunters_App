import { skyhuntersClient } from "../clients/graphql";
import { gql } from "@apollo/client";

const ROLE_INFO = `
query {
  roles {
    role
    threshold
    tokens {
        isNFT
        tokenAddress
        minAmount
    }
  }
}
`;

export const getRoleInfo = async (): Promise<any> => {
  const queryPromise = skyhuntersClient.query({
    query: gql(ROLE_INFO),
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
