"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSignTypedData,
} from "wagmi";

import { arcTestnet } from "@/lib/chain";

import {
  generateInvoiceId,
  generateInvoiceNonce,
  encodeInvoice,
} from "@/lib/invoice";

import {
  invoiceDomain,
  invoiceMessage,
  invoiceTypes,
} from "@/lib/paymentRequest";

import {
  isValidAmount,
  shortAddress,
} from "@/lib/format";

import {
  USERNAME_REGISTRY_ADDRESS,
} from "@/lib/config";

import {
  usernameRegistryAbi,
} from "@/lib/usernameRegistryAbi";

import type { Invoice } from "@/types/invoice";

type CreatePaymentFormProps = {
  open: boolean;
  onClose: () => void;
};

const PAYMENT_DURATION =
  10 * 60 * 1000;

export function CreatePaymentForm({
  open,
  onClose,
}: CreatePaymentFormProps) {
  const {
    address,
    isConnected,
    chainId,
  } = useAccount();

  const publicClient =
    usePublicClient({
      chainId: arcTestnet.id,
    });

  const {
    signTypedDataAsync,
  } = useSignTypedData();

  const [amount, setAmount] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [generatedUrl, setGeneratedUrl] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [generatedAt, setGeneratedAt] =
    useState<number | null>(null);

  const [timeLeft, setTimeLeft] =
    useState(PAYMENT_DURATION);

  /*
   * ============================================================
   * REGISTERED USERNAME
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
    args: [
      address as `0x${string}`,
    ],
    query: {
      enabled:
        open &&
        !!address,
    },
  });

  const onArcTestnet =
    isConnected &&
    chainId === arcTestnet.id;

  const canSubmit =
    onArcTestnet &&
    isValidAmount(amount) &&
    description.trim().length > 0;

  /*
   * ============================================================
   * TIMER
   * ============================================================
   */

  useEffect(() => {
    if (
      !generatedAt ||
      !generatedUrl
    ) {
      return;
    }

    const updateTimer = () => {
      const remaining =
        Math.max(
          0,
          generatedAt +
            PAYMENT_DURATION -
            Date.now()
        );

      setTimeLeft(
        remaining
      );
    };

    updateTimer();

    const interval =
      window.setInterval(
        updateTimer,
        1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    generatedAt,
    generatedUrl,
  ]);

  const paymentExpired =
    timeLeft <= 0;

  if (!open) {
    return null;
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setFormError(null);

    if (!address) {
      setFormError(
        "Connect your wallet first."
      );
      return;
    }

    if (!onArcTestnet) {
      setFormError(
        "Switch to Arc Testnet first."
      );
      return;
    }

    if (!isValidAmount(amount)) {
      setFormError(
        "Enter a valid USDC amount greater than 0."
      );
      return;
    }

    if (!description.trim()) {
      setFormError(
        "Add a short description."
      );
      return;
    }

    setSubmitting(true);

    try {
      const fromBlock =
        publicClient
          ? await publicClient.getBlockNumber()
          : 0n;

      const id =
        generateInvoiceId();

      const createdAt =
        Date.now();

      const invoice: Invoice = {
        version: 2,
        id,
        recipient: address,
        amount:
          amount.trim(),
        description:
          description
            .trim()
            .slice(0, 140),
        createdAt,
        chainId:
          arcTestnet.id,
        fromBlock:
          Number(fromBlock),
        nonce:
          generateInvoiceNonce(id),
        signature: "0x",
      };

      const signature =
        await signTypedDataAsync({
          domain:
            invoiceDomain(
              invoice.chainId
            ),
          types:
            invoiceTypes,
          primaryType:
            "PaymentRequest",
          message:
            invoiceMessage(
              invoice
            ),
        });

      const signedInvoice = {
        ...invoice,
        signature,
      };

      const token =
        encodeInvoice(
          signedInvoice
        );

      const url =
        `${window.location.origin}/pay/${token}`;

      setGeneratedAt(
        createdAt
      );

      setTimeLeft(
        PAYMENT_DURATION
      );

      setGeneratedUrl(
        url
      );
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Could not create the payment link."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!generatedUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedUrl
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setFormError(
        "Could not copy the payment link."
      );
    }
  }

  async function shareLink() {
    if (!generatedUrl) {
      return;
    }

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            "Arc Pay payment request",
          text:
            `Pay ${amount} USDC`,
          url: generatedUrl,
        });
      } else {
        await copyLink();
      }
    } catch {
      // User cancelled share.
    }
  }

  function resetForm() {
    setAmount("");
    setDescription("");
    setFormError(null);
    setGeneratedUrl("");
    setCopied(false);
    setGeneratedAt(null);
    setTimeLeft(
      PAYMENT_DURATION
    );
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    resetForm();
    onClose();
  }

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
                Payment request
              </p>

              <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.035em] text-[#111111]">
                Create payment
              </h2>

              <p className="mt-1.5 max-w-[300px] text-[10px] leading-5 text-[#85868E]">
                Create a secure USDC request
                and share the link.
              </p>

            </div>

            <span className="mt-1 rounded-full bg-[#F7F7F8] px-2.5 py-1 text-[8px] font-bold text-[#777880]">
              USDC
            </span>

          </div>
        </div>

        {/* CONTENT */}

        <div className="p-6">

          {generatedUrl ? (

            /* SUCCESS */

            <div className="space-y-4">

              <div className="rounded-[18px] border border-[#DDEEE4] bg-[#F6FBF8] px-5 py-5 text-center">

                <div className="flex justify-center">

                  <PaymentCountdown
                    timeLeft={
                      timeLeft
                    }
                    expired={
                      paymentExpired
                    }
                  />

                </div>

                <div className="mx-auto mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF7EF] text-[#31A66A]">

                  {paymentExpired ? (
                    <CircleAlert
                      size={20}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Check
                      size={20}
                      strokeWidth={2}
                    />
                  )}

                </div>

                <h3 className="mt-3 text-[14px] font-semibold text-[#222327]">
                  {paymentExpired
                    ? "Payment link expired"
                    : "Payment link created"}
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-[#85868E]">
                  {paymentExpired
                    ? "This payment request was valid for 10 minutes."
                    : "Share this link with the person who needs to pay you."}
                </p>

              </div>

              {/* LINK */}

              <div className="rounded-[15px] border border-[#E5E5E8] bg-[#F7F7F8] p-2">

                <div className="flex items-center gap-2">

                  <div className="min-w-0 flex-1 px-2">

                    <p className="truncate font-mono text-[9px] text-[#777880]">
                      {generatedUrl}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      copyLink
                    }
                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-[#111111] px-3 text-[9px] font-semibold text-white transition hover:bg-[#292929]"
                  >
                    {copied ? (
                      <Check
                        size={13}
                      />
                    ) : (
                      <Copy
                        size={13}
                      />
                    )}

                    {copied
                      ? "Copied"
                      : "Copy"}
                  </button>

                </div>
              </div>

              {/* SHARE */}

              <button
                type="button"
                onClick={
                  shareLink
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[13px] border border-[#E2E2E5] bg-white text-[10px] font-semibold text-[#33343A] transition hover:bg-[#F7F7F8]"
              >
                <ExternalLink
                  size={14}
                />

                Share payment link
              </button>

              {/* DONE */}

              <button
                type="button"
                onClick={
                  handleClose
                }
                className="flex h-11 w-full items-center justify-center rounded-[13px] bg-[#111111] text-[10px] font-semibold text-white transition hover:bg-[#292929]"
              >
                Done
              </button>

            </div>

          ) : (

            /* FORM */

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* AMOUNT */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="payment-amount"
                    className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777880]"
                  >
                    Amount
                  </label>

                  <span className="text-[9px] text-[#A0A1A8]">
                    USDC
                  </span>

                </div>

                <div className="flex h-[52px] items-center overflow-hidden rounded-[14px] border border-[#E2E2E5] bg-white transition focus-within:border-[#BFC0C5] focus-within:ring-2 focus-within:ring-[#111111]/[0.04]">

                  <input
                    id="payment-amount"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) =>
                      setAmount(
                        e.target.value
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent px-4 text-[16px] font-semibold tracking-[-0.02em] text-[#111111] outline-none placeholder:text-[#C1C2C7]"
                  />

                  <div className="mr-3 flex h-7 items-center rounded-full bg-[#F5F5F6] px-2.5 text-[9px] font-bold text-[#55565D]">
                    USDC
                  </div>

                </div>
              </div>

              {/* DESCRIPTION */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="payment-description"
                    className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777880]"
                  >
                    Description
                  </label>

                  <span className="text-[9px] text-[#A0A1A8]">
                    {description.length}/140
                  </span>

                </div>

                <textarea
                  id="payment-description"
                  rows={3}
                  maxLength={140}
                  placeholder="What is this payment for?"
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  className="w-full resize-none rounded-[14px] border border-[#E2E2E5] bg-white px-4 py-3 text-[11px] leading-5 text-[#33343A] outline-none transition placeholder:text-[#B8B9BF] focus:border-[#BFC0C5] focus:ring-2 focus:ring-[#111111]/[0.04]"
                />

              </div>

              {/* RECIPIENT */}

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
                      Receiving wallet
                    </p>

                    {registeredUsername ? (
                      <p className="mt-1 font-mono text-[12px] font-semibold text-[#33343A]">
                        @{registeredUsername}
                      </p>
                    ) : (
                      <p className="mt-1 font-mono text-[10px] font-medium text-[#55565D]">
                        {address
                          ? shortAddress(
                              address
                            )
                          : "Connect wallet"}
                      </p>
                    )}

                    {registeredUsername &&
                      address && (
                        <p className="mt-1 truncate font-mono text-[8px] text-[#999AA2]">
                          {shortAddress(
                            address
                          )}
                        </p>
                      )}

                  </div>

                  {address && (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F0FAF4] px-2.5 py-1 text-[8px] font-semibold text-[#31A66A]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#31A66A]" />
                      {loadingUsername
                        ? "Loading"
                        : registeredUsername
                        ? "Username"
                        : "Connected"}
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
                      Unable to create request
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-[#B76A6A]">
                      {formError}
                    </p>

                  </div>
                </div>
              )}

              {/* CREATE */}

              <button
                type="submit"
                disabled={
                  !canSubmit ||
                  submitting
                }
                className="group flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#111111] text-[11px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#EEEEF0] disabled:text-[#A0A1A8]"
              >

                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Creating link…
                  </>
                ) : !isConnected ? (
                  "Connect your wallet to continue"
                ) : !onArcTestnet ? (
                  "Switch to Arc Testnet to continue"
                ) : (
                  <>
                    Create payment link

                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}

              </button>

              {/* SECURITY */}

              <div className="flex items-start justify-center gap-2 px-3">

                <CheckCircle2
                  size={13}
                  className="mt-0.5 shrink-0 text-[#8E929A]"
                />

                <p className="max-w-[330px] text-center text-[9px] leading-5 text-[#999AA2]">
                  Your wallet signs the request.
                  Arc Pay never holds your funds.
                </p>

              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CIRCULAR PAYMENT COUNTDOWN
   ================================================================ */

function PaymentCountdown({
  timeLeft,
  expired,
}: {
  timeLeft: number;
  expired: boolean;
}) {
  const totalSeconds =
    Math.max(
      0,
      Math.ceil(
        timeLeft / 1000
      )
    );

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const seconds =
    totalSeconds % 60;

  const progress =
    Math.max(
      0,
      Math.min(
        1,
        timeLeft /
          PAYMENT_DURATION
      )
    );

  const radius = 25;

  const circumference =
    2 *
    Math.PI *
    radius;

  const dashOffset =
    circumference *
    (1 - progress);

  const formattedTime =
    `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center">

      <div className="relative h-[64px] w-[64px]">

        <svg
          viewBox="0 0 64 64"
          className="h-full w-full -rotate-90"
          aria-label={
            expired
              ? "Payment link expired"
              : `Payment link expires in ${formattedTime}`
          }
        >

          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#DDEEE4"
            strokeWidth="3"
          />

          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={
              expired
                ? "#D65A5A"
                : "#31A66A"
            }
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={
              circumference
            }
            strokeDashoffset={
              dashOffset
            }
            className="transition-[stroke-dashoffset] duration-500"
          />

        </svg>

        <div
          className={`absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold tabular-nums ${
            expired
              ? "text-[#D65A5A]"
              : "text-[#33343A]"
          }`}
        >
          {expired
            ? "00:00"
            : formattedTime}
        </div>

      </div>

      <p
        className={`mt-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] ${
          expired
            ? "text-[#D65A5A]"
            : "text-[#85868E]"
        }`}
      >
        {expired
          ? "Expired"
          : "Expires in"}
      </p>

    </div>
  );
}
