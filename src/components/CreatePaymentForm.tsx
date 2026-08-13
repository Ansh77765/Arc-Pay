"use client";

import { useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useRouter } from "next/navigation";
import { arcTestnet } from "@/lib/chain";
import { generateInvoiceId, generateInvoiceNonce, encodeInvoice } from "@/lib/invoice";
import { invoiceDomain, invoiceMessage, invoiceTypes } from "@/lib/paymentRequest";
import { useSignTypedData } from "wagmi";
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
  const canSubmit = onArcTestnet && isValidAmount(amount) && description.trim().length > 0;

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
      const fromBlock = publicClient ? await publicClient.getBlockNumber() : 0n;

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

      const signedInvoice = { ...invoice, signature };
      const token = encodeInvoice(signedInvoice);
      router.push(`/pay/${token}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create the payment link.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-ink-dim">
          Amount
        </label>
        <div className="flex items-center rounded-lg border border-line bg-canvas-panel px-4 transition-colors focus-within:border-accent">
          <input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
            }}
            className="w-full bg-transparent py-3.5 font-mono text-2xl tabular text-ink outline-none placeholder:text-ink-faint"
          />
          <span className="text-sm font-medium text-ink-faint">USDC</span>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink-dim">
          Description
        </label>
        <input
          id="description"
          placeholder="e.g. Design consultation — March"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={140}
          className="w-full rounded-lg border border-line bg-canvas-panel px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
        />
        <p className="mt-1.5 text-right text-xs text-ink-faint">{description.length}/140</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-line-soft bg-canvas-panel/50 px-4 py-3">
        <span className="text-sm text-ink-dim">You&apos;ll receive payment at</span>
        <span className="font-mono text-sm text-ink">
          {address ? shortAddress(address) : "—"}
        </span>
      </div>

      {formError && (
        <p className="rounded-lg border border-bad/25 bg-bad/10 px-4 py-2.5 text-sm text-bad">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-sm font-semibold text-white shadow-pop transition-all hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-faint disabled:shadow-none"
      >
        {submitting ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Creating link…
          </>
        ) : !isConnected ? (
          "Connect your wallet to continue"
        ) : !onArcTestnet ? (
          "Switch to Arc Testnet to continue"
        ) : (
          "Create payment link"
        )}
      </button>
    </form>
  );
}
