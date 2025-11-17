import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const skyLink = new HttpLink({
  uri: "/api/graphql/sky",
});

export const skyhuntersClient = new ApolloClient({
  link: skyLink,
  cache: new InMemoryCache(),
});
