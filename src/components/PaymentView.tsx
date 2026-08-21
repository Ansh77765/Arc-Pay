"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSignTypedData,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  maxUint256,
  parseUnits,
  formatUnits,
  type PublicClient,
} from "viem";

import { arcTestnet } from "@/lib/chain";
import { erc20Abi } from "@/lib/erc20";
import {
  PERMIT2_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
  explorerTxUrl,
  explorerAddressUrl,
} from "@/lib/config";
import {
  formatUsdc,
  formatDate,
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

export function PaymentView({
  invoice,
}: {
  invoice: Invoice;
}) {
  const { address, isConnected, chainId } =
    useAccount();

  const publicClient = usePublicClient({
    chainId: arcTestnet.id,
  });

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
    address?.toLowerCase() ===
    invoice.recipient.toLowerCase();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

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

  const requiredAmount = parseUnits(
    invoice.amount,
    USDC_DECIMALS
  );

  const { data: balance } =
    useReadContract({
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

  const insufficientBalance =
    onArcTestnet &&
    balance !== undefined &&
    balance < requiredAmount;

  const needsApproval =
    onArcTestnet &&
    allowance !== undefined &&
    allowance < requiredAmount;

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
            publicClient as PublicClient,
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
    scanForPayment();

    const interval = setInterval(
      scanForPayment,
      12_000
    );

    return () => {
      clearInterval(interval);
    };
  }, [scanForPayment]);

  async function handleApproval(): Promise<boolean> {
    setError(null);
    setApprovalPending(true);

    try {
      if (!publicClient) {
        throw new Error(
          "Network client is unavailable."
        );
      }

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

      await publicClient.waitForTransactionReceipt(
        { hash }
      );

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
            ?.slice(0, 180) ??
            "Approval failed."
        );
      }

      return false;
    } finally {
      setApprovalPending(false);
    }
  }

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
            spender: address,
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
        { hash }
      );

      const verified =
        await verifyPaymentTx(
          publicClient as PublicClient,
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
            ?.slice(0, 220) ??
            "Transaction failed."
        );
      }
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[480px] px-5 pb-24 pt-8 sm:pt-12">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-blue-600"
          >
            <span className="transition group-hover:-translate-x-0.5">
              ←
            </span>
            New link
          </Link>

          <WalletWidget />
        </div>

        {/* Main payment card */}
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">

          {/* Request section */}
          <div className="space-y-6 p-6 sm:p-7">

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Payment request
              </span>

              <StatusPill status={status} />
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-baseline gap-2">
                <p className="font-mono text-[42px] font-semibold tracking-[-0.045em] text-slate-900">
                  {formatUsdc(
                    invoice.amount
                  )}
                </p>

                <span className="text-lg font-semibold text-blue-600">
                  USDC
                </span>
              </div>

              <p className="mt-2 text-[15px] leading-6 text-slate-500">
                {invoice.description}
              </p>
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

              <div className="space-y-4">

                {/* Recipient */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-slate-400">
                    Recipient
                  </span>

                  <span className="flex min-w-0 items-center gap-2">
                    <a
                      href={explorerAddressUrl(
                        invoice.recipient
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate font-mono text-xs font-medium text-slate-700 transition hover:text-blue-600"
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
                      className="text-slate-400 hover:text-blue-600"
                    />
                  </span>
                </div>

                {/* Network */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    Network
                  </span>

                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Arc Testnet
                  </span>
                </div>

                {/* Requested */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    Requested
                  </span>

                  <span className="text-xs font-medium text-slate-700">
                    {formatDate(
                      invoice.createdAt
                    )}
                  </span>
                </div>

              </div>
            </div>

            {/* Invalid invoice */}
            {invoiceValid === false && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-red-600">
                  Invalid payment request
                </p>

                <p className="mt-1 text-xs text-red-500">
                  Do not send funds to this request.
                </p>
              </div>
            )}

          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200" />

          {/* Payment action */}
          <div className="space-y-4 p-6 sm:p-7">

            {/* Paid */}
            {status === "paid" &&
            payment ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <span className="text-2xl font-bold">
                    ✓
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-800">
                  Payment confirmed
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your payment has been verified
                  on-chain.
                </p>

                <a
                  href={explorerTxUrl(
                    payment.txHash
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 font-mono text-xs font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {shortHash(
                    payment.txHash
                  )}
                  <span>↗</span>
                </a>

                <p className="mt-3 text-xs text-slate-400">
                  Paid from{" "}
                  <span className="font-mono">
                    {shortAddress(
                      payment.from
                    )}
                  </span>
                </p>
              </div>

            ) : isRecipient ? (

              /* Recipient */
              <div className="space-y-4">

                <div className="rounded-2xl bg-blue-50 p-5 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <span className="text-lg">
                      ↗
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    This is your request
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Share the link below to get paid.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-500">
                    {shareUrl}
                  </span>

                  <CopyButton
                    value={shareUrl}
                    label="Copy link"
                    copiedLabel="Copied"
                    className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-blue-600 shadow-sm hover:bg-blue-50"
                  />
                </div>
              </div>

            ) : !isConnected ? (

              /* Not connected */
              <div className="space-y-4">

                <div className="rounded-2xl bg-blue-50 px-5 py-4 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    Ready to pay?
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Connect your wallet to continue.
                  </p>
                </div>

                <div className="flex justify-center">
                  <WalletWidget />
                </div>

              </div>

            ) : !onArcTestnet ? (

              /* Wrong network */
              <div className="space-y-3">

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-800">
                    Wrong network
                  </p>

                  <p className="mt-1 text-xs text-amber-700/70">
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
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {switching
                    ? "Switching…"
                    : "Switch to Arc Testnet"}
                </button>

              </div>

            ) : invoiceValid !== true ? (

              /* Invoice verification */
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Verifying payment request…
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Checking the signed request before
                  allowing payment.
                </p>
              </div>

            ) : (

              /* Payment */
              <>
                {/* Pending transaction */}
                {pendingTxHash &&
                  confirming && (
                    <a
                      href={explorerTxUrl(
                        pendingTxHash
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 font-mono text-xs text-blue-700 transition hover:bg-blue-100"
                    >
                      <span>
                        Confirming{" "}
                        {shortHash(
                          pendingTxHash
                        )}
                        …
                      </span>

                      <span>
                        ↗
                      </span>
                    </a>
                  )}

                {/* Pay button */}
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={
                    writing ||
                    confirming ||
                    approvalPending ||
                    insufficientBalance
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 hover:shadow-[0_10px_24px_rgba(37,99,235,0.24)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {approvalPending ? (
                    "Approve USDC for Permit2…"
                  ) : writing ? (
                    "Confirm in wallet…"
                  ) : confirming ? (
                    "Verifying payment…"
                  ) : insufficientBalance ? (
                    "Insufficient USDC balance"
                  ) : needsApproval ? (
                    `Enable ${formatUsdc(
                      invoice.amount
                    )} USDC payment`
                  ) : (
                    `Pay ${formatUsdc(
                      invoice.amount
                    )} USDC`
                  )}
                </button>

                <p className="text-center text-[11px] leading-5 text-slate-400">
                  First-time payers may be asked to
                  approve Permit2 once. Your payment
                  uses a unique invoice nonce so
                  another transfer cannot satisfy this
                  request.
                </p>

                {/* Balance */}
                {insufficientBalance &&
                  balance !== undefined && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                      <p className="text-xs font-medium text-amber-800">
                        Balance:{" "}
                        {formatUsdc(
                          formatUnits(
                            balance,
                            USDC_DECIMALS
                          )
                        )}{" "}
                        USDC
                      </p>

                      <p className="mt-1 text-[10px] text-amber-700/70">
                        Get testnet USDC from the
                        faucet in your wallet menu.
                      </p>
                    </div>
                  )}
              </>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <ShieldIcon />

          <span>
            Payments settle directly wallet-to-wallet
            on Arc.
          </span>
        </div>

        <p className="mt-1 text-center text-[10px] text-slate-400">
          Arc Pay never holds your funds.
        </p>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0 text-blue-500"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 6.2v5.1c0 4.3-2.7 7.5-7 9.2-4.3-1.7-7-4.9-7-9.2V6.2L12 3.5Z"
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
  );
}
