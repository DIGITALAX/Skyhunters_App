import { INFURA_GATEWAY } from "./constants";

export const ensureMetadata = async (item: any) => {
  if (!item?.metadata && item?.uri) {
    const ipfsMetadata = await fetchMetadataFromIPFS(item?.uri);
    item.metadata = ipfsMetadata;
  }
  return item;
};

export const fetchMetadataFromIPFS = async (uri: string): Promise<any> => {
  try {
    let metadataUrl = uri;

    if (uri?.startsWith("ipfs://")) {
      metadataUrl = `${INFURA_GATEWAY}${uri.split("ipfs://")[1]}`;
    } else if (!uri?.startsWith("http://") && !uri?.startsWith("https://")) {
      return null;
    }

    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const metadata = await response.json();
    return metadata;
  } catch (error) {
    return null;
  }
};