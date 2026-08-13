# Arc Pay

A non-custodial USDC payment-link app for Arc Testnet.

## What changed in v2

Arc Pay no longer decides that an invoice is paid by matching only `recipient + amount` in the USDC Transfer logs.

Each payment request now has:

- a unique 32-byte invoice nonce
- an EIP-712 signature from the recipient proving the request was created by that wallet
- a Permit2 settlement flow where the same nonce is consumed on-chain

Payment verification therefore requires all of these to line up:

1. Arc Testnet chain ID
2. Arc USDC interface
3. requested recipient
4. exact requested amount
5. successful transaction
6. Permit2 contract as the transaction target
7. invoice nonce in the Permit2 authorization
8. payer/owner matching the emitted USDC transfer

A random USDC transfer to the same wallet for the same amount cannot satisfy an invoice anymore.

## Arc Testnet

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- USDC ERC-20 interface: `0x3600000000000000000000000000000000000000`
- USDC decimals: `6`
- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`

Arc uses USDC as the native gas asset while exposing the same balance through the 6-decimal ERC-20 interface. Permit2 is deployed at its canonical address on Arc Testnet and is used by Circle's own Arc/StableFX flows. The app therefore does not deploy or custody a token contract.

## Wallets

This build intentionally uses **browser-injected EVM wallets only**. There is no email/password login and no WalletConnect dependency.

## Payment flow

### Recipient

1. Connect an injected wallet.
2. Enter amount and description.
3. The app creates a random invoice nonce.
4. The recipient signs the payment request with EIP-712.
5. The signed request is encoded into the shareable URL.

### Payer

1. Open the signed payment link.
2. The app verifies the recipient signature before showing the payment action.
3. If required, the payer approves USDC to Permit2 once.
4. The payer signs a Permit2 EIP-712 authorization containing the invoice nonce.
5. Permit2 executes the USDC transfer to the recipient.
6. Arc Pay verifies the successful receipt, USDC Transfer event, Permit2 calldata, recipient, amount, owner, and invoice nonce.

## Security model

The shareable URL is transport, not trust. The recipient's EIP-712 signature authenticates the request, and Permit2's nonce makes settlement invoice-specific.

Arc Pay never receives private keys, never holds funds, and has no backend/database dependency.

## Environment

Copy `.env.example` to `.env.local` and adjust only if Arc publishes a configuration change.

```env
NEXT_PUBLIC_CHAIN_ID=5042002
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_WS_RPC_URL=wss://rpc.testnet.arc.network
NEXT_PUBLIC_EXPLORER_URL=https://testnet.arcscan.app
NEXT_PUBLIC_FAUCET_URL=https://faucet.circle.com
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_USDC_DECIMALS=6
NEXT_PUBLIC_PERMIT2_ADDRESS=0x000000000022D473030F116dDEE9F6B43aC78BA3
NEXT_PUBLIC_APP_NAME=Arc Pay
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Run

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm start
```

## Important

This project is configured for **Arc Testnet**. Do not treat testnet funds as real funds, and verify current Arc/Permit2 deployment information before moving the application to another network.
