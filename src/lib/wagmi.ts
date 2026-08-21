
import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { arcTestnet } from "./chain";
import { APP_NAME } from "./config";

export const wagmiConfig = createConfig({
  chains: [arcTestnet],

  connectors: [
    injected({
      shimDisconnect: true,
    }),

    coinbaseWallet({
      appName: APP_NAME,
    }),
  ],

  // IMPORTANT:
  // Allow Wagmi to discover multiple installed
  // browser wallets through EIP-6963.
  multiInjectedProviderDiscovery: true,

  transports: {
    [arcTestnet.id]: http(),
  },

  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

