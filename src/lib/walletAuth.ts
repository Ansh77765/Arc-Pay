import type { Address, Hex } from "viem";

type WalletAuthResult = {
  authenticated: boolean;
  address: string;
};

export async function authenticateWallet(
  address: Address,
  signMessageAsync: (args: {
    message: string;
  }) => Promise<Hex>
): Promise<WalletAuthResult> {
  // 1. Get a fresh nonce from our server.
  const nonceResponse =
    await fetch("/api/auth/nonce", {
      method: "GET",
      cache: "no-store",
    });

  const nonceData =
    await nonceResponse.json();

  if (!nonceResponse.ok || !nonceData.nonce) {
    throw new Error(
      "Could not start wallet verification."
    );
  }

  const nonce =
    String(nonceData.nonce);

  // 2. Create a human-readable message.
  const message = [
    "Arc Pay wallet verification",
    "",
    `Wallet: ${address}`,
    `Nonce: ${nonce}`,
    "",
    "Sign this message to verify that you control this wallet.",
    "No blockchain transaction will be made.",
  ].join("\n");

  // 3. Ask the wallet to sign.
  const signature =
    await signMessageAsync({
      message,
    });

  // 4. Send signature to our server.
  const verifyResponse =
    await fetch(
      "/api/auth/verify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          address,
          message,
          signature,
        }),
      }
    );

  const verifyData =
    await verifyResponse.json();

  if (
    !verifyResponse.ok ||
    !verifyData.authenticated
  ) {
    throw new Error(
      verifyData?.error ||
        "Wallet verification failed."
    );
  }

  return {
    authenticated: true,
    address:
      verifyData.address,
  };
}
