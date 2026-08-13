import {
  decodeEventLog,
  decodeFunctionData,
  getAddress,
  parseUnits,
  type PublicClient,
} from "viem";
import { erc20Abi } from "./erc20";
import { PERMIT2_ADDRESS, USDC_ADDRESS, USDC_DECIMALS } from "./config";
import { permit2Abi } from "./permit2";
import type { Invoice } from "@/types/invoice";

export interface VerifiedPayment {
  txHash: string;
  from: string;
  blockNumber: bigint;
}

function expected(invoice: Invoice) {
  return {
    recipient: getAddress(invoice.recipient),
    value: parseUnits(invoice.amount, USDC_DECIMALS),
    nonce: BigInt(invoice.nonce),
  };
}

function isPermit2PaymentTx(
  input: `0x${string}`,
  txTo: string | null | undefined,
  invoice: Invoice
): string | null {
  if (!txTo) return null;

  if (txTo.toLowerCase() !== PERMIT2_ADDRESS.toLowerCase()) {
    return null;
  }

  try {
    const decoded = decodeFunctionData({
      abi: permit2Abi,
      data: input,
    });

    if (decoded.functionName !== "permitTransferFrom") {
      return null;
    }

    // viem can type decoded.args as possibly undefined.
    if (!decoded.args) {
      return null;
    }

    const args = decoded.args[0];
    const details = decoded.args[1];
    const owner = decoded.args[2];

    if (!args || !details || !owner) {
      return null;
    }

    const { recipient, value, nonce } = expected(invoice);

    // Verify the token being transferred.
    if (
      getAddress(args.permitted.token) !==
      getAddress(USDC_ADDRESS)
    ) {
      return null;
    }

    // Verify the maximum permitted amount.
    if (args.permitted.amount !== value) {
      return null;
    }

    // Verify this exact invoice nonce.
    if (BigInt(args.nonce) !== nonce) {
      return null;
    }

    // Verify the recipient.
    if (getAddress(details.to) !== recipient) {
      return null;
    }

    // Verify the actual requested amount.
    if (BigInt(details.requestedAmount) !== value) {
      return null;
    }

    // The payer cannot be the recipient.
    if (getAddress(owner) === recipient) {
      return null;
    }

    return getAddress(owner);
  } catch {
    return null;
  }
}

export async function verifyPaymentTx(
  client: PublicClient,
  invoice: Invoice,
  txHash: `0x${string}`
): Promise<VerifiedPayment | null> {
  // Only verify payments on the invoice's chain.
  if (invoice.chainId !== client.chain?.id) {
    return null;
  }

  try {
    const receipt = await client.getTransactionReceipt({
      hash: txHash,
    });

    if (!receipt || receipt.status !== "success") {
      return null;
    }

    const { recipient, value } = expected(invoice);

    for (const log of receipt.logs) {
      if (
        log.address.toLowerCase() !==
        USDC_ADDRESS.toLowerCase()
      ) {
        continue;
      }

      try {
        const decoded = decodeEventLog({
          abi: erc20Abi,
          data: log.data,
          topics: log.topics,
          eventName: "Transfer",
        });

        if (
          getAddress(decoded.args.to) !== recipient ||
          decoded.args.value !== value
        ) {
          continue;
        }

        const tx = await client.getTransaction({
          hash: txHash,
        });

        const owner = isPermit2PaymentTx(
          tx.input,
          tx.to,
          invoice
        );

        if (!owner) {
          continue;
        }

        if (
          owner !==
          getAddress(decoded.args.from)
        ) {
          continue;
        }

        return {
          txHash,
          from: owner,
          blockNumber: receipt.blockNumber,
        };
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Finds an invoice-specific Permit2 settlement.
 *
 * Ordinary ERC-20 transfers are deliberately ignored.
 * Only a successful Permit2 payment containing this
 * invoice's unique nonce can mark the invoice as paid.
 */
export async function findMatchingPayment(
  client: PublicClient,
  invoice: Invoice
): Promise<VerifiedPayment | null> {
  // Never scan another chain.
  if (invoice.chainId !== client.chain?.id) {
    return null;
  }

  try {
    const { recipient, value } = expected(invoice);

    const logs = await client.getLogs({
      address: USDC_ADDRESS,
      event: {
        type: "event",
        name: "Transfer",
        inputs: [
          {
            name: "from",
            type: "address",
            indexed: true,
          },
          {
            name: "to",
            type: "address",
            indexed: true,
          },
          {
            name: "value",
            type: "uint256",
            indexed: false,
          },
        ],
      },
      args: {
        to: recipient,
      },
      fromBlock: BigInt(invoice.fromBlock),
      toBlock: "latest",
    });

    for (const log of logs) {
      if (
        log.args.value !== value ||
        !log.transactionHash
      ) {
        continue;
      }

      const tx = await client.getTransaction({
        hash: log.transactionHash,
      });

      const owner = isPermit2PaymentTx(
        tx.input,
        tx.to,
        invoice
      );

      if (!owner) {
        continue;
      }

      if (
        owner !==
        getAddress(log.args.from as string)
      ) {
        continue;
      }

      const receipt =
        await client.getTransactionReceipt({
          hash: log.transactionHash,
        });

      if (
        !receipt ||
        receipt.status !== "success"
      ) {
        continue;
      }

      return {
        txHash: log.transactionHash,
        from: owner,
        blockNumber: log.blockNumber,
      };
    }

    return null;
  } catch {
    return null;
  }
}
