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
      className="w-full min-w-0 space-y-4"
    >
      {/* =========================================================
          AMOUNT
         ========================================================= */}

      <div className="w-full min-w-0">

        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="amount"
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45"
          >
            Amount
          </label>

          <span className="rounded-full border border-blue-400/10 bg-blue-500/[0.07] px-2.5 py-1 text-[9px] font-bold tracking-wide text-blue-300/80">
            USDC
          </span>
        </div>

        <div className="group relative flex h-[72px] w-full min-w-0 items-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070d17]/90 shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_10px_30px_-20px_rgba(0,0,0,.8)] transition-all duration-300 focus-within:border-blue-400/40 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,.06),0_15px_40px_-25px_rgba(37,99,235,.4)]">

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/[0.025] via-transparent to-cyan-400/[0.025]" />

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
            className="relative z-10 m-0 h-full min-w-0 w-0 flex-1 bg-transparent px-5 font-mono text-[27px] font-semibold leading-none tracking-[-0.045em] text-white placeholder:text-white/[0.12]"
          />

          <div className="relative z-10 flex h-full shrink-0 items-center border-l border-white/[0.06] bg-white/[0.018] px-5">

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,.65)]" />

              <span className="text-[12px] font-bold text-white/55">
                USDC
              </span>

            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          DESCRIPTION
         ========================================================= */}

      <div className="w-full min-w-0">

        <div className="mb-2 flex items-center justify-between">

          <label
            htmlFor="description"
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45"
          >
            Description
          </label>

          <span className="font-mono text-[9px] tabular-nums text-white/20">
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
            setDescription(e.target.value)
          }
          maxLength={140}
          style={{
            outline: "none",
          }}
          className="box-border h-[56px] w-full min-w-0 rounded-2xl border border-white/[0.08] bg-[#070d17]/90 px-4 text-[12px] font-medium text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,.02)] transition-all duration-300 placeholder:text-white/[0.12] focus:border-blue-400/35 focus:bg-[#09101c] focus:shadow-[0_0_0_4px_rgba(59,130,246,.05)]"
        />
      </div>

      {/* =========================================================
          PAYMENT DETAILS
         ========================================================= */}

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018]">

        <div className="flex items-center gap-3 border-b border-white/[0.055] px-4 py-3.5">

          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.08] text-blue-300">

            <span className="absolute inset-0 rounded-xl bg-blue-500/[0.08] blur-md" />

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="relative h-4 w-4"
              aria-hidden="true"
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
          </div>

          <div>
            <p className="text-[11px] font-semibold text-white/65">
              Payment details
            </p>

            <p className="mt-0.5 text-[9px] text-white/25">
              Fixed for this request
            </p>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">

          <DetailRow
            label="Currency"
            value="USDC"
          />

          <DetailRow
            label="Network"
            value={
              <span className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-blue-400" />
                </span>

                Arc Testnet
              </span>
            }
          />

          <DetailRow
            label="Settlement"
            value={
              <span className="text-emerald-300/70">
                Direct wallet payment
              </span>
            }
          />

        </div>
      </div>

      {/* =========================================================
          RECEIVING WALLET
         ========================================================= */}

      <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 transition-all duration-300 hover:border-blue-400/[0.12] hover:bg-blue-500/[0.018]">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-blue-500/[0.06] text-blue-300/70">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
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

            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">
              Receiving wallet
            </div>

            <div className="mt-1.5 truncate font-mono text-[11px] font-medium text-white/55">
              {address
                ? shortAddress(address)
                : "Connect wallet"}
            </div>
          </div>

          {address && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-semibold text-emerald-300/70">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.45)]" />

              Connected
            </span>
          )}
        </div>
      </div>

      {/* =========================================================
          ERROR
         ========================================================= */}

      {formError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/[0.05] px-4 py-3.5">

          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-400/10 bg-red-500/[0.08] text-[10px] font-bold text-red-300">
            !
          </div>

          <div className="min-w-0">

            <p className="text-[11px] font-semibold text-red-300/90">
              Unable to create request
            </p>

            <p className="mt-0.5 text-[10px] leading-5 text-red-300/55">
              {formError}
            </p>

          </div>
        </div>
      )}

      {/* =========================================================
          CREATE BUTTON
         ========================================================= */}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        style={{
          outline: "none",
        }}
        className="aurora-button group relative flex h-[60px] w-full items-center justify-center overflow-hidden rounded-2xl border border-blue-300/[0.12] bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-[13px] font-bold text-white shadow-[0_14px_35px_-15px_rgba(37,99,235,.75)] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_18px_42px_-14px_rgba(37,99,235,.85)] active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-white/[0.05] disabled:bg-white/[0.06] disabled:text-white/20 disabled:shadow-none"
      >

        {/* moving shine */}
        {!submitting && canSubmit && (
          <>
            <span className="pointer-events-none absolute inset-y-0 left-[-80%] w-[55%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.18] to-transparent transition-transform duration-1000 group-hover:translate-x-[340%]" />

            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-700/10 via-transparent to-white/[0.08]" />
          </>
        )}

        <span className="relative z-10 flex items-center justify-center">

          {submitting ? (
            <span className="flex items-center gap-2.5">

              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />

              Creating link…

            </span>
          ) : !isConnected ? (
            "Connect your wallet to continue"
          ) : !onArcTestnet ? (
            "Switch to Arc Testnet to continue"
          ) : (
            <>
              Create payment link

              <span className="ml-2 text-white/60 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </>
          )}

        </span>
      </button>

      {/* =========================================================
          SECURITY
         ========================================================= */}

      <div className="flex items-start justify-center gap-2 px-3">

        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 h-4 w-4 shrink-0 text-blue-400/60"
          aria-hidden="true"
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

        <p className="max-w-[330px] text-center text-[10px] leading-5 text-white/20">
          Your wallet signs the request. Funds are
          sent directly to your wallet — Arc Pay
          never holds them.
        </p>

      </div>
    </form>
  );
}

/* ===============================================================
   DETAIL ROW
   =============================================================== */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] font-medium text-white/25">
        {label}
      </span>

      <span className="text-[10px] font-semibold text-white/55">
        {value}
      </span>
    </div>
  );
}

/* ===============================================================
   LOCAL ANIMATION
   =============================================================== */
