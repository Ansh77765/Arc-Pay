import type { Address, Hex } from "viem";

export const permit2Abi = [
  {
    type: "function",
    name: "permitTransferFrom",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "permit",
        type: "tuple",
        components: [
          {
            name: "permitted",
            type: "tuple",
            components: [
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
            ],
          },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      {
        name: "transferDetails",
        type: "tuple",
        components: [
          { name: "to", type: "address" },
          { name: "requestedAmount", type: "uint256" },
        ],
      },
      { name: "owner", type: "address" },
      { name: "signature", type: "bytes" },
    ],
  },
] as const;

export const permit2Domain = (chainId: number, verifyingContract: Address) => ({
  name: "Permit2",
  chainId,
  verifyingContract,
});

export const permit2Types = {
  PermitTransferFrom: [
    { name: "permitted", type: "TokenPermissions" },
    { name: "spender", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
  TokenPermissions: [
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
  ],
} as const;

export interface PermitTransferPayload {
  token: Address;
  amount: bigint;
  nonce: bigint;
  deadline: bigint;
  spender: Address;
  owner: Address;
  signature: Hex;
}
