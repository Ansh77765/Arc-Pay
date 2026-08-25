"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  useAccount,
  useReadContract,
} from "wagmi";

import {
  zeroAddress,
} from "viem";

import { arcTestnet } from "@/lib/chain";

import {
  USERNAME_REGISTRY_ADDRESS,
} from "@/lib/config";

import {
  usernameRegistryAbi,
} from "@/lib/usernameRegistryAbi";

import {
  isValidAmount,
  shortAddress,
} from "@/lib/format";

type CreatePaymentFormProps = {
  open: boolean;
  onClose: () => void;
};

export function CreatePaymentForm({
  open,
  onClose,
}: CreatePaymentFormProps) {
  const {
    address,
    isConnected,
    chainId,
  } = useAccount();

  const [username, setUsername] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [formError, setFormError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [requestCreated, setRequestCreated] =
    useState(false);

  /*
   * ============================================================
   * NETWORK
   * ============================================================
   */

  const onArcTestnet =
    isConnected &&
    chainId === arcTestnet.id;

  /*
   * ============================================================
   * CURRENT USERNAME
   * ============================================================
   */

  const {
    data: registeredUsername,
    isLoading: loadingUsername,
  } = useReadContract({
    address:
      USERNAME_REGISTRY_ADDRESS,
    abi: usernameRegistryAbi,
    functionName: "usernameOf",
    args: address
      ? [address]
      : undefined,
    query: {
      enabled:
        open &&
        !!address,
    },
  });

  /*
   * ============================================================
   * RECIPIENT USERNAME
   * ============================================================
   */

  const normalizedUsername =
    username
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

  const usernameValid =
    /^[a-z0-9]{3,20}$/.test(
      normalizedUsername
    );

  /*
   * ============================================================
   * RESOLVE RECIPIENT
   * ============================================================
   */

  const {
    data: resolvedAddress,
    isLoading: resolvingUsername,
    isError: usernameResolveError,
  } = useReadContract({
    address:
      USERNAME_REGISTRY_ADDRESS,
    abi: usernameRegistryAbi,
    functionName: "resolve",
    args: usernameValid
      ? [normalizedUsername]
      : undefined,
    query: {
      enabled:
        open &&
        usernameValid,
    },
  });

  const recipientAddress =
    resolvedAddress &&
    resolvedAddress !== zeroAddress
      ? resolvedAddress
      : undefined;

  /*
   * ============================================================
   * VALIDATION
   * ============================================================
   */

  const recipientReady =
    usernameValid &&
    !!recipientAddress &&
    !usernameResolveError;

  const amountReady =
    isValidAmount(amount);

  const canRequest =
    isConnected &&
    onArcTestnet &&
    !!registeredUsername &&
    recipientReady &&
    amountReady &&
    !submitting;

  /*
   * ============================================================
   * CREATE REQUEST
   * ============================================================
   *
   * IMPORTANT:
   *
   * This does NOT call writeContract().
   * Therefore it does NOT open a wallet popup.
   *
   * It simply creates a pending request in Supabase.
   */

  async function handleRequest(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setFormError(null);

    if (!isConnected || !address) {
      setFormError(
        "Connect your wallet first."
      );
      return;
    }

    if (chainId !== arcTestnet.id) {
      setFormError(
        "Switch to Arc Testnet first."
      );
      return;
    }

    if (!registeredUsername) {
      setFormError(
        "You need a username before requesting payment."
      );
      return;
    }

    if (loadingUsername) {
      setFormError(
        "Still loading your username. Please wait."
      );
      return;
    }

    if (!username.trim()) {
      setFormError(
        "Enter the username you want to request from."
      );
      return;
    }

    if (!usernameValid) {
      setFormError(
        "Username must contain 3–20 lowercase letters or numbers."
      );
      return;
    }

    if (resolvingUsername) {
      setFormError(
        "Still checking the username. Please wait."
      );
      return;
    }

    if (
      usernameResolveError ||
      !recipientAddress ||
      recipientAddress === zeroAddress
    ) {
      setFormError(
        `@${normalizedUsername} is not registered.`
      );
      return;
    }

    if (!isValidAmount(amount)) {
      setFormError(
        "Enter a valid USDC amount greater than 0."
      );
      return;
    }

    if (
      recipientAddress.toLowerCase() ===
      address.toLowerCase()
    ) {
      setFormError(
        "You cannot request payment from yourself."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/requests",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              requesterWallet:
                address,

              requesterUsername:
                String(
                  registeredUsername
                ),

              recipientWallet:
                recipientAddress,

              recipientUsername:
                normalizedUsername,

              amount:
                amount.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Could not create payment request."
        );
      }

      setRequestCreated(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not create payment request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  function resetForm() {
    setUsername("");
    setAmount("");
    setFormError(null);
    setSubmitting(false);
    setRequestCreated(false);
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    resetForm();
    onClose();
  }

  /*
   * ============================================================
   * CLOSED
   * ============================================================
   */

  if (!open) {
    return null;
  }

  /*
   * ============================================================
   * REQUEST CREATED SCREEN
   * ============================================================
   */

  if (requestCreated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">

        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute inset-0 bg-black/[0.18] backdrop-blur-[3px]"
        />

        <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-[24px] border border-[#E2E2E5] bg-white shadow-[0_30px_90px_-35px_rgba(0,0,0,.28)]">

          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E7EA] bg-white text-[#777880] transition hover:bg-[#F5F5F6] hover:text-[#111111]"
          >
            <X
              size={15}
              strokeWidth={1.8}
            />
          </button>

          <div className="p-6">

            <div className="rounded-[18px] border border-[#DDEEE4] bg-[#F6FBF8] px-5 py-7 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF7EF] text-[#31A66A]">
                <Check
                  size={27}
                  strokeWidth={2.2}
                />
              </div>

              <h3 className="mt-4 text-[18px] font-semibold text-[#222327]">
                Request sent
              </h3>

              <p className="mt-2 text-[11px] leading-5 text-[#85868E]">
                You requested
              </p>

              <p className="mt-1 text-[16px] font-semibold text-[#222327]">
                {amount} USDC
              </p>

              <p className="mt-1 font-mono text-[12px] font-semibold text-[#55565D]">
                from @{normalizedUsername}
              </p>

              <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2">

                <span className="h-2 w-2 rounded-full bg-[#31A66A]" />

                <span className="text-[9px] font-semibold text-[#55565D]">
                  Waiting for payment
                </span>

              </div>

            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-[13px] bg-[#111111] text-[10px] font-semibold text-white transition hover:bg-[#292929]"
            >
              Done
            </button>

          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN REQUEST MODAL
   * ============================================================
   */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">

      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="absolute inset-0 bg-black/[0.18] backdrop-blur-[3px]"
      />

      {/* MODAL */}

      <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-[24px] border border-[#E2E2E5] bg-white shadow-[0_30px_90px_-35px_rgba(0,0,0,.28)]">

        {/* CLOSE */}

        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          disabled={submitting}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E7EA] bg-white text-[#777880] transition hover:bg-[#F5F5F6] hover:text-[#111111] disabled:opacity-40"
        >
          <X
            size={15}
            strokeWidth={1.8}
          />
        </button>

        {/* HEADER */}

        <div className="border-b border-[#EEEEF1] px-6 pb-5 pt-6">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F5F5F6] text-[#55565D]">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-[18px] w-[18px]"
              >
                <path
                  d="M12 4v16M4 12h16"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8D8E96]">
                Arc Pay
              </p>

              <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.035em] text-[#111111]">
                Request payment
              </h2>

              <p className="mt-1.5 max-w-[310px] text-[10px] leading-5 text-[#85868E]">
                Ask another Arc Pay user to send you USDC.
              </p>

            </div>

            <span className="mt-1 rounded-full bg-[#F7F7F8] px-2.5 py-1 text-[8px] font-bold text-[#777880]">
              USDC
            </span>

          </div>
        </div>

        {/* CONTENT */}

        <div className="p-6">

          <form
            onSubmit={handleRequest}
            className="space-y-5"
          >

            {/* FROM USERNAME */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="request-username"
                  className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777880]"
                >
                  Request from
                </label>

                <span className="text-[9px] text-[#A0A1A8]">
                  Arc Pay username
                </span>

              </div>

              <div
                className={`flex h-[52px] items-center overflow-hidden rounded-[14px] border bg-white transition focus-within:ring-2 focus-within:ring-[#111111]/[0.04] ${
                  username.length > 0 &&
                  !usernameValid
                    ? "border-[#E7CACA]"
                    : recipientReady
                    ? "border-[#BFE3CF]"
                    : "border-[#E2E2E5]"
                }`}
              >

                <span className="pl-4 text-[15px] font-semibold text-[#999AA2]">
                  @
                </span>

                <input
                  id="request-username"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="username"
                  value={normalizedUsername}
                  onChange={(e) => {
                    const value =
                      e.target.value
                        .replace(/^@/, "")
                        .toLowerCase();

                    setUsername(value);
                    setFormError(null);
                  }}
                  className="min-w-0 flex-1 bg-transparent px-2 text-[13px] font-medium text-[#222327] outline-none placeholder:text-[#C1C2C7]"
                />

                {resolvingUsername && (
                  <Loader2
                    size={16}
                    className="mr-4 animate-spin text-[#8D8E96]"
                  />
                )}

                {!resolvingUsername &&
                  recipientReady && (
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF8F2] text-[#16A36A]">
                      <Check size={14} />
                    </div>
                  )}

              </div>

              {username.length > 0 &&
                !usernameValid && (
                  <p className="mt-2 text-[9px] font-medium text-[#D05B5B]">
                    Use 3–20 lowercase letters or numbers.
                  </p>
                )}

              {usernameValid &&
                resolvingUsername && (
                  <p className="mt-2 flex items-center gap-1.5 text-[9px] text-[#8D8E96]">
                    <Loader2
                      size={10}
                      className="animate-spin"
                    />
                    Checking @{normalizedUsername}…
                  </p>
                )}

              {usernameValid &&
                !resolvingUsername &&
                recipientReady && (
                  <div className="mt-2 flex items-center gap-2">

                    <span className="rounded-full bg-[#EAF8F2] px-2 py-1 text-[8px] font-semibold text-[#16A36A]">
                      Verified
                    </span>

                    <span className="font-mono text-[9px] text-[#7E8490]">
                      @{normalizedUsername} →{" "}
                      {shortAddress(
                        recipientAddress!
                      )}
                    </span>

                  </div>
                )}

              {usernameValid &&
                !resolvingUsername &&
                !recipientReady && (
                  <p className="mt-2 text-[9px] font-medium text-[#D05B5B]">
                    @{normalizedUsername} is not registered.
                  </p>
                )}

            </div>

            {/* AMOUNT */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="request-amount"
                  className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777880]"
                >
                  Amount
                </label>

                <span className="text-[9px] text-[#A0A1A8]">
                  USDC
                </span>

              </div>

              <div className="flex h-[64px] items-center overflow-hidden rounded-[14px] border border-[#E2E2E5] bg-white transition focus-within:border-[#BFC0C5] focus-within:ring-2 focus-within:ring-[#111111]/[0.04]">

                <input
                  id="request-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(
                      e.target.value
                    );
                    setFormError(null);
                  }}
                  className="min-w-0 flex-1 bg-transparent px-4 text-[25px] font-semibold tracking-[-0.04em] text-[#111111] outline-none placeholder:text-[#C1C2C7]"
                />

                <div className="mr-3 flex h-8 items-center gap-2 rounded-full bg-[#F5F5F6] px-3">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#55565D]">
                    $
                  </span>

                  <span className="text-[9px] font-bold text-[#55565D]">
                    USDC
                  </span>

                </div>

              </div>

            </div>

            {/* REQUESTER */}

            <div className="rounded-[15px] border border-[#E7E7EA] bg-[#F7F7F8] p-3.5">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#777880]">
                  <ShieldCheck
                    size={16}
                    strokeWidth={1.7}
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#A0A1A8]">
                    You will receive
                  </p>

                  <p className="mt-1 font-mono text-[12px] font-semibold text-[#33343A]">
                    {registeredUsername
                      ? `@${registeredUsername}`
                      : address
                      ? shortAddress(address)
                      : "Connect wallet"}
                  </p>

                  {registeredUsername &&
                    address && (
                      <p className="mt-1 truncate font-mono text-[8px] text-[#999AA2]">
                        {shortAddress(address)}
                      </p>
                    )}

                </div>

                {registeredUsername && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F0FAF4] px-2.5 py-1 text-[8px] font-semibold text-[#31A66A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#31A66A]" />
                    Username
                  </span>
                )}

              </div>

            </div>

            {/* ERROR */}

            {formError && (
              <div className="flex items-start gap-3 rounded-[14px] border border-[#F2D5D5] bg-[#FFF8F8] px-4 py-3.5">

                <CircleAlert
                  size={16}
                  className="mt-0.5 shrink-0 text-[#D85C5C]"
                />

                <div className="min-w-0">

                  <p className="text-[10px] font-semibold text-[#B84D4D]">
                    Request unavailable
                  </p>

                  <p className="mt-1 text-[9px] leading-5 text-[#B76A6A]">
                    {formError}
                  </p>

                </div>

              </div>
            )}

            {/* REQUEST BUTTON */}

            <button
              type="submit"
              disabled={!canRequest}
              className="group flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#111111] text-[11px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#EEEEF0] disabled:text-[#A0A1A8]"
            >

              {submitting ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Sending request…
                </>
              ) : !isConnected ? (
                "Connect your wallet to continue"
              ) : !registeredUsername ? (
                "Set your username first"
              ) : !onArcTestnet ? (
                "Switch to Arc Testnet"
              ) : (
                <>
                  Request
                  {usernameValid &&
                    amountReady
                    ? ` ${amount} USDC`
                    : ""}

                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}

            </button>

            {/* INFO */}

            <div className="flex items-start justify-center gap-2 px-3">

              <CheckCircle2
                size={13}
                className="mt-0.5 shrink-0 text-[#8E929A]"
              />

              <p className="max-w-[330px] text-center text-[9px] leading-5 text-[#999AA2]">
                No wallet transaction is made when
                requesting. The recipient will pay
                when they approve your request.
              </p>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
