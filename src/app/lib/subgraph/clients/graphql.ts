import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const skyhuntersLink = new HttpLink({
  uri: `https://api.studio.thegraph.com/query/109132/skyhunters/version/latest`,
});

export const skyhuntersClient = new ApolloClient({
  link: skyhuntersLink,
  cache: new InMemoryCache(),
});


