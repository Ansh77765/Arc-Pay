import { defineChain } from "viem";

/**
 * Arc Testnet — Circle's stablecoin-native L1.
 *
 * USDC is the *native* gas asset on Arc (like ETH on most EVM chains), so the
 * native currency here is USDC with 18 decimals for gas/native-value
 * accounting. The ERC-20 interface used for payments in this app is a
 * separate, 6-decimal representation of the same asset — see lib/config.ts.
 *
 * All values are sourced from env vars so an official change to RPC/explorer
 * endpoints never requires a code change or a redeploy of stale hardcoded
 * addresses.
 */
export const arcTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 5042002),
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.testnet.arc.network"],
      webSocket: [process.env.NEXT_PUBLIC_WS_RPC_URL ?? "wss://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});
