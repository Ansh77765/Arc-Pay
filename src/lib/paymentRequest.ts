import { verifyTypedData, type Address, type Hex } from "viem";
import { APP_NAME } from "./config";
import type { Invoice } from "@/types/invoice";

export const invoiceDomain = (chainId: number) => ({
  name: APP_NAME,
  version: "2",
  chainId,
});

export const invoiceTypes = {
  PaymentRequest: [
    { name: "id", type: "string" },
    { name: "recipient", type: "address" },
    { name: "amount", type: "string" },
    { name: "description", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

export function invoiceMessage(invoice: Invoice) {
  return {
    id: invoice.id,
    recipient: invoice.recipient as Address,
    amount: invoice.amount,
    description: invoice.description,
    chainId: BigInt(invoice.chainId),
    nonce: invoice.nonce,
  } as const;
}

export async function verifyInvoiceSignature(invoice: Invoice): Promise<boolean> {
  if (!invoice.signature) return false;
  return verifyTypedData({
    address: invoice.recipient as Address,
    domain: invoiceDomain(invoice.chainId),
    types: invoiceTypes,
    primaryType: "PaymentRequest",
    message: invoiceMessage(invoice),
    signature: invoice.signature as Hex,
  });
}
