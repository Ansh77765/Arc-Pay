import { parseUnits } from "viem";
import { USDC_DECIMALS } from "./config";

export function shortAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function shortHash(hash: string): string {
  return shortAddress(hash, 6);
}

export function formatUsdc(amount: string | number): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: USDC_DECIMALS,
  });
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isValidAmount(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return false;
  const fraction = trimmed.split(".")[1] ?? "";
  if (fraction.length > USDC_DECIMALS) return false;
  try {
    return parseUnits(trimmed, USDC_DECIMALS) > 0n;
  } catch {
    return false;
  }
}
