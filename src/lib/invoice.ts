import { isAddress, keccak256, stringToBytes } from "viem";
import type { Invoice } from "@/types/invoice";

export function generateInvoiceId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateInvoiceNonce(id: string): `0x${string}` {
  return keccak256(stringToBytes(`arc-pay:${id}:${crypto.randomUUID()}`));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeInvoice(invoice: Invoice): string {
  const bytes = new TextEncoder().encode(JSON.stringify(invoice));
  return bytesToBase64Url(bytes);
}

export function decodeInvoice(token: string): Invoice | null {
  try {
    const bytes = base64UrlToBytes(token);
    const parsed = JSON.parse(new TextDecoder().decode(bytes));

    if (
      parsed?.version !== 2 ||
      typeof parsed?.id !== "string" ||
      typeof parsed?.recipient !== "string" ||
      !isAddress(parsed.recipient) ||
      typeof parsed?.amount !== "string" ||
      typeof parsed?.description !== "string" ||
      typeof parsed?.createdAt !== "number" ||
      !Number.isFinite(parsed.createdAt) ||
      typeof parsed?.chainId !== "number" ||
      typeof parsed?.fromBlock !== "number" ||
      !Number.isSafeInteger(parsed.fromBlock) ||
      typeof parsed?.nonce !== "string" ||
      !/^0x[0-9a-fA-F]{64}$/.test(parsed.nonce) ||
      typeof parsed?.signature !== "string" ||
      !/^0x[0-9a-fA-F]*$/.test(parsed.signature)
    ) {
      return null;
    }

    return parsed as Invoice;
  } catch {
    return null;
  }
}
