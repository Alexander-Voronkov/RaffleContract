import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { bnb_usd_feed, bnbAddress, usdc_usd_feed, usdcAddress, usdt_usd_feed, usdtAddress } from "../../constants/contractAddresses";
import SwapperModule from "./SwapperModule";
import VRFModule from "./VRFModule";
import ExchangeFeedFetcherModule from "./ExchangeFeedFetcherModule";

const RaffleModule = (interval: number = 60) => buildModule("RaffleModule", (m) => {

  const { swapper, usdt, usdc, bnb, weth } = m.useModule(SwapperModule);
  const { mock, consumer } = m.useModule(VRFModule);
  const { fetcher } = m.useModule(ExchangeFeedFetcherModule);

  const admin = m.getAccount(0);

  const raffleImpl = m.contract("Raffle");

  const proxy = m.contract("TransparentUpgradeableProxy", [
    raffleImpl,
    admin,   
    "0x",
  ]);

  const raffleProxy = m.contractAt("Raffle", proxy, {
    id: "RaffleProxy",
  });

  m.call(
    raffleProxy,
    "initialize",
    [
      interval, 
      [usdcAddress, usdtAddress, bnbAddress], 
      [usdc_usd_feed, usdt_usd_feed, bnb_usd_feed],
      swapper,
      mock,
      consumer,
      fetcher
    ],
    { from: admin }
  );

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { proxy, raffleProxy, proxyAdmin, mock, consumer, fetcher, swapper, usdt, usdc, weth, bnb };
});

export default RaffleModule;