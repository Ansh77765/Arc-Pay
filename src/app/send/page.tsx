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
  EXPLORER_URL,
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

  /* ============================================================
     RECIPIENT
     ============================================================ */

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

  const recipientAddress =
    recipientType === "address"
      ? normalizedRecipient
      : recipientType === "username" &&
        resolvedAddress &&
        resolvedAddress !== zeroAddress
      ? resolvedAddress
      : "";

  /* ============================================================
     AMOUNT
     ============================================================ */

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

  const formattedBalance =
    balance !== undefined
      ? Number(balance) /
        10 ** USDC_DECIMALS
      : null;

  /* ============================================================
     VALIDATION
     ============================================================ */

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

  /* ============================================================
     CONTINUE
     ============================================================ */

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

  /* ============================================================
     SEND
     ============================================================ */

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

  /* ============================================================
     MAX
     ============================================================ */

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

  /* ============================================================
     RESET
     ============================================================ */

  function resetForm() {
    setRecipient("");
    setAmount("");
    setError(null);
    setShowConfirmation(false);
  }

  const transactionComplete =
    transactionSuccess &&
    !!transactionHash;

  const displayError =
    error ??
    (transactionError
      ? "Transaction failed or was rejected."
      : null);

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#11131A]">

      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="px-5 pb-16 pt-7 sm:px-8 lg:px-10">

            {/* ==================================================
                HEADER
                ================================================== */}

            <div className="mb-8">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#2563EB]" />

                <p className="text-[11px] font-semibold tracking-wide text-[#747986]">
                  PAYMENTS
                </p>

              </div>

              <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.055em]">
                Send USDC
              </h1>

              <p className="mt-2 text-[13px] text-[#7D838F]">
                Send USDC to a wallet or Arc Pay username.
              </p>

            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,680px)_340px]">

              {/* ==================================================
                  MAIN SEND CARD
                  ================================================== */}

              <section className="arc-card overflow-hidden">

                {/* CARD HEADER */}

                <div className="border-b border-[#EEF0F4] px-6 py-5">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#EAF2FF] text-[#2563EB]">

                        <ArrowUpRight
                          size={19}
                          strokeWidth={1.8}
                        />

                      </div>

                      <div>

                        <h2 className="text-[14px] font-semibold tracking-[-0.02em]">
                          Payment details
                        </h2>

                        <p className="mt-1 text-[10px] text-[#9298A4]">
                          Choose a recipient and amount.
                        </p>

                      </div>

                    </div>

                    <div className="hidden items-center gap-1.5 rounded-full bg-[#F0FDF7] px-2.5 py-1.5 sm:flex">

                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" />

                      <span className="text-[9px] font-semibold text-[#16A36A]">
                        Arc Testnet
                      </span>

                    </div>

                  </div>

                </div>

                <div className="space-y-7 p-6">

                  {/* ==================================================
                      RECIPIENT
                      ================================================== */}

                  <div>

                    <div className="mb-2.5 flex items-center justify-between">

                      <label className="text-[11px] font-semibold text-[#333740]">
                        Recipient
                      </label>

                      <span className="text-[9px] text-[#9AA0AB]">
                        Address or @username
                      </span>

                    </div>

                    <div
                      className={`arc-input flex h-[58px] items-center px-4 ${
                        recipientType === "invalid"
                          ? "!border-[#E7CACA] !shadow-none"
                          : recipientType === "username" &&
                            resolvedAddress &&
                            resolvedAddress !== zeroAddress
                          ? "!border-[#BFE3CF] !shadow-none"
                          : ""
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
                        placeholder="@username or 0x..."
                        autoComplete="off"
                        spellCheck={false}
                        className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-[#22252C] outline-none placeholder:text-[#B0B5BF]"
                      />

                      {resolvingUsername && (
                        <Loader2
                          size={16}
                          className="animate-spin text-[#8D939F]"
                        />
                      )}

                      {!resolvingUsername &&
                        recipientType === "username" &&
                        resolvedAddress &&
                        resolvedAddress !== zeroAddress && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF8F2] text-[#16A36A]">

                            <Check size={14} />

                          </div>
                        )}

                    </div>

                    {recipientType === "username" &&
                      resolvingUsername && (
                        <div className="mt-2 flex items-center gap-1.5 text-[9px] text-[#8D939F]">

                          <Loader2
                            size={10}
                            className="animate-spin"
                          />

                          Resolving @{username}…

                        </div>
                      )}

                    {recipientType === "username" &&
                      !resolvingUsername &&
                      resolvedAddress &&
                      resolvedAddress !== zeroAddress && (
                        <div className="mt-2 flex items-center gap-2">

                          <span className="rounded-full bg-[#EAF8F2] px-2 py-1 text-[8px] font-semibold text-[#16A36A]">
                            Verified
                          </span>

                          <span className="font-mono text-[9px] text-[#7E8490]">
                            @{username} →{" "}
                            {shortAddress(
                              resolvedAddress
                            )}
                          </span>

                        </div>
                      )}

                    {recipientType === "username" &&
                      !resolvingUsername &&
                      (!resolvedAddress ||
                        resolvedAddress === zeroAddress) && (
                        <p className="mt-2 text-[9px] font-medium text-[#D05B5B]">
                          @{username} is not registered.
                        </p>
                      )}

                    {recipientType === "invalid" && (
                      <p className="mt-2 text-[9px] font-medium text-[#D05B5B]">
                        Enter a valid wallet address or @username.
                      </p>
                    )}

                  </div>

                  {/* ==================================================
                      AMOUNT
                      ================================================== */}

                  <div>

                    <div className="mb-2.5 flex items-center justify-between">

                      <label className="text-[11px] font-semibold text-[#333740]">
                        Amount
                      </label>

                      <button
                        type="button"
                        onClick={handleMax}
                        disabled={
                          balance === undefined ||
                          balance === 0n
                        }
                        className="rounded-full px-2.5 py-1 text-[9px] font-semibold text-[#5B61D6] transition hover:bg-[#F1F2FF] disabled:opacity-35"
                      >
                        Max
                      </button>

                    </div>

                    <div className="arc-input flex h-[74px] items-center px-4">

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
                        className="tabular min-w-0 flex-1 bg-transparent text-[30px] font-semibold tracking-[-0.055em] text-[#11131A] outline-none placeholder:text-[#C2C6CE]"
                      />

                      <div className="flex items-center gap-2 rounded-full bg-[#F3F4F8] px-3 py-2">

                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#2563EB] shadow-[0_1px_2px_rgba(17,19,26,0.05)]">
                          $
                        </span>

                        <span className="text-[10px] font-bold text-[#333740]">
                          USDC
                        </span>

                        <ChevronDown
                          size={12}
                          className="text-[#9298A4]"
                        />

                      </div>

                    </div>

                    <div className="mt-2.5 flex items-center justify-between">

                      <span className="text-[9px] text-[#9298A4]">
                        Available balance
                      </span>

                      <span className="tabular text-[9px] font-semibold text-[#666C78]">
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
                      <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-[#D05B5B]">

                        <CircleAlert size={11} />

                        Insufficient USDC balance.

                      </div>
                    )}

                  </div>

                  {/* ==================================================
                      NETWORK
                      ================================================== */}

                  <div>

                    <label className="mb-2.5 block text-[11px] font-semibold text-[#333740]">
                      Network
                    </label>

                    <div className="flex min-h-[62px] items-center justify-between rounded-[15px] border border-[#E7E9EF] bg-[#FBFBFD] px-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF8F2]">

                          <span className="h-2.5 w-2.5 rounded-full bg-[#16A36A] shadow-[0_0_0_4px_rgba(22,163,106,0.08)]" />

                        </div>

                        <div>

                          <p className="text-[11px] font-semibold">
                            Arc Testnet
                          </p>

                          <p className="mt-0.5 text-[9px] text-[#9298A4]">
                            USDC payments
                          </p>

                        </div>

                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${
                          networkReady
                            ? "arc-status-success"
                            : "arc-status-error"
                        }`}
                      >
                        {networkReady
                          ? "Connected"
                          : "Wrong network"}
                      </span>

                    </div>

                  </div>

                  {/* ==================================================
                      INFO
                      ================================================== */}

                  <div className="arc-soft-accent flex gap-3 rounded-[15px] p-4">

                    <Info
                      size={15}
                      className="mt-0.5 shrink-0"
                    />

                    <p className="text-[9px] leading-5 text-[#656A78]">
                      You can send directly to a wallet address or use an Arc Pay username. Always verify the recipient before confirming.
                    </p>

                  </div>

                  {/* ==================================================
                      ERROR
                      ================================================== */}

                  {displayError && (
                    <div className="arc-status-error flex items-start gap-3 rounded-[15px] px-4 py-3.5">

                      <CircleAlert
                        size={15}
                        className="mt-0.5 shrink-0"
                      />

                      <p className="text-[9px] leading-5">
                        {displayError}
                      </p>

                    </div>
                  )}

                  {/* ==================================================
                      CONTINUE
                      ================================================== */}

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
                        className="arc-primary flex h-[53px] w-full items-center justify-center gap-2 rounded-[15px] text-[11px] font-semibold disabled:bg-[#E8EAF0] disabled:text-[#A1A6B0] disabled:shadow-none"
                      >
                        Review payment

                        <ArrowUpRight
                          size={14}
                        />

                      </button>
                    )}

                  {!showConfirmation &&
                    !transactionComplete && (
                      <p className="text-center text-[9px] text-[#9AA0AB]">
                        Your wallet will ask you to approve the transaction.
                      </p>
                    )}

                  {/* ==================================================
                      CONFIRMATION
                      ================================================== */}

                  {showConfirmation &&
                    !transactionComplete && (
                      <div className="overflow-hidden rounded-[19px] border border-[#E1E4EA] bg-[#F8F9FC]">

                        <div className="border-b border-[#E8EAF0] px-5 py-4">

                          <div className="flex items-start justify-between">

                            <div>

                              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#949AA6]">
                                Review payment
                              </p>

                              <p className="tabular mt-1 text-[24px] font-semibold tracking-[-0.05em]">
                                {amount}
                                <span className="ml-1 text-[11px] font-semibold text-[#777D89]">
                                  USDC
                                </span>
                              </p>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmation(
                                  false
                                )
                              }
                              disabled={
                                isSending ||
                                isConfirming
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E5EA] bg-white text-[#777D89] transition hover:bg-[#F4F5F8]"
                            >
                              <X size={14} />
                            </button>

                          </div>

                        </div>

                        <div className="space-y-2 p-5">

                          <div className="rounded-[14px] bg-white p-4">

                            <div className="flex items-center justify-between">

                              <span className="text-[9px] text-[#9298A4]">
                                Recipient
                              </span>

                              <span className="rounded-full bg-[#F1EDFF] px-2 py-1 text-[8px] font-semibold text-[#6256C8]">
                                {recipientType ===
                                "username"
                                  ? "Username"
                                  : "Wallet"}
                              </span>

                            </div>

                            <p className="mt-2 text-[12px] font-semibold">
                              {recipientType ===
                              "username"
                                ? `@${username}`
                                : shortAddress(
                                    recipientAddress
                                  )}
                            </p>

                            {recipientType ===
                              "username" && (
                              <p className="mt-1 font-mono text-[8px] text-[#999FAA]">
                                {shortAddress(
                                  recipientAddress
                                )}
                              </p>
                            )}

                          </div>

                          <div className="flex items-center justify-between rounded-[14px] bg-white px-4 py-3.5">

                            <span className="text-[9px] text-[#9298A4]">
                              Network
                            </span>

                            <span className="text-[9px] font-semibold">
                              Arc Testnet
                            </span>

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
                            className="arc-accent mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] text-[11px] font-semibold disabled:opacity-50"
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

                      </div>
                    )}

                  {/* ==================================================
                      SUCCESS
                      ================================================== */}

                  {transactionComplete && (
                    <div className="arc-status-success rounded-[20px] p-6 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(22,163,106,0.10)]">

                        <Check
                          size={24}
                          strokeWidth={2}
                        />

                      </div>

                      <h3 className="mt-4 text-[16px] font-semibold text-[#17231D]">
                        Payment sent
                      </h3>

                      <p className="mt-1.5 text-[10px] leading-5 text-[#668071]">
                        {amount} USDC was sent successfully.
                      </p>

                      <a
                        href={`${EXPLORER_URL}/tx/${transactionHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[9px] font-semibold text-[#47735C] shadow-[0_1px_4px_rgba(22,163,106,0.08)]"
                      >
                        View transaction
                        <ArrowUpRight size={11} />
                      </a>

                      <p className="mt-3 break-all font-mono text-[7px] text-[#7A9585]">
                        {transactionHash}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          refetchBalance();
                        }}
                        className="mt-5 h-10 rounded-full bg-[#11131A] px-5 text-[10px] font-semibold text-white transition hover:bg-[#272A32]"
                      >
                        Send another payment
                      </button>

                    </div>
                  )}

                </div>

              </section>

              {/* ==================================================
                  SIDE PANEL
                  ================================================== */}

              <aside>

                <div className="arc-card overflow-hidden">

                  <div className="relative h-[150px] overflow-hidden bg-[#0C1220]">

                    <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#4F46E5]/20 blur-[55px]" />

                    <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-[#2563EB]/15 blur-[55px]" />

                    <div className="relative flex h-full items-center justify-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/10 ring-1 ring-white/15 backdrop-blur">

                        <Wallet
                          size={28}
                          strokeWidth={1.5}
                          className="text-white"
                        />

                      </div>

                    </div>

                  </div>

                  <div className="p-6">

                    <div className="flex items-center gap-2">

                      <span className="h-2 w-2 rounded-full bg-[#2563EB]" />

                      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8D939F]">
                        Arc Pay
                      </span>

                    </div>

                    <h2 className="mt-3 text-[19px] font-semibold tracking-[-0.035em]">
                      Send with confidence
                    </h2>

                    <p className="mt-2 text-[11px] leading-5 text-[#7D838F]">
                      Your payment is signed by your connected wallet and settled directly on Arc.
                    </p>

                    <div className="mt-6 space-y-3 border-t border-[#EEF0F4] pt-5">

                      <SideDetail
                        label="Asset"
                        value="USDC"
                      />

                      <SideDetail
                        label="Network"
                        value="Arc Testnet"
                      />

                      <SideDetail
                        label="Recipient"
                        value={
                          recipient
                            ? recipient
                            : "Not selected"
                        }
                      />

                      <SideDetail
                        label="Custody"
                        value="Non-custodial"
                      />

                    </div>

                    <div className="arc-soft-accent mt-6 rounded-[14px] p-3.5">

                      <div className="flex gap-2.5">

                        <Info
                          size={13}
                          className="mt-0.5 shrink-0"
                        />

                        <p className="text-[9px] leading-5 text-[#656A78]">
                          Always verify the recipient before signing a transaction.
                        </p>

                      </div>

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

/* ============================================================
   SIDE DETAIL
   ============================================================ */

function SideDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-[9px] text-[#969CA7]">
        {label}
      </span>

      <span className="max-w-[180px] truncate text-right text-[9px] font-semibold text-[#414650]">
        {value}
      </span>

    </div>
  );
}
