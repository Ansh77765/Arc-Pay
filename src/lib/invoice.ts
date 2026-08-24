import {
  isAddress,
  keccak256,
  stringToBytes,
} from "viem";

import type { Invoice } from "@/types/invoice";

/* ============================================================
   INVOICE ID
   ============================================================ */

export function generateInvoiceId(): string {
  const bytes = new Uint8Array(6);

  crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (b) =>
      b.toString(16).padStart(2, "0")
  ).join("");
}

/* ============================================================
   INVOICE NONCE
   ============================================================ */

export function generateInvoiceNonce(
  id: string
): `0x${string}` {
  return keccak256(
    stringToBytes(
      `arc-pay:${id}:${crypto.randomUUID()}`
    )
  );
}

/* ============================================================
   BASE64URL
   ============================================================ */

function bytesToBase64Url(
  bytes: Uint8Array
): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 = btoa(binary);

  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(
  value: string
): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    base64 +
    "=".repeat(
      (4 - (base64.length % 4)) % 4
    );

  const binary = atob(padded);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }

  return bytes;
}

/* ============================================================
   ENCODE
   ============================================================ */

export function encodeInvoice(
  invoice: Invoice
): string {
  const bytes =
    new TextEncoder().encode(
      JSON.stringify(invoice)
    );

  return bytesToBase64Url(bytes);
}

/* ============================================================
   AMOUNT VALIDATION
   ============================================================ */

function isValidAmount(
  amount: unknown
): amount is string {
  if (
    typeof amount !== "string"
  ) {
    return false;
  }

  const value =
    amount.trim();

  if (!value) {
    return false;
  }

  /*
   * Positive decimal amount.
   *
   * Examples accepted:
   * 1
   * 1.5
   * 20.00
   * 0.5
   *
   * Examples rejected:
   * -1
   * 1e5
   * NaN
   * Infinity
   * 0
   */

  if (
    !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(
      value
    )
  ) {
    return false;
  }

  return Number(value) > 0;
}

/* ============================================================
   DECODE
   ============================================================ */

export function decodeInvoice(
  token: string
): Invoice | null {
  try {
    if (
      typeof token !== "string" ||
      !token
    ) {
      return null;
    }

    const bytes =
      base64UrlToBytes(token);

    const parsed =
      JSON.parse(
        new TextDecoder().decode(
          bytes
        )
      );

    /* --------------------------------------------------------
       BASIC FIELDS
       -------------------------------------------------------- */

    if (
      parsed?.version !== 2 ||
      typeof parsed?.id !== "string" ||
      parsed.id.length === 0 ||
      parsed.id.length > 128
    ) {
      return null;
    }

    /* --------------------------------------------------------
       RECIPIENT
       -------------------------------------------------------- */

    if (
      typeof parsed?.recipient !==
        "string" ||
      !isAddress(
        parsed.recipient
      )
    ) {
      return null;
    }

    /* --------------------------------------------------------
       AMOUNT
       -------------------------------------------------------- */

    if (
      !isValidAmount(
        parsed?.amount
      )
    ) {
      return null;
    }

    /* --------------------------------------------------------
       DESCRIPTION
       -------------------------------------------------------- */

    if (
      typeof parsed?.description !==
        "string" ||
      parsed.description.length >
        500
    ) {
      return null;
    }

    /* --------------------------------------------------------
       CREATED AT
       -------------------------------------------------------- */

    if (
      typeof parsed?.createdAt !==
        "number" ||
      !Number.isFinite(
        parsed.createdAt
      ) ||
      parsed.createdAt <= 0
    ) {
      return null;
    }

    /* --------------------------------------------------------
       CHAIN
       -------------------------------------------------------- */

    if (
      typeof parsed?.chainId !==
        "number" ||
      !Number.isSafeInteger(
        parsed.chainId
      ) ||
      parsed.chainId <= 0
    ) {
      return null;
    }

    /* --------------------------------------------------------
       START BLOCK
       -------------------------------------------------------- */

    if (
      typeof parsed?.fromBlock !==
        "number" ||
      !Number.isSafeInteger(
        parsed.fromBlock
      ) ||
      parsed.fromBlock < 0
    ) {
      return null;
    }

    /* --------------------------------------------------------
       NONCE
       -------------------------------------------------------- */

    if (
      typeof parsed?.nonce !==
        "string" ||
      !/^0x[0-9a-fA-F]{64}$/.test(
        parsed.nonce
      )
    ) {
      return null;
    }

    /* --------------------------------------------------------
       SIGNATURE
       -------------------------------------------------------- */

    if (
      typeof parsed?.signature !==
        "string" ||
      !/^0x[0-9a-fA-F]+$/.test(
        parsed.signature
      )
    ) {
      return null;
    }

    /* --------------------------------------------------------
       RETURN VALIDATED INVOICE
       -------------------------------------------------------- */

    return {
      id: parsed.id,
      recipient: parsed.recipient,
      amount: parsed.amount,
      description:
        parsed.description,
      createdAt:
        parsed.createdAt,
      chainId:
        parsed.chainId,
      fromBlock:
        parsed.fromBlock,
      nonce: parsed.nonce,
      version: 2,
      signature:
        parsed.signature,
    } as Invoice;

  } catch {
    return null;
  }
}
