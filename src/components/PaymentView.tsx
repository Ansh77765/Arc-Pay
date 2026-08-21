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
import { CopyButton } from "./CopyButton";

import type { Invoice } from "@/types/invoice";

import Link from "next/link";

const PAYMENT_DURATION = 10 * 60 * 1000;

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

  const {
    signTypedDataAsync,
  } = useSignTypedData();

  const [status, setStatus] =
    useState<
      "checking" |
      "pending" |
      "paid" |
      "error"
    >("checking");

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

  /* ============================================================
     10 MINUTE PAYMENT TIMER

     invoice.createdAt is already Date.now() milliseconds.
     ============================================================ */

  const expiresAt =
    invoice.createdAt +
    PAYMENT_DURATION;

  const [timeLeft, setTimeLeft] =
    useState(() =>
      Math.max(
        0,
        expiresAt - Date.now()
      )
    );

  useEffect(() => {
    const tick = () => {
      setTimeLeft(
        Math.max(
          0,
          expiresAt - Date.now()
        )
      );
    };

    tick();

    const interval =
      window.setInterval(
        tick,
        1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [expiresAt]);

  const requestExpired =
    timeLeft <= 0;

  /* ============================================================
     NETWORK
     ============================================================ */

  const onArcTestnet =
    isConnected &&
    chainId === arcTestnet.id;

  const isRecipient =
    Boolean(address) &&
    address?.toLowerCase() ===
      invoice.recipient.toLowerCase();

  /* ============================================================
     USDC BALANCE
     ============================================================ */

  const {
    data: balance,
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

  /* ============================================================
     PERMIT2 ALLOWANCE
     ============================================================ */

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

  /* ============================================================
     PUBLIC CLIENT
     ============================================================ */

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

  /* ============================================================
     AMOUNT
     ============================================================ */

  const requiredAmount =
    parseUnits(
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

  /* ============================================================
     SHARE URL
     ============================================================ */

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

  /* ============================================================
     VERIFY INVOICE
     ============================================================ */

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

  /* ============================================================
     FIND EXISTING PAYMENT
     ============================================================ */

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
    if (
      invoiceValid !== true
    ) {
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

  /* ============================================================
     APPROVAL
     ============================================================ */

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
        await publicClient.waitForTransactionReceipt({
          hash,
        });
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

  /* ============================================================
     PAYMENT
     ============================================================ */

  async function handlePay() {
    setError(null);

    if (requestExpired) {
      setError(
        "This payment request has expired."
      );
      return;
    }

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

      /*
       * Permit2 deadline cannot be longer
       * than the payment request lifetime.
       */

      const remainingSeconds =
        Math.max(
          1,
          Math.floor(
            timeLeft / 1000
          )
        );

      const deadline =
        BigInt(
          Math.floor(
            Date.now() / 1000
          ) +
            remainingSeconds
        );

      const nonce =
        BigInt(
          invoice.nonce
        );

      const signature =
        await signTypedDataAsync({
          domain:
            permit2Domain(
              arcTestnet.id,
              PERMIT2_ADDRESS
            ),
          types:
            permit2Types,
          primaryType:
            "PermitTransferFrom",
          message: {
            permitted: {
              token:
                USDC_ADDRESS,
              amount:
                requiredAmount,
            },
            spender:
              PERMIT2_ADDRESS,
            nonce,
            deadline,
          },
        });

      const hash =
        await writeContractAsync({
          address:
            PERMIT2_ADDRESS,
          abi:
            permit2Abi,
          functionName:
            "permitTransferFrom",
          args: [
            {
              permitted: {
                token:
                  USDC_ADDRESS,
                amount:
                  requiredAmount,
              },
              nonce,
              deadline,
            },
            {
              to:
                invoice.recipient as `0x${string}`,
              requestedAmount:
                requiredAmount,
            },
            address,
            signature,
          ],
          chainId:
            arcTestnet.id,
        });

      setPendingTxHash(hash);
      setConfirming(true);
      setStatus("pending");

      await publicClient.waitForTransactionReceipt({
        hash,
      });

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
        /deadline/i.test(
          message
        )
      ) {
        setError(
          "The payment signature expired. Please try again."
        );
      } else if (
        /nonce/i.test(
          message
        )
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

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="min-h-screen bg-white text-[#111111]">

      {/* HEADER */}

      <header className="border-b border-[#E7E7EA] bg-white">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 sm:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#111111]">
              <span className="text-[15px] font-bold text-white">
                A
              </span>
            </div>

            <div className="leading-none">
              <p className="text-[14px] font-semibold tracking-[-0.02em]">
                Arc Pay
              </p>

              <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.15em] text-[#96979F]">
                Payments
              </p>
            </div>
          </Link>

          <WalletWidget />
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-[720px] px-5 pb-20 pt-8 sm:px-8 sm:pt-12">

        {/* TOP BAR */}

        <div className="mb-5 flex items-center justify-between gap-3">

          <Link
            href="/"
            className="rounded-full border border-[#E7E7EA] px-3.5 py-2 text-[10px] font-medium text-[#66676E] transition hover:bg-[#F7F7F8]"
          >
            ← New payment
          </Link>

          <span
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[9px] font-semibold ${
              requestExpired
                ? "border-[#F0D5D5] bg-[#FFF8F8] text-[#C65C5C]"
                : status === "paid"
                ? "border-[#DCEDE3] bg-[#F5FBF7] text-[#31A66A]"
                : "border-[#E7E7EA] bg-[#F7F7F8] text-[#66676E]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                requestExpired
                  ? "bg-[#D65A5A]"
                  : status === "paid"
                  ? "bg-[#31A66A]"
                  : "bg-[#777880]"
              }`}
            />

            {requestExpired
              ? "Expired"
              : status === "paid"
              ? "Paid"
              : "Awaiting payment"}
          </span>
        </div>

        {/* CARD */}

        <section className="overflow-hidden rounded-[24px] border border-[#E7E7EA] bg-white shadow-[0_20px_60px_-35px_rgba(0,0,0,.18)]">

          {/* SUMMARY */}

          <div className="border-b border-[#EEEEF1] px-6 py-7 sm:px-8">

            <div className="flex items-start justify-between gap-5">

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-[#5B72D8]" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#85868E]">
                    Payment request
                  </span>
                </div>

                <h1 className="mt-4 text-[42px] font-semibold tracking-[-0.055em] sm:text-[50px]">
                  {formatUsdc(
                    invoice.amount
                  )}

                  <span className="ml-2 text-[15px] font-semibold tracking-normal text-[#777880]">
                    USDC
                  </span>
                </h1>

                <p className="mt-3 max-w-[450px] text-[12px] leading-5 text-[#85868E]">
                  {invoice.description}
                </p>
              </div>

              {/* TIMER */}

              <PaymentCountdown
                timeLeft={
                  timeLeft
                }
                expired={
                  requestExpired
                }
              />
            </div>
          </div>

          {/* DETAILS */}

          <div className="px-6 py-6 sm:px-8">

            <div className="rounded-[18px] border border-[#E7E7EA] bg-[#FAFAFA] p-5">

              <DetailRow
                label="Recipient"
                value={
                  <div className="flex items-center gap-2">

                    <a
                      href={explorerAddressUrl(
                        invoice.recipient
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10px] font-medium text-[#55565D] hover:text-[#111111]"
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
                    />
                  </div>
                }
              />

              <div className="my-4 border-t border-[#EEEEF1]" />

              <DetailRow
                label="Network"
                value={
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#31A66A]" />
                    Arc Testnet
                  </span>
                }
              />

              <div className="my-4 border-t border-[#EEEEF1]" />

              <DetailRow
                label="Requested"
                value={formatDate(
                  invoice.createdAt
                )}
              />
            </div>

            {invoiceValid === false && (
              <div className="mt-4 rounded-[16px] border border-[#F0D5D5] bg-[#FFF8F8] px-4 py-4 text-center">

                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#FBEAEA] text-[11px] font-bold text-[#D65A5A]">
                  !
                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#B84D4D]">
                  Invalid payment request
                </p>

                <p className="mt-1 text-[9px] text-[#C47777]">
                  Do not send funds to this request.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#EEEEF1]" />

          {/* ACTION AREA */}

          <div className="p-6 sm:p-8">

            {/* PAID */}

            {status === "paid" &&
            payment ? (

              <div className="rounded-[18px] border border-[#DCEDE3] bg-[#F6FBF8] p-7 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF7EF] text-[#31A66A]">
                  <span className="text-2xl font-bold">
                    ✓
                  </span>
                </div>

                <p className="mt-5 text-[15px] font-semibold text-[#33343A]">
                  Payment confirmed
                </p>

                <p className="mt-1 text-[11px] text-[#85868E]">
                  Your payment has been verified on-chain.
                </p>

                <a
                  href={explorerTxUrl(
                    payment.txHash
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-[11px] border border-[#DCEDE3] bg-white px-3.5 py-2.5 font-mono text-[10px] font-medium text-[#31A66A]"
                >
                  {shortHash(
                    payment.txHash
                  )}

                  <span>↗</span>
                </a>

                <p className="mt-4 text-[10px] text-[#999AA2]">
                  Paid from{" "}
                  <span className="font-mono text-[#55565D]">
                    {shortAddress(
                      payment.from
                    )}
                  </span>
                </p>
              </div>

            ) : isRecipient ? (

              /* RECIPIENT */

              <div className="space-y-4">

                <div className="rounded-[18px] border border-[#E7E7EA] bg-[#F7F7F8] p-5">

                  <p className="text-[12px] font-semibold text-[#33343A]">
                    This is your request
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-[#85868E]">
                    Share the link below to get paid.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-[14px] border border-[#E7E7EA] bg-[#F7F7F8] p-2">

                  <span className="min-w-0 flex-1 truncate px-2 font-mono text-[9px] text-[#777880]">
                    {shareUrl}
                  </span>

                  <CopyButton
                    value={shareUrl}
                    label="Copy link"
                    copiedLabel="Copied"
                    className="shrink-0 rounded-[10px] bg-[#111111] px-3 py-2 text-[9px] font-semibold text-white"
                  />
                </div>
              </div>

            ) : !isConnected ? (

              /* CONNECT */

              <div className="rounded-[18px] border border-[#E7E7EA] bg-[#FAFAFA] p-6 text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#777880] shadow-sm">
                  <span className="text-lg">
                    ₿
                  </span>
                </div>

                <p className="mt-4 text-[13px] font-semibold text-[#33343A]">
                  Connect your wallet
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#85868E]">
                  Connect your wallet to pay this request.
                </p>

                <div className="mt-5 flex justify-center">
                  <WalletWidget />
                </div>
              </div>

            ) : !onArcTestnet ? (

              /* WRONG NETWORK */

              <div className="space-y-3">

                <div className="rounded-[18px] border border-[#F0E2C8] bg-[#FFFBF4] p-5 text-center">

                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#FFF1D6] text-[#C58A28]">
                    !
                  </div>

                  <p className="mt-3 text-[11px] font-semibold text-[#755522]">
                    Wrong network
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-[#A47A3A]">
                    Switch your wallet to Arc Testnet to continue.
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
                  disabled={
                    switching
                  }
                  className="h-12 w-full rounded-[13px] bg-[#111111] text-[11px] font-semibold text-white transition hover:bg-[#292929] disabled:bg-[#EEEEF0] disabled:text-[#A0A1A8]"
                >
                  {switching
                    ? "Switching…"
                    : "Switch to Arc Testnet"}
                </button>
              </div>

            ) : invoiceValid !== true ? (

              /* VERIFYING */

              <div className="rounded-[18px] border border-[#E7E7EA] bg-[#FAFAFA] px-5 py-8 text-center">

                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#E2E2E5] border-t-[#111111]" />

                <p className="mt-4 text-[12px] font-semibold text-[#55565D]">
                  Verifying payment request…
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#999AA2]">
                  Checking the signed request before allowing payment.
                </p>
              </div>

            ) : requestExpired ? (

              /* EXPIRED */

              <div className="rounded-[18px] border border-[#F0D5D5] bg-[#FFF8F8] p-7 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBEAEA] text-[#D65A5A]">
                  !
                </div>

                <p className="mt-4 text-[14px] font-semibold text-[#B84D4D]">
                  Payment request expired
                </p>

                <p className="mx-auto mt-1 max-w-[320px] text-[10px] leading-5 text-[#C47777]">
                  This request was valid for 10 minutes.
                  Ask the sender to create a new payment link.
                </p>
              </div>

            ) : (

              /* PAYMENT */

              <>
                {pendingTxHash &&
                  confirming && (
                    <a
                      href={explorerTxUrl(
                        pendingTxHash
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-4 flex items-center justify-between rounded-[14px] border border-[#E1E7F2] bg-[#F7F9FC] px-4 py-3.5 font-mono text-[10px] text-[#667085]"
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

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={
                    writing ||
                    confirming ||
                    approvalPending ||
                    insufficientBalance ||
                    requestExpired
                  }
                  className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#111111] text-[12px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#EEEEF0] disabled:text-[#A0A1A8]"
                >
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
                      <span className="text-white/45 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    )}
                </button>

                <div className="mt-4 flex items-start justify-center gap-2 px-3">

                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#D8D9DD] text-[8px] text-[#777880]">
                    ✓
                  </div>

                  <p className="max-w-[400px] text-center text-[9px] leading-5 text-[#999AA2]">
                    Your wallet signs the payment.
                    Funds are sent directly to the recipient —
                    Arc Pay never holds them.
                  </p>
                </div>

                {insufficientBalance &&
                  balance !== undefined && (
                    <div className="mt-4 rounded-[14px] border border-[#F0E2C8] bg-[#FFFBF4] px-4 py-3">

                      <div className="flex items-center justify-between">

                        <span className="text-[10px] font-medium text-[#8B6B38]">
                          Your USDC balance
                        </span>

                        <span className="font-mono text-[10px] font-semibold text-[#755522]">
                          {formatUsdc(
                            formatUnits(
                              balance,
                              USDC_DECIMALS
                            )
                          )}{" "}
                          USDC
                        </span>
                      </div>

                      <p className="mt-1 text-[9px] text-[#A47A3A]">
                        Add more USDC to complete this payment.
                      </p>
                    </div>
                  )}

                {error && (
                  <div className="mt-4 rounded-[14px] border border-[#F0D5D5] bg-[#FFF8F8] px-4 py-3">

                    <p className="text-[10px] font-semibold text-[#B84D4D]">
                      Payment could not be completed
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-[#C47777]">
                      {error}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <div className="mt-5 flex items-center justify-center gap-2 text-[9px] text-[#A0A1A8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#31A66A]" />
          Direct wallet-to-wallet payment on Arc
        </div>

        <p className="mt-2 text-center text-[9px] text-[#B0B1B7]">
          Arc Pay never holds your funds.
        </p>
      </main>
    </div>
  );
}

/* ============================================================
   DETAIL ROW
   ============================================================ */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] font-medium text-[#96979F]">
        {label}
      </span>

      <span className="text-[10px] font-semibold text-[#55565D]">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   COUNTDOWN
   ============================================================ */

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

  const radius = 18;

  const circumference =
    2 *
    Math.PI *
    radius;

  const dashOffset =
    circumference *
    (1 - progress);

  const timeText =
    `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

  return (
    <div
      className={`flex shrink-0 items-center gap-2.5 rounded-[14px] border px-3 py-2.5 ${
        expired
          ? "border-[#F0D5D5] bg-[#FFF8F8]"
          : "border-[#E7E7EA] bg-[#F7F7F8]"
      }`}
    >
      <div className="relative h-11 w-11">

        <svg
          viewBox="0 0 44 44"
          className="h-11 w-11 -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="#E1E2E5"
            strokeWidth="2.5"
          />

          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={
              expired
                ? "#D65A5A"
                : "#111111"
            }
            strokeWidth="2.5"
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

        <span
          className={`absolute inset-0 flex items-center justify-center text-[8px] font-bold ${
            expired
              ? "text-[#D65A5A]"
              : "text-[#55565D]"
          }`}
        >
          {expired
            ? "!"
            : `${minutes}m`}
        </span>
      </div>

      <div className="hidden sm:block">

        <p
          className={`font-mono text-[12px] font-semibold tabular-nums ${
            expired
              ? "text-[#D65A5A]"
              : "text-[#33343A]"
          }`}
        >
          {timeText}
        </p>

        <p
          className={`mt-0.5 text-[8px] uppercase tracking-[0.08em] ${
            expired
              ? "text-[#C47777]"
              : "text-[#999AA2]"
          }`}
        >
          {expired
            ? "Expired"
            : "Expires"}
        </p>
      </div>
    </div>
  );
}
