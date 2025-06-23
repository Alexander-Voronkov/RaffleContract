import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ExchangeFeedFetcherModule = buildModule(
  "ExchangeFeedFetcherModule",
  (m) => {
    const fetcher = m.contract("ExchangeFeedFetcher");

    return { fetcher };
  },
);

export default ExchangeFeedFetcherModule;
