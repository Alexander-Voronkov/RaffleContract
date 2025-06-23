import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VRFModule = buildModule("VRFModule", (m) => {
  const coordinatorMock = m.contract("VRFMock");
  const admin = m.getAccount(0);

  const createSubTx = m.call(coordinatorMock, "createSubscription", [], {
    from: admin,
    id: "createSubscriptionCall",
  });

  const subscriptionId = m.readEventArgument(
    createSubTx,
    "SubscriptionCreated",
    "subId",
  );

  m.call(coordinatorMock, "fundSubscription", [
    subscriptionId,
    BigInt(10000000000000000000),
  ]);

  const consumer = m.contract("VRFv2Consumer", [
    subscriptionId,
    coordinatorMock,
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
  ]);

  m.call(coordinatorMock, "addConsumer", [subscriptionId, consumer], {
    from: admin,
    id: "addConsumerCall",
  });

  return { mock: coordinatorMock, consumer };
});

export default VRFModule;
