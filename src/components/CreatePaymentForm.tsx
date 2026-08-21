"use client";

import { useState } from "react";
import {
  useAccount,
  usePublicClient,
  useSignTypedData,
} from "wagmi";
import { useRouter } from "next/navigation";

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

import type { Invoice } from "@/types/invoice";

export function CreatePaymentForm() {
  const {
    address,
    isConnected,
    chainId,
  } = useAccount();

  const publicClient = usePublicClient({
    chainId: arcTestnet.id,
  });

  const router = useRouter();

  const { signTypedDataAsync } =
    useSignTypedData();

  const [amount, setAmount] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [formError, setFormError] =
    useState<string | null>(null);

  const onArcTestnet =
    isConnected &&
    chainId === arcTestnet.id;

  const canSubmit =
    onArcTestnet &&
    isValidAmount(amount) &&
    description.trim().length > 0;

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

    if (!onArcTestnet) {
      setFormError(
        "Switch to Arc Testnet before creating a payment link."
      );
      return;
    }

    setSubmitting(true);

    try {
      const fromBlock = publicClient
        ? await publicClient.getBlockNumber()
        : 0n;

      const id =
        generateInvoiceId();

      const invoice: Invoice = {
        version: 2,
        id,
        recipient: address,
        amount: amount.trim(),
        description:
          description
            .trim()
            .slice(0, 140),
        createdAt: Date.now(),
        chainId: arcTestnet.id,
        fromBlock: Number(
          fromBlock
        ),
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
          types: invoiceTypes,
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

      router.push(
        `/pay/${token}`
      );
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Could not create the payment link."
      );

      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 space-y-5"
    >

      {/* Amount */}
      <div className="w-full min-w-0">

        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="amount"
            className="text-xs font-semibold text-slate-700"
          >
            Amount
          </label>

          <span className="text-[10px] font-medium text-slate-400">
            USDC
          </span>
        </div>

        <div className="flex h-[62px] w-full min-w-0 items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">

          <input
            id="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="25.00"
            value={amount}
            onChange={(e) => {
              const value =
                e.target.value;

              if (
                value === "" ||
                /^\d*\.?\d*$/.test(
                  value
                )
              ) {
                setAmount(value);
              }
            }}
            className="m-0 h-full min-w-0 w-0 flex-1 border-0 bg-transparent px-4 font-mono text-[22px] leading-none tracking-tight text-slate-900 outline-none placeholder:text-slate-300 focus:outline-none focus:ring-0"
          />

          <div className="flex h-full shrink-0 items-center border-l border-slate-200 bg-slate-50 px-4">
            <span className="text-sm font-bold text-blue-600">
              USDC
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="w-full min-w-0">

        <div className="mb-2 flex items-center justify-between">

          <label
            htmlFor="description"
            className="text-xs font-semibold text-slate-700"
          >
            Description
          </label>

          <span className="text-[10px] font-medium text-slate-400">
            {description.length}/140
          </span>

        </div>

        <input
          id="description"
          type="text"
          autoComplete="off"
          placeholder="Invoice for design work"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          maxLength={140}
          className="box-border h-[54px] w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        />

      </div>

      {/* Fixed payment details */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

        <div className="border-b border-slate-200 px-4 py-3">

          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
            Payment details
          </p>

        </div>

        <div className="space-y-3 px-4 py-4">

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Currency
            </span>

            <span className="text-xs font-semibold text-slate-700">
              USDC
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Network
            </span>

            <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Arc Testnet
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Settlement
            </span>

            <span className="text-xs font-semibold text-emerald-600">
              Direct wallet payment
            </span>
          </div>

        </div>
      </div>

      {/* Receiving wallet */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
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

              <circle
                cx="15.5"
                cy="11.5"
                r=".7"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">

            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Receiving wallet
            </div>

            <div className="mt-1 truncate font-mono text-xs text-slate-700">
              {address
                ? shortAddress(
                    address
                  )
                : "Connect wallet"}
            </div>

          </div>

          {address && (
            <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
              Connected
            </span>
          )}

        </div>
      </div>

      {/* Error */}
      {formError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">
            !
          </div>

          <p className="text-xs leading-5 text-red-600">
            {formError}
          </p>

        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={
          !canSubmit ||
          submitting
        }
        className="group relative flex h-[58px] w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(37,99,235,0.55)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-[0_16px_35px_-12px_rgba(37,99,235,0.65)] active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
      >

        {!submitting &&
          canSubmit && (
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          )}

        <span className="relative">

          {submitting ? (
            <span className="flex items-center gap-2.5">

              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

              Creating link…

            </span>
          ) : !isConnected ? (
            "Connect your wallet to continue"
          ) : !onArcTestnet ? (
            "Switch to Arc Testnet to continue"
          ) : (
            "Create payment link"
          )}

        </span>
      </button>

      {/* Security note */}
      <div className="flex items-start justify-center gap-2 px-3">

        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
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

        <p className="text-center text-[10px] leading-5 text-slate-400">
          Your wallet signs the request.
          Funds are sent directly to your wallet —
          Arc Pay never holds them.
        </p>

      </div>

    </form>
  );
}
