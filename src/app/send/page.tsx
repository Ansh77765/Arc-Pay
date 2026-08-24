"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Info,
  Loader2,
  Wallet,
  X,
} from "lucide-react";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import {
  isAddress,
  parseUnits,
  zeroAddress,
} from "viem";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";

import { arcTestnet } from "@/lib/chain";

import {
  USDC_ADDRESS,
  USDC_DECIMALS,
  USERNAME_REGISTRY_ADDRESS,
} from "@/lib/config";

import { usernameRegistryAbi } from "@/lib/usernameRegistryAbi";

import {
  isValidAmount,
  shortAddress,
} from "@/lib/format";

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
] as const;

type RecipientType =
  | "empty"
  | "address"
  | "username"
  | "invalid";

export default function SendPage() {
  const {
    address,
    isConnected,
    chainId,
  } = useAccount();

  const [recipient, setRecipient] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const {
    writeContract,
    data: transactionHash,
    isPending: isSending,
    error: transactionError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: transactionSuccess,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  /*
   * ============================================================
   * USDC BALANCE
   * ============================================================
   */

  const {
    data: balance,
    isLoading: loadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address
      ? [address]
      : undefined,
    query: {
      enabled:
        isConnected &&
        !!address,
    },
  });

  /*
   * ============================================================
   * RECIPIENT
   * ============================================================
   */

  const normalizedRecipient =
    recipient.trim();

  const recipientType: RecipientType =
    !normalizedRecipient
      ? "empty"
      : isAddress(normalizedRecipient)
      ? "address"
      : normalizedRecipient.startsWith("@") &&
        /^[a-z0-9]{3,20}$/.test(
          normalizedRecipient.slice(1)
        )
      ? "username"
      : "invalid";

  const username =
    recipientType === "username"
      ? normalizedRecipient
          .slice(1)
          .toLowerCase()
      : "";

  /*
   * ============================================================
   * RESOLVE @USERNAME
   * ============================================================
   */

  const {
    data: resolvedAddress,
    isLoading: resolvingUsername,
    isError: usernameResolveError,
  } = useReadContract({
    address: USERNAME_REGISTRY_ADDRESS,
    abi: usernameRegistryAbi,
    functionName: "resolve",
    args: [username],
    query: {
      enabled:
        recipientType === "username" &&
        username.length >= 3,
    },
  });

  /*
   * ============================================================
   * FINAL RECIPIENT
   * ============================================================
   */

  const recipientAddress =
    recipientType === "address"
      ? normalizedRecipient
      : recipientType === "username" &&
        resolvedAddress &&
        resolvedAddress !== zeroAddress
      ? resolvedAddress
      : "";

  /*
   * ============================================================
   * AMOUNT
   * ============================================================
   */

  const amountValue = useMemo(() => {
    if (!amount.trim()) {
      return null;
    }

    try {
      return parseUnits(
        amount.trim(),
        USDC_DECIMALS
      );
    } catch {
      return null;
    }
  }, [amount]);

  const insufficientBalance =
    amountValue !== null &&
    balance !== undefined &&
    amountValue > balance;

  /*
   * ============================================================
   * BALANCE DISPLAY
   * ============================================================
   */

  const formattedBalance =
    balance !== undefined
      ? Number(balance) /
        10 ** USDC_DECIMALS
      : null;

  /*
   * ============================================================
   * VALIDATION
   * ============================================================
   */

  const recipientReady =
    recipientType === "address" ||
    (recipientType === "username" &&
      !!resolvedAddress &&
      resolvedAddress !== zeroAddress &&
      !usernameResolveError);

  const amountReady =
    amountValue !== null &&
    amountValue > 0n;

  const networkReady =
    chainId === arcTestnet.id;

  const canContinue =
    isConnected &&
    networkReady &&
    recipientReady &&
    amountReady &&
    !insufficientBalance &&
    !isSending &&
    !isConfirming;

  /*
   * ============================================================
   * CONTINUE
   * ============================================================
   */

  function handleContinue() {
    setError(null);

    if (!isConnected || !address) {
      setError(
        "Connect your wallet first."
      );
      return;
    }

    if (chainId !== arcTestnet.id) {
      setError(
        "Switch your wallet to Arc Testnet."
      );
      return;
    }

    if (recipientType === "empty") {
      setError(
        "Enter a wallet address or @username."
      );
      return;
    }

    if (recipientType === "invalid") {
      setError(
        "Enter a valid wallet address or @username."
      );
      return;
    }

    if (recipientType === "username") {
      if (resolvingUsername) {
        setError(
          "Still checking the username. Please wait."
        );
        return;
      }

      if (
        usernameResolveError ||
        !resolvedAddress ||
        resolvedAddress === zeroAddress
      ) {
        setError(
          `@${username} is not registered.`
        );
        return;
      }
    }

    if (!isValidAmount(amount)) {
      setError(
        "Enter a valid USDC amount."
      );
      return;
    }

    if (
      amountValue === null ||
      amountValue <= 0n
    ) {
      setError(
        "Enter a valid USDC amount."
      );
      return;
    }

    if (insufficientBalance) {
      setError(
        "Insufficient USDC balance."
      );
      return;
    }

    if (
      recipientAddress &&
      recipientAddress.toLowerCase() ===
        address.toLowerCase()
    ) {
      setError(
        "You cannot send USDC to yourself."
      );
      return;
    }

    setShowConfirmation(true);
  }

  /*
   * ============================================================
   * SEND USDC
   * ============================================================
   */

  function handleSend() {
    setError(null);

    if (!recipientAddress) {
      setError(
        "Recipient address could not be resolved."
      );
      return;
    }

    if (
      amountValue === null ||
      amountValue <= 0n
    ) {
      setError(
        "Enter a valid amount."
      );
      return;
    }

    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "transfer",
      args: [
        recipientAddress as `0x${string}`,
        amountValue,
      ],
    });
  }

  /*
   * ============================================================
   * MAX
   * ============================================================
   */

  function handleMax() {
    if (
      balance === undefined ||
      balance === 0n
    ) {
      return;
    }

    const value =
      Number(balance) /
      10 ** USDC_DECIMALS;

    setAmount(
      value.toString()
    );

    setError(null);
  }

  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  function resetForm() {
    setRecipient("");
    setAmount("");
    setError(null);
    setShowConfirmation(false);
  }

  /*
   * ============================================================
   * TRANSACTION SUCCESS
   * ============================================================
   */

  const transactionComplete =
    transactionSuccess &&
    !!transactionHash;

  return (
    <div className="min-h-screen bg-white text-[#111111]">

      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="px-6 pb-16 pt-8 sm:px-10 lg:px-12">

            {/* HEADER */}

            <div className="mb-10">

              <p className="text-[12px] font-medium text-[#85868E]">
                Payments
              </p>

              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
                Send USDC
              </h1>

              <p className="mt-2 text-[13px] text-[#85868E]">
                Send USDC to a wallet or Arc Pay username.
              </p>

            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,650px)_330px]">

              {/* SEND CARD */}

              <section className="rounded-[22px] border border-[#E7E7EA] bg-white">

                <div className="border-b border-[#EEEEF1] px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F6]">

                      <ArrowUpRight
                        size={19}
                        strokeWidth={1.7}
                      />

                    </div>

                    <div>

                      <h2 className="text-[15px] font-semibold">
                        Payment details
                      </h2>

                      <p className="mt-1 text-[11px] text-[#92939B]">
                        Enter the recipient and amount.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="space-y-7 p-6">

                  {/* RECIPIENT */}

                  <div>

                    <div className="mb-2.5 flex items-center justify-between">

                      <label className="text-[12px] font-medium text-[#33343A]">
                        Recipient
                      </label>

                      <span className="text-[10px] text-[#A0A1A8]">
                        Address or @username
                      </span>

                    </div>

                    <div
                      className={`flex h-[54px] items-center rounded-[14px] border bg-white px-4 transition ${
                        recipientType === "invalid"
                          ? "border-[#E7CACA]"
                          : recipientType === "username" &&
                            resolvedAddress &&
                            resolvedAddress !== zeroAddress
                          ? "border-[#CDE6D7]"
                          : "border-[#E2E2E6]"
                      }`}
                    >

                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => {
                          setRecipient(
                            e.target.value
                          );
                          setError(null);
                          setShowConfirmation(false);
                        }}
                        placeholder="0x... or @username"
                        autoComplete="off"
                        spellCheck={false}
                        className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-[#222329] outline-none placeholder:text-[#B2B3BA]"
                      />

                      {resolvingUsername && (
                        <Loader2
                          size={16}
                          className="animate-spin text-[#999AA2]"
                        />
                      )}

                      {!resolvingUsername &&
                        recipientType === "username" &&
                        resolvedAddress &&
                        resolvedAddress !== zeroAddress && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7EF] text-[#31A66A]">
                            <Check size={14} />
                          </div>
                        )}

                    </div>

                    {recipientType === "username" &&
                      resolvingUsername && (
                        <p className="mt-2 text-[9px] text-[#999AA2]">
                          Resolving @{username}…
                        </p>
                      )}

                    {recipientType === "username" &&
                      !resolvingUsername &&
                      resolvedAddress &&
                      resolvedAddress !== zeroAddress && (
                        <p className="mt-2 text-[9px] font-medium text-[#31A66A]">
                          @{username} resolves to{" "}
                          {shortAddress(
                            resolvedAddress
                          )}
                        </p>
                      )}

                    {recipientType === "username" &&
                      !resolvingUsername &&
                      (!resolvedAddress ||
                        resolvedAddress === zeroAddress) && (
                        <p className="mt-2 text-[9px] text-[#D65A5A]">
                          @{username} is not registered.
                        </p>
                      )}

                    {recipientType === "invalid" && (
                      <p className="mt-2 text-[9px] text-[#D65A5A]">
                        Enter a valid 0x address or @username.
                      </p>
                    )}

                  </div>

                  {/* AMOUNT */}

                  <div>

                    <div className="mb-2.5 flex items-center justify-between">

                      <label className="text-[12px] font-medium text-[#33343A]">
                        Amount
                      </label>

                      <button
                        type="button"
                        onClick={handleMax}
                        disabled={
                          balance === undefined ||
                          balance === 0n
                        }
                        className="text-[10px] font-medium text-[#777880] disabled:opacity-40"
                      >
                        Max
                      </button>

                    </div>

                    <div className="flex h-[70px] items-center rounded-[14px] border border-[#E2E2E6] bg-white px-4">

                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                          setAmount(
                            e.target.value
                          );
                          setError(null);
                          setShowConfirmation(false);
                        }}
                        className="min-w-0 flex-1 bg-transparent text-[28px] font-semibold tracking-[-0.04em] text-[#111111] outline-none placeholder:text-[#B8B9BE]"
                      />

                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-full bg-[#F5F5F6] px-3.5 py-2 text-[11px] font-semibold"
                      >

                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-bold">
                          $
                        </span>

                        USDC

                        <ChevronDown
                          size={13}
                          className="text-[#85868E]"
                        />

                      </button>

                    </div>

                    <div className="mt-2 flex justify-between text-[10px] text-[#9A9BA2]">

                      <span>
                        Available balance
                      </span>

                      <span>
                        {loadingBalance
                          ? "Loading…"
                          : formattedBalance !== null
                          ? `${formattedBalance.toFixed(
                              2
                            )} USDC`
                          : "— USDC"}
                      </span>

                    </div>

                    {insufficientBalance && (
                      <p className="mt-2 text-[9px] font-medium text-[#D65A5A]">
                        Insufficient USDC balance.
                      </p>
                    )}

                  </div>

                  {/* NETWORK */}

                  <div>

                    <label className="mb-2.5 block text-[12px] font-medium text-[#33343A]">
                      Network
                    </label>

                    <div className="flex h-[58px] items-center justify-between rounded-[14px] border border-[#E2E2E6] px-4">

                      <div className="flex items-center gap-3">

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F6]">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#31A66A]" />
                        </span>

                        <div>

                          <p className="text-[12px] font-medium">
                            Arc Testnet
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#96979F]">
                            USDC network
                          </p>

                        </div>

                      </div>

                      <span
                        className={`text-[10px] font-medium ${
                          networkReady
                            ? "text-[#31A66A]"
                            : "text-[#D65A5A]"
                        }`}
                      >
                        {networkReady
                          ? "Connected"
                          : "Wrong network"}
                      </span>

                    </div>

                  </div>

                  {/* INFO */}

                  <div className="flex gap-3 rounded-[14px] bg-[#F7F7F8] p-4">

                    <Info
                      size={15}
                      className="mt-0.5 shrink-0 text-[#777880]"
                    />

                    <p className="text-[10px] leading-5 text-[#777880]">
                      Send directly to a wallet address or use an Arc Pay username such as @ansh123.
                    </p>

                  </div>

                  {/* ERROR */}

                  {(error ||
                    transactionError) && (
                    <div className="flex items-start gap-3 rounded-[14px] border border-[#F2D5D5] bg-[#FFF8F8] px-4 py-3.5">

                      <CircleAlert
                        size={16}
                        className="mt-0.5 shrink-0 text-[#D85C5C]"
                      />

                      <p className="text-[9px] leading-5 text-[#B76A6A]">
                        {error ??
                          "Transaction failed or was rejected."}
                      </p>

                    </div>
                  )}

                  {/* CONTINUE */}

                  {!showConfirmation &&
                    !transactionComplete && (
                      <button
                        type="button"
                        onClick={
                          handleContinue
                        }
                        disabled={
                          !canContinue
                        }
                        className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#111111] text-[12px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#EEEEF0] disabled:text-[#A0A1A8]"
                      >
                        Continue
                      </button>
                    )}

                  {/* CONFIRMATION */}

                  {showConfirmation &&
                    !transactionComplete && (
                      <div className="rounded-[18px] border border-[#E7E7EA] bg-[#F8F8F9] p-5">

                        <div className="flex items-start justify-between">

                          <div>

                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#999AA2]">
                              Confirm payment
                            </p>

                            <p className="mt-1 text-[19px] font-semibold tracking-[-0.03em]">
                              {amount} USDC
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmation(
                                false
                              )}
                            disabled={
                              isSending ||
                              isConfirming
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E2E5] bg-white text-[#777880]"
                          >
                            <X size={14} />
                          </button>

                        </div>

                        <div className="mt-4 rounded-[13px] bg-white p-3.5">

                          <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#A0A1A8]">
                            Recipient
                          </p>

                          <p className="mt-1 font-mono text-[11px] font-medium text-[#33343A]">
                            {recipientType ===
                            "username"
                              ? `@${username}`
                              : shortAddress(
                                  recipientAddress
                                )}
                          </p>

                          {recipientType ===
                            "username" && (
                            <p className="mt-1 font-mono text-[8px] text-[#999AA2]">
                              {shortAddress(
                                recipientAddress
                              )}
                            </p>
                          )}

                        </div>

                        <button
                          type="button"
                          onClick={
                            handleSend
                          }
                          disabled={
                            isSending ||
                            isConfirming
                          }
                          className="mt-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#111111] text-[11px] font-semibold text-white disabled:opacity-50"
                        >

                          {isSending ? (
                            <>
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                              Confirm in wallet…
                            </>
                          ) : isConfirming ? (
                            <>
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                              Confirming…
                            </>
                          ) : (
                            <>
                              Send {amount} USDC
                              <ArrowUpRight
                                size={14}
                              />
                            </>
                          )}

                        </button>

                      </div>
                    )}

                  {/* SUCCESS */}

                  {transactionComplete && (
                    <div className="rounded-[18px] border border-[#DDEEE4] bg-[#F6FBF8] p-5 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[#31A66A]">

                        <Check
                          size={22}
                          strokeWidth={2}
                        />

                      </div>

                      <h3 className="mt-4 text-[15px] font-semibold">
                        Payment sent
                      </h3>

                      <p className="mt-1 text-[10px] leading-5 text-[#85868E]">
                        {amount} USDC was sent successfully.
                      </p>

                      <p className="mt-3 break-all font-mono text-[8px] text-[#999AA2]">
                        {transactionHash}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          refetchBalance();
                        }}
                        className="mt-5 h-10 rounded-full bg-[#111111] px-5 text-[10px] font-semibold text-white"
                      >
                        Send another payment
                      </button>

                    </div>
                  )}

                  {!transactionComplete &&
                    !showConfirmation && (
                      <p className="text-center text-[10px] text-[#A0A1A8]">
                        Your wallet will ask you to confirm the transaction.
                      </p>
                    )}

                </div>
              </section>

              {/* RIGHT SIDE */}

              <aside>

                <div className="rounded-[22px] border border-[#E7E7EA] bg-white p-6">

                  <div className="flex h-[110px] items-center justify-center rounded-[16px] bg-[#F7F7F8]">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">

                      <Wallet
                        size={29}
                        strokeWidth={1.4}
                        className="text-[#55565D]"
                      />

                    </div>

                  </div>

                  <h2 className="mt-6 text-[19px] font-semibold tracking-[-0.03em]">
                    Sending USDC
                  </h2>

                  <p className="mt-2 text-[12px] leading-5 text-[#7F8088]">
                    Your payment will be signed by your connected wallet before it is submitted to Arc.
                  </p>

                  <div className="mt-6 space-y-4 border-t border-[#EEEEF1] pt-5">

                    <div className="flex items-center justify-between">

                      <span className="text-[11px] text-[#94959D]">
                        Asset
                      </span>

                      <span className="text-[11px] font-medium">
                        USDC
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-[11px] text-[#94959D]">
                        Network
                      </span>

                      <span className="text-[11px] font-medium">
                        Arc Testnet
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-[11px] text-[#94959D]">
                        Recipient
                      </span>

                      <span className="max-w-[160px] truncate text-right text-[10px] font-medium">
                        {recipient ||
                          "Not selected"}
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-[11px] text-[#94959D]">
                        Custody
                      </span>

                      <span className="text-[11px] font-medium">
                        Non-custodial
                      </span>

                    </div>

                  </div>

                </div>

              </aside>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
