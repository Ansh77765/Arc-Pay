"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useSignTypedData,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import type { PublicClient } from "viem";
import {
  formatUnits,
  maxUint256,
  parseUnits,
} from "viem";

import { arcTestnet } from "@/lib/chain";
import { erc20Abi } from "@/lib/erc20";

import {
  PERMIT2_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
  explorerAddressUrl,
  explorerTxUrl,
} from "@/lib/config";

import {
  formatDate,
  formatUsdc,
  shortAddress,
  shortHash,
} from "@/lib/format";

import {
  permit2Abi,
  permit2Domain,
  permit2Types,
} from "@/lib/permit2";

import {
  findMatchingPayment,
  verifyPaymentTx,
  type VerifiedPayment,
} from "@/lib/verify";

import { verifyInvoiceSignature } from "@/lib/paymentRequest";

import { WalletWidget } from "./WalletWidget";

import {
  StatusPill,
  type PaymentStatus,
} from "./StatusPill";

import { CopyButton } from "./CopyButton";

import type { Invoice } from "@/types/invoice";

import Link from "next/link";

/*
 * IMPORTANT:
 * Named export required by:
 *
 * import { PaymentView } from "@/components/PaymentView";
 */
export function PaymentView({
  invoice,
}: {
  invoice: Invoice;
}) {
  const {
    address,
    isConnected,
    chainId,
  } = useAccount();

  const {
    switchChain,
    isPending: switching,
  } = useSwitchChain();

  const {
    writeContractAsync,
    isPending: writing,
  } = useWriteContract();

  const { signTypedDataAsync } =
    useSignTypedData();

  const [status, setStatus] =
    useState<PaymentStatus>("checking");

  const [payment, setPayment] =
    useState<VerifiedPayment | null>(null);

  const [pendingTxHash, setPendingTxHash] =
    useState<`0x${string}` | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [confirming, setConfirming] =
    useState(false);

  const [approvalPending, setApprovalPending] =
    useState(false);

  const [invoiceValid, setInvoiceValid] =
    useState<boolean | null>(null);

  const [shareUrl, setShareUrl] =
    useState("");

  const onArcTestnet =
    isConnected &&
    chainId === arcTestnet.id;

  const isRecipient =
    Boolean(address) &&
    address?.toLowerCase() ===
      invoice.recipient.toLowerCase();

  /*
   * Existing balance logic
   */
  const {
    data: balance,
    isLoading: balanceLoading,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address
      ? [address]
      : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled:
        Boolean(address) &&
        onArcTestnet,
      refetchInterval: 15_000,
    },
  });

  /*
   * Existing Permit2 allowance logic
   */
  const {
    data: allowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address
      ? [address, PERMIT2_ADDRESS]
      : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled:
        Boolean(address) &&
        onArcTestnet,
      refetchInterval: 15_000,
    },
  });

  /*
   * Existing public client logic
   */
  const [publicClient, setPublicClient] =
    useState<PublicClient | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadClient() {
      try {
        const {
          createPublicClient,
          http,
        } = await import("viem");

        const client =
          createPublicClient({
            chain: arcTestnet,
            transport: http(),
          });

        if (!cancelled) {
          setPublicClient(
            client as PublicClient
          );
        }
      } catch {
        if (!cancelled) {
          setPublicClient(null);
        }
      }
    }

    loadClient();

    return () => {
      cancelled = true;
    };
  }, []);

  const requiredAmount = parseUnits(
    invoice.amount,
    USDC_DECIMALS
  );

  const insufficientBalance =
    onArcTestnet &&
    balance !== undefined &&
    balance < requiredAmount;

  const needsApproval =
    onArcTestnet &&
    allowance !== undefined &&
    allowance < requiredAmount;

  /*
   * Existing share URL logic
   */
  useEffect(() => {
    if (
      typeof window !==
      "undefined"
    ) {
      setShareUrl(
        window.location.href
      );
    }
  }, []);

  /*
   * Existing invoice verification
   */
  useEffect(() => {
    let active = true;

    setInvoiceValid(null);

    verifyInvoiceSignature(invoice)
      .then((valid) => {
        if (active) {
          setInvoiceValid(valid);
        }
      })
      .catch(() => {
        if (active) {
          setInvoiceValid(false);
        }
      });

    return () => {
      active = false;
    };
  }, [invoice]);

  /*
   * Existing payment scanner
   */
  const scanForPayment =
    useCallback(async () => {
      if (
        !publicClient ||
        invoiceValid !== true
      ) {
        return;
      }

      try {
        const match =
          await findMatchingPayment(
            publicClient,
            invoice
          );

        if (match) {
          setPayment(match);
          setStatus("paid");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("pending");
      }
    }, [
      publicClient,
      invoice,
      invoiceValid,
    ]);

  useEffect(() => {
    if (invoiceValid !== true) {
      return;
    }

    scanForPayment();

    const interval =
      window.setInterval(
        scanForPayment,
        12_000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    scanForPayment,
    invoiceValid,
  ]);

  /*
   * Existing approval flow
   */
  async function handleApproval(): Promise<boolean> {
    setError(null);
    setApprovalPending(true);

    try {
      const hash =
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: "approve",
          args: [
            PERMIT2_ADDRESS,
            maxUint256,
          ],
          chainId: arcTestnet.id,
        });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt(
          {
            hash,
          }
        );
      }

      const updated =
        await refetchAllowance();

      if (
        updated.data === undefined ||
        updated.data < requiredAmount
      ) {
        setError(
          "USDC approval was not confirmed. Please try again."
        );

        return false;
      }

      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Approval failed.";

      if (
        /user rejected|denied|rejected/i.test(
          message
        )
      ) {
        setError(
          "Approval was rejected in your wallet."
        );
      } else {
        setError(
          message
            .split("\n")[0]
            ?.slice(0, 180) ||
            "Approval failed."
        );
      }

      return false;
    } finally {
      setApprovalPending(false);
    }
  }

  /*
   * Existing payment flow
   */
  async function handlePay() {
    setError(null);

    if (!publicClient) {
      setError(
        "Unable to connect to Arc Testnet."
      );
      return;
    }

    if (!address) {
      setError(
        "Connect your wallet first."
      );
      return;
    }

    if (!onArcTestnet) {
      setError(
        "Switch to Arc Testnet first."
      );
      return;
    }

    if (invoiceValid !== true) {
      setError(
        "This payment request signature is invalid."
      );
      return;
    }

    if (insufficientBalance) {
      setError(
        "Insufficient USDC balance."
      );
      return;
    }

    try {
      if (needsApproval) {
        const approved =
          await handleApproval();

        if (!approved) {
          return;
        }

        const updated =
          await refetchAllowance();

        if (
          updated.data === undefined ||
          updated.data < requiredAmount
        ) {
          setError(
            "Permit2 approval is still insufficient."
          );
          return;
        }
      }

      const deadline = BigInt(
        Math.floor(
          Date.now() / 1000
        ) +
          30 * 60
      );

      const nonce = BigInt(
        invoice.nonce
      );

      const signature =
        await signTypedDataAsync({
          domain: permit2Domain(
            arcTestnet.id,
            PERMIT2_ADDRESS
          ),
          types: permit2Types,
          primaryType:
            "PermitTransferFrom",
          message: {
            permitted: {
              token: USDC_ADDRESS,
              amount: requiredAmount,
            },
            spender:
              PERMIT2_ADDRESS,
            nonce,
            deadline,
          },
        });

      const hash =
        await writeContractAsync({
          address: PERMIT2_ADDRESS,
          abi: permit2Abi,
          functionName:
            "permitTransferFrom",
          args: [
            {
              permitted: {
                token: USDC_ADDRESS,
                amount: requiredAmount,
              },
              nonce,
              deadline,
            },
            {
              to: invoice.recipient as `0x${string}`,
              requestedAmount:
                requiredAmount,
            },
            address,
            signature,
          ],
          chainId: arcTestnet.id,
        });

      setPendingTxHash(hash);
      setConfirming(true);
      setStatus("pending");

      await publicClient.waitForTransactionReceipt(
        {
          hash,
        }
      );

      const verified =
        await verifyPaymentTx(
          publicClient,
          invoice,
          hash
        );

      if (verified) {
        setPayment(verified);
        setStatus("paid");
        setPendingTxHash(null);
      } else {
        setError(
          "The transaction confirmed, but it did not contain this invoice's unique payment nonce."
        );

        setStatus("error");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Transaction failed.";

      if (
        /user rejected|denied|rejected/i.test(
          message
        )
      ) {
        setError(
          "Transaction was rejected in your wallet."
        );
      } else if (
        /insufficient|balance/i.test(
          message
        )
      ) {
        setError(
          "Insufficient USDC balance to complete this payment."
        );
      } else if (
        /deadline/i.test(message)
      ) {
        setError(
          "The payment signature expired. Please try again."
        );
      } else if (
        /nonce/i.test(message)
      ) {
        setError(
          "This payment request has already been used or its nonce is invalid."
        );
      } else {
        setError(
          message
            .split("\n")[0]
            ?.slice(0, 220) ||
            "Transaction failed."
        );
      }
    } finally {
      setConfirming(false);
    }
  }

  /*
   * =============================================================
   * ARC AURORA PAYMENT UI
   * =============================================================
   */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050811] text-white">

      {/* Ambient Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="payment-aurora absolute -left-[30%] -top-[20%] h-[650px] w-[650px] rounded-full bg-blue-600/[0.13] blur-[150px]" />

        <div className="payment-aurora-2 absolute -right-[25%] top-[15%] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.07] blur-[150px]" />

        <div className="payment-aurora-3 absolute bottom-[-25%] left-[20%] h-[600px] w-[600px] rounded-full bg-violet-600/[0.07] blur-[160px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(96,165,250,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,.4) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 80%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 80%)",
          }}
        />

        <div className="absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[560px] px-5 pb-24 pt-6 sm:px-6 sm:pt-10">

        {/* =====================================================
            HEADER
           ===================================================== */}

        <div className="mb-6 flex items-center justify-between">

          <Link
            href="/"
            className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] font-medium text-white/40 backdrop-blur-xl transition hover:border-blue-400/[0.12] hover:bg-blue-500/[0.04] hover:text-white/70"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              ←
            </span>

            New payment
          </Link>

          <WalletWidget />
        </div>

        {/* =====================================================
            MAIN CARD
           ===================================================== */}

        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.085] bg-[#090f18]/80 shadow-[0_35px_100px_-45px_rgba(0,0,0,.95)] backdrop-blur-2xl">

          {/* Aurora edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-cyan-400/20" />

          <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-[80px]" />

          {/* ===================================================
              REQUEST HEADER
             =================================================== */}

          <div className="relative border-b border-white/[0.055] p-6 sm:p-7">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />

                  <span className="relative h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,.65)]" />
                </span>

                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-300/70">
                  Payment request
                </span>
              </div>

              <StatusPill status={status} />
            </div>

            {/* Amount */}
            <div className="mt-7">

              <div className="flex items-end gap-3">

                <span className="font-mono text-[52px] font-semibold leading-none tracking-[-0.07em] text-white sm:text-[58px]">
                  {formatUsdc(
                    invoice.amount
                  )}
                </span>

                <span className="mb-1.5 rounded-full border border-blue-400/10 bg-blue-500/[0.07] px-2.5 py-1 text-[10px] font-bold text-blue-300/75">
                  USDC
                </span>
              </div>

              <p className="mt-4 max-w-[440px] text-[13px] leading-6 text-white/35">
                {invoice.description}
              </p>
            </div>
          </div>

          {/* ===================================================
              DETAILS
             =================================================== */}

          <div className="p-6 sm:p-7">

            <div className="rounded-2xl border border-white/[0.065] bg-white/[0.018] p-4">

              <div className="space-y-4">

                {/* Recipient */}
                <div className="flex items-center justify-between gap-4">

                  <span className="text-[10px] font-medium text-white/25">
                    Recipient
                  </span>

                  <div className="flex min-w-0 items-center gap-2">

                    <a
                      href={explorerAddressUrl(
                        invoice.recipient
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate font-mono text-[10px] font-medium text-white/55 transition hover:text-blue-300"
                    >
                      {shortAddress(
                        invoice.recipient
                      )}
                    </a>

                    <CopyButton
                      value={
                        invoice.recipient
                      }
                      label=""
                      className="text-white/20 transition hover:text-blue-300"
                    />
                  </div>
                </div>

                {/* Network */}
                <div className="flex items-center justify-between">

                  <span className="text-[10px] font-medium text-white/25">
                    Network
                  </span>

                  <span className="flex items-center gap-2 text-[10px] font-semibold text-white/55">

                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-blue-400" />
                    </span>

                    Arc Testnet
                  </span>
                </div>

                {/* Requested */}
                <div className="flex items-center justify-between">

                  <span className="text-[10px] font-medium text-white/25">
                    Requested
                  </span>

                  <span className="text-[10px] font-medium text-white/45">
                    {formatDate(
                      invoice.createdAt
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Invalid invoice */}
            {invoiceValid === false && (
              <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-500/[0.05] px-4 py-4 text-center">

                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-red-400/10 bg-red-500/[0.08] text-xs font-bold text-red-300">
                  !
                </div>

                <p className="mt-3 text-xs font-semibold text-red-300">
                  Invalid payment request
                </p>

                <p className="mt-1 text-[10px] text-red-300/50">
                  Do not send funds to this request.
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-dashed border-white/[0.07] sm:mx-7" />

          {/* ===================================================
              ACTION AREA
             =================================================== */}

          <div className="p-6 sm:p-7">

            {/* =================================================
                PAID
               ================================================= */}

            {status === "paid" &&
            payment ? (
              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-7 text-center">

                <div className="relative mx-auto flex h-16 w-16 items-center justify-center">

                  <div className="absolute inset-0 rounded-full bg-emerald-400/[0.08] blur-xl" />

                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300">
                    <span className="text-2xl font-bold">
                      ✓
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-sm font-semibold text-white/75">
                  Payment confirmed
                </p>

                <p className="mt-1 text-[11px] text-white/30">
                  Your payment has been verified
                  on-chain.
                </p>

                <a
                  href={explorerTxUrl(
                    payment.txHash
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] px-3.5 py-2.5 font-mono text-[10px] font-medium text-emerald-300/70 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.08]"
                >
                  {shortHash(
                    payment.txHash
                  )}

                  <span>↗</span>
                </a>

                <p className="mt-4 text-[10px] text-white/20">
                  Paid from{" "}
                  <span className="font-mono text-white/35">
                    {shortAddress(
                      payment.from
                    )}
                  </span>
                </p>
              </div>

            ) : isRecipient ? (

              /* =================================================
                 RECIPIENT
                 ================================================= */

              <div className="space-y-4">

                <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.04] p-5">

                  <div className="flex items-center gap-3">

                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.08] text-blue-300">

                      <div className="absolute inset-0 rounded-xl bg-blue-500/[0.08] blur-md" />

                      <span className="relative text-lg">
                        ↗
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white/70">
                        This is your request
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-white/25">
                        Share the link below to get paid.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-2">

                  <span className="min-w-0 flex-1 truncate px-2 font-mono text-[9px] text-white/30">
                    {shareUrl}
                  </span>

                  <CopyButton
                    value={shareUrl}
                    label="Copy link"
                    copiedLabel="Copied"
                    className="shrink-0 rounded-xl border border-blue-400/10 bg-blue-500/[0.07] px-3 py-2 text-[10px] font-semibold text-blue-300/75 transition hover:bg-blue-500/[0.11]"
                  />
                </div>
              </div>

            ) : !isConnected ? (

              /* =================================================
                 NOT CONNECTED
                 ================================================= */

              <div className="space-y-4">

                <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.035] p-6 text-center">

                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.08] text-blue-300">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                    >
                      <path
                        d="M5 7.5A2.5 2.5 0 0 1 7.5 5H19a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7.5A2.5 2.5 0 0 1 5 16.5v-9Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />

                      <path
                        d="M5 8h13.5A1.5 1.5 0 0 1 20 9.5V14h-4.5a2.5 2.5 0 1 1 0-5H20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-white/70">
                    Ready to pay?
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-white/25">
                    Connect your wallet to continue.
                  </p>
                </div>

                <div className="flex justify-center">
                  <WalletWidget />
                </div>
              </div>

            ) : !onArcTestnet ? (

              /* =================================================
                 WRONG NETWORK
                 ================================================= */

              <div className="space-y-3">

                <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-5 text-center">

                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/10 bg-amber-400/[0.07] text-amber-300">
                    !
                  </div>

                  <p className="mt-3 text-xs font-semibold text-amber-200/80">
                    Wrong network
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-amber-200/35">
                    Switch your wallet to Arc Testnet
                    to continue.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    switchChain({
                      chainId:
                        arcTestnet.id,
                    })
                  }
                  disabled={switching}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-blue-300/10 bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-xs font-bold text-white shadow-[0_12px_30px_-14px_rgba(37,99,235,.7)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_-12px_rgba(37,99,235,.8)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="relative">
                    {switching
                      ? "Switching…"
                      : "Switch to Arc Testnet"}
                  </span>
                </button>
              </div>

            ) : invoiceValid !== true ? (

              /* =================================================
                 VERIFYING
                 ================================================= */

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] px-5 py-7 text-center">

                <div className="relative mx-auto flex h-10 w-10 items-center justify-center">

                  <div className="absolute inset-0 rounded-full bg-blue-500/[0.08] blur-xl" />

                  <div className="relative h-7 w-7 animate-spin rounded-full border-2 border-blue-400/10 border-t-blue-400" />
                </div>

                <p className="mt-4 text-xs font-semibold text-white/55">
                  Verifying payment request…
                </p>

                <p className="mt-1 text-[10px] leading-5 text-white/20">
                  Checking the signed request before
                  allowing payment.
                </p>
              </div>

            ) : (

              /* =================================================
                 PAYMENT
                 ================================================= */

              <>
                {pendingTxHash &&
                  confirming && (
                    <a
                      href={explorerTxUrl(
                        pendingTxHash
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-4 flex items-center justify-between rounded-2xl border border-blue-400/10 bg-blue-500/[0.045] px-4 py-3.5 font-mono text-[10px] text-blue-300/70 transition hover:bg-blue-500/[0.07]"
                    >
                      <span>
                        Confirming{" "}
                        {shortHash(
                          pendingTxHash
                        )}
                        …
                      </span>

                      <span>↗</span>
                    </a>
                  )}

                {/* Main pay button */}
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={
                    writing ||
                    confirming ||
                    approvalPending ||
                    insufficientBalance
                  }
                  className="payment-aurora-button group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-blue-300/[0.12] bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 py-4 text-sm font-bold text-white shadow-[0_16px_40px_-18px_rgba(37,99,235,.8)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-15px_rgba(37,99,235,.9)] active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-white/[0.05] disabled:bg-white/[0.06] disabled:text-white/20 disabled:shadow-none"
                >

                  {!writing &&
                    !confirming &&
                    !approvalPending &&
                    !insufficientBalance && (
                      <span className="pointer-events-none absolute inset-y-0 left-[-70%] w-[45%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.18] to-transparent transition-transform duration-1000 group-hover:translate-x-[330%]" />
                    )}

                  <span className="relative flex items-center gap-2">

                    {approvalPending
                      ? "Approve USDC for Permit2…"
                      : writing
                      ? "Confirm in wallet…"
                      : confirming
                      ? "Verifying payment…"
                      : insufficientBalance
                      ? "Insufficient USDC balance"
                      : needsApproval
                      ? `Enable ${formatUsdc(
                          invoice.amount
                        )} USDC payment`
                      : `Pay ${formatUsdc(
                          invoice.amount
                        )} USDC`}

                    {!writing &&
                      !confirming &&
                      !approvalPending &&
                      !insufficientBalance && (
                        <span className="text-white/50 transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      )}
                  </span>
                </button>

                <div className="mt-4 flex items-start justify-center gap-2 px-3">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-400/50"
                  >
                    <path
                      d="M12 3.5 19 6v5.2c0 4.2-2.7 7.5-7 9.3-4.3-1.8-7-5.1-7-9.3V6l7-2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      d="m8.8 12 2.1 2.1 4.4-4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <p className="max-w-[370px] text-center text-[9px] leading-5 text-white/20">
                    First-time payers may be asked to
                    approve Permit2 once. Your payment
                    uses a unique invoice nonce so another
                    transfer cannot satisfy this request.
                  </p>
                </div>

                {insufficientBalance &&
                  balance !== undefined && (
                    <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] px-4 py-4 text-center">

                      <p className="text-[10px] font-semibold text-amber-200/70">
                        Balance:{" "}
                        {formatUsdc(
                          formatUnits(
                            balance,
                            USDC_DECIMALS
                          )
                        )}{" "}
                        USDC
                      </p>

                      <p className="mt-1 text-[9px] text-amber-200/30">
                        Get testnet USDC from the
                        faucet in your wallet menu.
                      </p>
                    </div>
                  )}
              </>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-500/[0.045] px-4 py-3.5">

                <div className="flex items-start gap-3">

                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-400/10 bg-red-500/[0.08] text-[10px] font-bold text-red-300">
                    !
                  </div>

                  <p className="pt-0.5 text-[10px] leading-5 text-red-300/70">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            FOOTER
           ===================================================== */}

        <div className="mt-6 flex items-center justify-center gap-2 text-center">

          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/25" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-blue-400/60" />
          </span>

          <span className="text-[9px] text-white/20">
            Payments settle directly wallet-to-wallet on Arc
          </span>
        </div>

        <p className="mt-1 text-center text-[8px] text-white/10">
          Arc Pay never holds your funds.
        </p>
      </div>

      {/* =========================================================
          MOTION
         ========================================================= */}

      <style jsx global>{`
        @keyframes paymentAurora {
          0% {
            transform: translate3d(-6%, -3%, 0) scale(1);
          }

          50% {
            transform: translate3d(10%, 6%, 0) scale(1.08);
          }

          100% {
            transform: translate3d(-6%, -3%, 0) scale(1);
          }
        }

        @keyframes paymentAuroraTwo {
          0% {
            transform: translate3d(5%, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-10%, 8%, 0) scale(1.1);
          }

          100% {
            transform: translate3d(5%, 0, 0) scale(1);
          }
        }

        @keyframes paymentAuroraThree {
          0% {
            transform: translate3d(0, 5%, 0) scale(1);
          }

          50% {
            transform: translate3d(8%, -7%, 0) scale(1.08);
          }

          100% {
            transform: translate3d(0, 5%, 0) scale(1);
          }
        }

        .payment-aurora {
          animation: paymentAurora 20s ease-in-out infinite;
          will-change: transform;
        }

        .payment-aurora-2 {
          animation: paymentAuroraTwo 25s ease-in-out infinite;
          will-change: transform;
        }

        .payment-aurora-3 {
          animation: paymentAuroraThree 30s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .payment-aurora,
          .payment-aurora-2,
          .payment-aurora-3 {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
