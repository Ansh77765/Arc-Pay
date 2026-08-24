export const usernameRegistryAbi = [
  {
    type: "function",
    name: "isUsernameAvailable",
    stateMutability: "view",
    inputs: [
      {
        name: "username",
        type: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
  {
    type: "function",
    name: "registerUsername",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "username",
        type: "string",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "usernameOf",
    stateMutability: "view",
    inputs: [
      {
        name: "owner",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "username",
        type: "string",
      },
    ],
  },
  {
    type: "function",
    name: "resolve",
    stateMutability: "view",
    inputs: [
      {
        name: "username",
        type: "string",
      },
    ],
    outputs: [
      {
        name: "owner",
        type: "address",
      },
    ],
  },
] as const;
