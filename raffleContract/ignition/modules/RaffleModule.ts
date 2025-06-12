import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

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
    [interval],
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