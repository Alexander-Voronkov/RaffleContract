import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { bnb_usd_feed, bnbAddress, usdc_usd_feed, usdcAddress, usdt_usd_feed, usdtAddress } from "../../constants/contractAddresses";

const RaffleModule = (interval: number) => buildModule("RaffleModule", (m) => {

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
    [interval, [usdcAddress, usdtAddress, bnbAddress], [usdc_usd_feed, usdt_usd_feed, bnb_usd_feed]],
    { from: admin }
  );

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { proxy, raffleProxy, proxyAdmin };
});

export default RaffleModule;