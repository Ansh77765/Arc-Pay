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

  const publicClient = usePublicClient({
    chainId: arcTestnet.id,
  });

  const router = useRouter();

  const { signTypedDataAsync } = useSignTypedData();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onArcTestnet =
    isConnected && chainId === arcTestnet.id;

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
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 space-y-5"
    >
      {/* Amount */}
      <div className="w-full min-w-0">
        <label
          htmlFor="amount"
          className="mb-2 block text-sm font-medium text-white/70"
        >
          Amount
        </label>

        <div
          className="
            flex
            h-[62px]
            w-full
            min-w-0
            items-center
            overflow-hidden
            rounded-xl
            border
            border-white/[0.10]
            bg-[#070b13]
            transition-colors
            focus-within:border-blue-500/60
          "
        >
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="25.00"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;

              if (
                value === "" ||
                /^\d*\.?\d*$/.test(value)
              ) {
                setAmount(value);
              }
            }}
            style={{
              border: "none",
              outline: "none",
              boxShadow: "none",
              appearance: "none",
              WebkitAppearance: "none",
            }}
            className="
              m-0
              h-full
              min-w-0
              w-0
              flex-1
              bg-transparent
              px-4
              font-mono
              text-[22px]
              leading-none
              tracking-tight
              text-white
              placeholder:text-white/20
            "
          />

          <div className="flex h-full shrink-0 items-center border-l border-white/[0.07] px-4">
            <span className="text-sm font-semibold text-white/40">
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
            className="text-sm font-medium text-white/70"
          >
            Description
          </label>

          <span className="text-[11px] text-white/25">
            {description.length}/140
          </span>
        </div>

        <input
          id="description"
          type="text"
          autoComplete="off"
          placeholder="Invoice for design work"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={140}
          style={{
            outline: "none",
          }}
          className="
            box-border
            h-[54px]
            w-full
            min-w-0
            rounded-xl
            border
            border-white/[0.10]
            bg-[#070b13]
            px-4
            text-sm
            text-white
            transition-colors
            placeholder:text-white/20
            focus:border-blue-500/60
          "
        />
      </div>

      {/* Fixed parameters */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
          Fixed payment network
        </p>

        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="text-sm text-white/55">
            Currency
          </span>

          <span className="text-sm font-medium text-white/70">
            USDC
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-4">
          <span className="text-sm text-white/55">
            Network
          </span>

          <span className="text-sm font-medium text-white/70">
            Arc Testnet
          </span>
        </div>
      </div>

      {/* Recipient */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.018] px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-white/40">
            Receiving wallet
          </span>

          <span className="min-w-0 truncate font-mono text-xs text-white/60">
            {address ? shortAddress(address) : "Connect wallet"}
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
        style={{
          outline: "none",
        }}
        className="
          group
          relative
          flex
          h-[58px]
          w-full
          items-center
          justify-center
          overflow-hidden
          rounded-xl
          bg-[#4f6ff5]
          text-sm
          font-semibold
          text-white
          shadow-[0_12px_30px_-12px_rgba(79,111,245,.7)]
          transition-all
          duration-200
          hover:-translate-y-[1px]
          hover:bg-[#5878fa]
          hover:shadow-[0_16px_35px_-12px_rgba(79,111,245,.8)]
          active:translate-y-0
          disabled:cursor-not-allowed
          disabled:translate-y-0
          disabled:bg-white/[0.07]
          disabled:text-white/25
          disabled:shadow-none
        "
      >
        {!submitting && canSubmit && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.10] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
        Your wallet signs the request. Funds are sent directly
        to your wallet — Arc Pay never holds them.
      </p>
    </form>
  );
}
