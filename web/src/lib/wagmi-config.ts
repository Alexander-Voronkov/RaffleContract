import { createAppKit } from "@reown/appkit/react";

import { localhost, type Chain } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const projectId = "25f220b04f3b5f5655fa7ca47e4303df";

const metadata = {
  name: "raffle",
  description: "AppKit Example",
  url: "https://reown.com/appkit",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

const networks = [localhost] satisfies [Chain, ...Chain[]];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});
