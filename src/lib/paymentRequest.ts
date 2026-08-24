import {
  getAddress,
  verifyTypedData,
  type Address,
  type Hex,
} from "viem";

import { APP_NAME } from "./config";
import type { Invoice } from "@/types/invoice";

/* ============================================================
   EIP-712 DOMAIN
   ============================================================ */

export const invoiceDomain = (
  chainId: number
) => ({
  name: APP_NAME,
  version: "2",
  chainId,
});

/* ============================================================
   EIP-712 TYPES
   ============================================================ */

export const invoiceTypes = {
  PaymentRequest: [
    {
      name: "id",
      type: "string",
    },
    {
      name: "recipient",
      type: "address",
    },
    {
      name: "amount",
      type: "string",
    },
    {
      name: "description",
      type: "string",
    },
    {
      name: "chainId",
      type: "uint256",
    },
    {
      name: "nonce",
      type: "bytes32",
    },
  ],
} as const;

/* ============================================================
   MESSAGE
   ============================================================ */

export function invoiceMessage(
  invoice: Invoice
) {
  return {
    id: invoice.id,

    recipient:
      getAddress(
        invoice.recipient
      ) as Address,

    amount: invoice.amount,

    description:
      invoice.description,

    chainId:
      BigInt(
        invoice.chainId
      ),

    nonce:
      invoice.nonce,
  } as const;
}

/* ============================================================
   VERIFY INVOICE
   ============================================================ */

export async function verifyInvoiceSignature(
  invoice: Invoice
): Promise<boolean> {
  try {
    /* --------------------------------------------------------
       Basic validation
       -------------------------------------------------------- */

    if (!invoice.signature) {
      return false;
    }

    if (!invoice.id) {
      return false;
    }

    if (!invoice.recipient) {
      return false;
    }

    if (!invoice.amount) {
      return false;
    }

    if (!invoice.description) {
      return false;
    }

    if (!invoice.nonce) {
      return false;
    }

    /* --------------------------------------------------------
       Validate recipient address
       -------------------------------------------------------- */

    const recipient =
      getAddress(
        invoice.recipient
      );

    /* --------------------------------------------------------
       Validate chain ID
       -------------------------------------------------------- */

    if (
      !Number.isSafeInteger(
        invoice.chainId
      ) ||
      invoice.chainId <= 0
    ) {
      return false;
    }

    /* --------------------------------------------------------
       Validate amount
       -------------------------------------------------------- */

    const amount =
      invoice.amount.trim();

    if (!amount) {
      return false;
    }

    /*
     * Amount must be a positive decimal.
     */

    if (
      !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(
        amount
      )
    ) {
      return false;
    }

    if (
      Number(amount) <= 0
    ) {
      return false;
    }

    /* --------------------------------------------------------
       Validate nonce
       -------------------------------------------------------- */

    if (
      !/^0x[a-fA-F0-9]{64}$/.test(
        invoice.nonce
      )
    ) {
      return false;
    }

    /* --------------------------------------------------------
       Verify EIP-712 signature
       -------------------------------------------------------- */

    return await verifyTypedData({
      address: recipient,

      domain:
        invoiceDomain(
          invoice.chainId
        ),

      types:
        invoiceTypes,

      primaryType:
        "PaymentRequest",

      message:
        invoiceMessage({
          ...invoice,
          recipient,
        }),

      signature:
        invoice.signature as Hex,
    });

  } catch {
    /*
     * Any malformed invoice,
     * invalid address,
     * invalid signature,
     * or invalid typed-data payload
     * is simply rejected.
     */

    return false;
  }
}
