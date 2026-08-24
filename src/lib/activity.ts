import {
  createPublicClient,
  http,
  parseAbiItem,
  type Address,
  type Hex,
} from "viem";

import { arcTestnet } from "@/lib/chain";
import {
  EXPLORER_URL,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/config";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(
    process.env.NEXT_PUBLIC_RPC_URL ??
      "https://rpc.testnet.arc.network"
  ),
});

export type ActivityItem = {
  type: "sent" | "received";
  hash: Hex;
  from: Address;
  to: Address;
  amount: string;
  blockNumber: bigint;
};

export async function getWalletActivity(
  wallet: Address
): Promise<ActivityItem[]> {
  const latestBlock =
    await publicClient.getBlockNumber();

  const fromBlock =
    latestBlock > 5000n
      ? latestBlock - 5000n
      : 0n;

  const [
    sentLogs,
    receivedLogs,
  ] = await Promise.all([
    publicClient.getLogs({
      address: USDC_ADDRESS,
      event: transferEvent,
      args: {
        from: wallet,
      },
      fromBlock,
      toBlock: latestBlock,
    }),

    publicClient.getLogs({
      address: USDC_ADDRESS,
      event: transferEvent,
      args: {
        to: wallet,
      },
      fromBlock,
      toBlock: latestBlock,
    }),
  ]);

  const sent: ActivityItem[] =
    sentLogs.map((log) => ({
      type: "sent",
      hash: log.transactionHash,
      from: log.args.from as Address,
      to: log.args.to as Address,
      amount: formatUSDC(
        log.args.value ?? 0n
      ),
      blockNumber:
        log.blockNumber ?? 0n,
    }));

  const received: ActivityItem[] =
    receivedLogs.map((log) => ({
      type: "received",
      hash: log.transactionHash,
      from: log.args.from as Address,
      to: log.args.to as Address,
      amount: formatUSDC(
        log.args.value ?? 0n
      ),
      blockNumber:
        log.blockNumber ?? 0n,
    }));

  const combined = [
    ...sent,
    ...received,
  ];

  const unique = new Map<
    string,
    ActivityItem
  >();

  for (const item of combined) {
    const key =
      `${item.hash}-${item.type}-${item.from}-${item.to}`;

    unique.set(key, item);
  }

  return Array.from(
    unique.values()
  )
    .sort((a, b) =>
      a.blockNumber > b.blockNumber
        ? -1
        : a.blockNumber < b.blockNumber
        ? 1
        : 0
    )
    .slice(0, 50);
}

function formatUSDC(
  value: bigint
): string {
  const divisor =
    10n ** BigInt(USDC_DECIMALS);

  const whole =
    value / divisor;

  const fraction =
    value % divisor;

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionString =
    fraction
      .toString()
      .padStart(
        USDC_DECIMALS,
        "0"
      )
      .replace(/0+$/, "");

  return `${whole}.${fractionString}`;
}

export function explorerTxUrl(
  hash: string
): string {
  return `${EXPLORER_URL}/tx/${hash}`;
}
