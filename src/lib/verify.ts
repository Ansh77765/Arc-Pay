import {
  decodeEventLog,
  decodeFunctionData,
  getAddress,
  parseUnits,
  type PublicClient,
} from "viem";

import { erc20Abi } from "./erc20";

import {
  PERMIT2_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "./config";

import { permit2Abi } from "./permit2";

import type { Invoice } from "@/types/invoice";

export interface VerifiedPayment {
  txHash: string;
  from: string;
  blockNumber: bigint;
}

/* ============================================================
   EXPECTED PAYMENT
   ============================================================ */

function expected(invoice: Invoice) {
  return {
    recipient: getAddress(invoice.recipient),

    value: parseUnits(
      invoice.amount,
      USDC_DECIMALS
    ),

    nonce: BigInt(
      invoice.nonce
    ),
  };
}

/* ============================================================
   VERIFY PERMIT2 CALLDATA
   ============================================================ */

function isPermit2PaymentTx(
  input: `0x${string}`,
  txTo: string | null | undefined,
  invoice: Invoice
): string | null {
  if (!txTo) {
    return null;
  }

  /*
   * The transaction itself must be sent to Permit2.
   */

  if (
    txTo.toLowerCase() !==
    PERMIT2_ADDRESS.toLowerCase()
  ) {
    return null;
  }

  try {
    const decoded =
      decodeFunctionData({
        abi: permit2Abi,
        data: input,
      });

    if (
      decoded.functionName !==
      "permitTransferFrom"
    ) {
      return null;
    }

    if (
      !decoded.args ||
      decoded.args.length < 3
    ) {
      return null;
    }

    const args =
      decoded.args as readonly [
        {
          permitted: {
            token: `0x${string}`;
            amount: bigint;
          };
          nonce: bigint;
          deadline: bigint;
        },
        {
          to: `0x${string}`;
          requestedAmount: bigint;
        },
        `0x${string}`
      ];

    const permit = args[0];
    const details = args[1];
    const owner = args[2];

    if (
      !permit ||
      !details ||
      !owner
    ) {
      return null;
    }

    const {
      recipient,
      value,
      nonce,
    } = expected(invoice);

    /* --------------------------------------------------------
       TOKEN
       -------------------------------------------------------- */

    if (
      getAddress(
        permit.permitted.token
      ) !==
      getAddress(
        USDC_ADDRESS
      )
    ) {
      return null;
    }

    /* --------------------------------------------------------
       EXACT PERMITTED AMOUNT
       -------------------------------------------------------- */

    if (
      permit.permitted.amount !==
      value
    ) {
      return null;
    }

    /* --------------------------------------------------------
       INVOICE-SPECIFIC NONCE
       -------------------------------------------------------- */

    if (
      BigInt(permit.nonce) !==
      nonce
    ) {
      return null;
    }

    /* --------------------------------------------------------
       EXACT RECIPIENT
       -------------------------------------------------------- */

    if (
      getAddress(details.to) !==
      recipient
    ) {
      return null;
    }

    /* --------------------------------------------------------
       EXACT REQUESTED AMOUNT
       -------------------------------------------------------- */

    if (
      BigInt(
        details.requestedAmount
      ) !== value
    ) {
      return null;
    }

    /* --------------------------------------------------------
       OWNER CANNOT PAY THEMSELVES
       -------------------------------------------------------- */

    if (
      getAddress(owner) ===
      recipient
    ) {
      return null;
    }

    return getAddress(owner);
  } catch {
    return null;
  }
}

/* ============================================================
   VERIFY A SPECIFIC TRANSACTION
   ============================================================ */

export async function verifyPaymentTx(
  client: PublicClient,
  invoice: Invoice,
  txHash: `0x${string}`
): Promise<VerifiedPayment | null> {

  /*
   * Never verify an invoice against another chain.
   */

  if (
    invoice.chainId !==
    client.chain?.id
  ) {
    return null;
  }

  try {
    const receipt =
      await client.getTransactionReceipt({
        hash: txHash,
      });

    /*
     * Transaction must have succeeded.
     */

    if (
      !receipt ||
      receipt.status !==
        "success"
    ) {
      return null;
    }

    const {
      recipient,
      value,
    } = expected(invoice);

    /*
     * Inspect USDC Transfer events.
     */

    for (const log of receipt.logs) {

      if (
        log.address.toLowerCase() !==
        USDC_ADDRESS.toLowerCase()
      ) {
        continue;
      }

      try {
        const decoded =
          decodeEventLog({
            abi: erc20Abi,
            data: log.data,
            topics: log.topics,
            eventName: "Transfer",
          });

        /*
         * Transfer must be:
         *
         * correct recipient
         * correct exact amount
         */

        if (
          getAddress(
            decoded.args.to
          ) !== recipient ||
          decoded.args.value !== value
        ) {
          continue;
        }

        /*
         * Load the actual transaction.
         */

        const tx =
          await client.getTransaction({
            hash: txHash,
          });

        /*
         * Transaction must contain
         * the exact Permit2 invoice data.
         */

        const owner =
          isPermit2PaymentTx(
            tx.input,
            tx.to,
            invoice
          );

        if (!owner) {
          continue;
        }

        /*
         * Permit2 owner must equal
         * the actual USDC Transfer sender.
         */

        if (
          owner !==
          getAddress(
            decoded.args.from
          )
        ) {
          continue;
        }

        return {
          txHash,
          from: owner,
          blockNumber:
            receipt.blockNumber,
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

/* ============================================================
   FIND EXISTING PAYMENT
   ============================================================ */

export async function findMatchingPayment(
  client: PublicClient,
  invoice: Invoice
): Promise<VerifiedPayment | null> {

  /*
   * Never scan another chain.
   */

  if (
    invoice.chainId !==
    client.chain?.id
  ) {
    return null;
  }

  try {
    const {
      recipient,
      value,
    } = expected(invoice);

    /*
     * Find USDC transfers to the invoice recipient.
     */

    const logs =
      await client.getLogs({
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

        fromBlock:
          BigInt(
            invoice.fromBlock
          ),

        toBlock: "latest",
      });

    for (const log of logs) {

      /*
       * Exact payment amount.
       */

      if (
        log.args.value !== value ||
        !log.transactionHash
      ) {
        continue;
      }

      /*
       * Load the transaction that
       * generated the transfer.
       */

      const tx =
        await client.getTransaction({
          hash: log.transactionHash,
        });

      /*
       * Verify that the transaction
       * contains the exact invoice nonce,
       * recipient, token and amount.
       */

      const owner =
        isPermit2PaymentTx(
          tx.input,
          tx.to,
          invoice
        );

      if (!owner) {
        continue;
      }

      /*
       * Permit2 owner must match
       * the actual Transfer sender.
       */

      if (
        owner !==
        getAddress(
          log.args.from as string
        )
      ) {
        continue;
      }

      /*
       * Confirm the transaction succeeded.
       */

      const receipt =
        await client.getTransactionReceipt({
          hash:
            log.transactionHash,
        });

      if (
        !receipt ||
        receipt.status !==
          "success"
      ) {
        continue;
      }

      return {
        txHash:
          log.transactionHash,

        from: owner,

        blockNumber:
          receipt.blockNumber,
      };
    }

    return null;

  } catch {
    return null;
  }
}
