"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useSignTypedData } from "wagmi";
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
import { isValidAmount, shortAddress } from "@/lib/format";
import type { Invoice } from "@/types/invoice";

export function CreatePaymentForm() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const router = useRouter();
  const { signTypedDataAsync } = useSignTypedData();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onArcTestnet = isConnected && chainId === arcTestnet.id;

  const canSubmit =
    onArcTestnet &&
    isValidAmount(amount) &&
    description.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!address) {
      setFormError("Connect your wallet first.");
      return;
    }

    if (!isValidAmount(amount)) {
      setFormError("Enter a valid USDC amount greater than 0.");
      return;
    }

    if (!description.trim()) {
      setFormError("Add a short description.");
      return;
    }

    setSubmitting(true);

    try {
      const fromBlock = publicClient
        ? await publicClient.getBlockNumber()
        : 0n;

      const id = generateInvoiceId();

      const invoice: Invoice = {
        version: 2,
        id,
        recipient: address,
        amount: amount.trim(),
        description: description.trim().slice(0, 140),
        createdAt: Date.now(),
        chainId: arcTestnet.id,
        fromBlock: Number(fromBlock),
        nonce: generateInvoiceNonce(id),
        signature: "0x",
      };

      const signature = await signTypedDataAsync({
        domain: invoiceDomain(invoice.chainId),
        types: invoiceTypes,
        primaryType: "PaymentRequest",
        message: invoiceMessage(invoice),
      });

      const signedInvoice = {
        ...invoice,
        signature,
      };

      const token = encodeInvoice(signedInvoice);

      router.push(`/pay/${token}`);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="mb-2.5 block text-sm font-medium text-white/75"
        >
          Amount
        </label>

        <div className="group flex h-[66px] w-full items-center overflow-hidden rounded-xl border border-white/[0.10] bg-[#070b13] transition-all duration-200 focus-within:border-blue-500/70 focus-within:ring-4 focus-within:ring-blue-500/[0.08]">
          <input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;

              if (v === "" || /^\d*\.?\d*$/.test(v)) {
                setAmount(v);
              }
            }}
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-5 font-mono text-[25px] tracking-tight text-white outline-none ring-0 placeholder:text-white/25 focus:border-0 focus:outline-none focus:ring-0"
          />

          <div className="flex h-full shrink-0 items-center border-l border-white/[0.07] px-5">
            <span className="text-sm font-semibold text-white/45">
              USDC
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <label
            htmlFor="description"
            className="text-sm font-medium text-white/75"
          >
            Description
            <span className="ml-1 font-normal text-white/30">
              (optional)
            </span>
          </label>

          <span className="text-xs text-white/30">
            {description.length}/140
          </span>
        </div>

        <input
          id="description"
          placeholder="e.g. Design consultation — March"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={140}
          className="h-[58px] w-full rounded-xl border border-white/[0.10] bg-[#070b13] px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/25 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/[0.08]"
        />
      </div>

      {/* Recipient */}
      <div>
        <label className="mb-2.5 block text-sm font-medium text-white/75">
          You&apos;ll receive payment at
        </label>

        <div className="flex min-h-[58px] items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4">
          <span className="text-sm text-white/40">
            Connected wallet
          </span>

          <span className="max-w-[180px] truncate font-mono text-sm text-white/65">
            {address ? shortAddress(address) : "—"}
          </span>
        </div>
      </div>

      {/* Error */}
      {formError && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3">
          <p className="text-sm leading-5 text-red-300">
            {formError}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="group relative flex h-[60px] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#4f46e5] via-[#4169e1] to-[#2563eb] text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(59,91,219,0.7)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_35px_-10px_rgba(59,91,219,0.85)] active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-white/[0.07] disabled:bg-none disabled:text-white/25 disabled:shadow-none"
      >
        {!submitting && canSubmit && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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

      <p className="text-center text-[11px] leading-5 text-white/25">
        Your payment request is signed by your wallet and settled
        directly on Arc Testnet.
      </p>
    </form>
  );
}
