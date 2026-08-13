/**
 * A payment request encoded into the shareable URL.
 *
 * `nonce` is a 32-byte payment intent identifier. When a payer settles through
 * Permit2, this nonce becomes part of the on-chain authorization, so a payment
 * can be matched to one invoice without a backend or custom payment contract.
 */
export interface Invoice {
  id: string;
  recipient: string;
  amount: string;
  description: string;
  createdAt: number;
  chainId: number;
  fromBlock: number;
  nonce: `0x${string}`;
  version: 2;
  /** EIP-712 signature proving the recipient created this request. */
  signature: `0x${string}`;
}
