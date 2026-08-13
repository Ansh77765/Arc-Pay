import { isAddress, type Address } from "viem";

const DEFAULT_USDC_ADDRESS: Address = "0x3600000000000000000000000000000000000000";
const DEFAULT_PERMIT2_ADDRESS: Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

function resolveAddress(value: string | undefined, label: string, fallback: Address): Address {
  if (!value) return fallback;
  if (!isAddress(value)) {
    throw new Error(`${label} is not a valid address.`);
  }
  return value as Address;
}

export const USDC_ADDRESS = resolveAddress(
  process.env.NEXT_PUBLIC_USDC_ADDRESS,
  "NEXT_PUBLIC_USDC_ADDRESS",
  DEFAULT_USDC_ADDRESS
);

export const PERMIT2_ADDRESS = resolveAddress(
  process.env.NEXT_PUBLIC_PERMIT2_ADDRESS,
  "NEXT_PUBLIC_PERMIT2_ADDRESS",
  DEFAULT_PERMIT2_ADDRESS
);

export const USDC_DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS ?? 6);
if (!Number.isInteger(USDC_DECIMALS) || USDC_DECIMALS < 0 || USDC_DECIMALS > 18) {
  throw new Error("NEXT_PUBLIC_USDC_DECIMALS must be an integer between 0 and 18.");
}

export const EXPLORER_URL = (
  process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://testnet.arcscan.app"
).replace(/\/$/, "");

export const FAUCET_URL = process.env.NEXT_PUBLIC_FAUCET_URL ?? "https://faucet.circle.com";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Arc Pay";
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}
