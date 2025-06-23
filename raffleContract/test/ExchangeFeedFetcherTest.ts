import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, ignition } from "hardhat";
import ExchangeFeedFetcherModule from "../ignition/modules/ExchangeFeedFetcherModule";
import { ExchangeFeedFetcher__factory } from "../typechain-types";
import * as feeds from "../constants/contractAddresses";

describe("ExchangeFeedTests", async () => {
  async function deployExchangeFeedModule() {
    const { fetcher } = await ignition.deploy(ExchangeFeedFetcherModule);
    const [owner, ...others] = await ethers.getSigners();

    const typedFetcher = ExchangeFeedFetcher__factory.connect(await fetcher.getAddress(), owner);

    return { fetcher: typedFetcher, owner, others };
  }

  it("should fetch current prices", async function () {
    const { fetcher, owner } = await loadFixture(deployExchangeFeedModule);

    const [currency1, decimals1] = await fetcher.connect(owner).getLatestData(feeds.eth_usd_feed);
    const [currency3, decimals3] = await fetcher.connect(owner).getLatestData(feeds.usdc_usd_feed);
    const [currency4, decimals4] = await fetcher.connect(owner).getLatestData(feeds.usdt_usd_feed);

    console.log("ETH TO USD: ", Number(currency1) / 10 ** Number(decimals1));
    console.log("USDC TO USD: ", Number(currency3) / 10 ** Number(decimals3));
    console.log("USDT TO USD: ", Number(currency4) / 10 ** Number(decimals4));

    console.log("ETH decimals ", decimals1);
    console.log("USDC decimals ", decimals3);
    console.log("USDT decimals ", decimals4);

    expect(currency1).to.be.a("bigint");
    expect(currency3).to.be.a("bigint");
    expect(currency4).to.be.a("bigint");
  });
});
