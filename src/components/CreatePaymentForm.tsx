"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useSignTypedData } from "wagmi";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";

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
  const { address, isConnected, chainId } = useAccount();

  const publicClient = usePublicClient({
    chainId: arcTestnet.id,
  });

  const router = useRouter();

  const { signTypedDataAsync } = useSignTypedData();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] =
    useState<string | null>(null);

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
      setFormError(
        "Enter a valid USDC amount greater than 0."
      );
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
        description: description
          .trim()
          .slice(0, 140),
        createdAt: Date.now(),
        chainId: arcTestnet.id,
        fromBlock: Number(fromBlock),
        nonce: generateInvoiceNonce(id),
        signature: "0x",
      };

      const signature =
        await signTypedDataAsync({
          domain: invoiceDomain(
            invoice.chainId
          ),
          types: invoiceTypes,
          primaryType: "PaymentRequest",
          message: invoiceMessage(invoice),
        });

      const signedInvoice = {
        ...invoice,
        signature,
      };

      const token =
        encodeInvoice(signedInvoice);

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
      className="w-full space-y-6"
    >
      {/* =====================================================
          AMOUNT
         ===================================================== */}

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <label
            htmlFor="amount"
            className="text-[12px] font-medium text-[#33343A]"
          >
            Amount
          </label>

          <span className="rounded-full bg-[#F5F7FF] px-2.5 py-1 text-[9px] font-semibold text-[#5B72D8]">
            USDC
          </span>
        </div>

        <div className="flex h-[68px] items-center overflow-hidden rounded-[14px] border border-[#E2E2E6] bg-white transition focus-within:border-[#B9BCC5]">
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
            className="h-full min-w-0 flex-1 bg-transparent px-5 text-[27px] font-semibold tracking-[-0.045em] text-[#111111] outline-none placeholder:text-[#C4C5CA]"
          />

          <div className="flex h-full items-center border-l border-[#EEEEF1] px-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F1F2F4] text-[9px] font-bold text-[#55565D]">
                $
              </span>

              <span className="text-[12px] font-semibold text-[#55565D]">
                USDC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DESCRIPTION
         ===================================================== */}

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <label
            htmlFor="description"
            className="text-[12px] font-medium text-[#33343A]"
          >
            Description
          </label>

          <span className="text-[10px] text-[#A0A1A8]">
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
          className="h-[54px] w-full rounded-[14px] border border-[#E2E2E6] bg-white px-4 text-[12px] font-medium text-[#33343A] outline-none transition placeholder:text-[#B4B5BB] focus:border-[#B9BCC5]"
        />
      </div>

      {/* =====================================================
          PAYMENT DETAILS
         ===================================================== */}

      <div className="overflow-hidden rounded-[16px] border border-[#E8E8EB] bg-white">
        <div className="flex items-center gap-3 border-b border-[#EEEEF1] px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F6] text-[#55565D]">
            <ShieldCheck
              size={17}
              strokeWidth={1.6}
            />
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[#33343A]">
              Payment details
            </p>

            <p className="mt-0.5 text-[10px] text-[#9A9BA2]">
              Fixed for this request
            </p>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          <DetailRow
            label="Currency"
            value="USDC"
          />

          <DetailRow
            label="Network"
            value={
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#31A66A]" />
                Arc Testnet
              </span>
            }
          />

          <DetailRow
            label="Settlement"
            value={
              <span className="text-[#31A66A]">
                Direct wallet payment
              </span>
            }
          />
        </div>
      </div>

      {/* =====================================================
          RECEIVING WALLET
         ===================================================== */}

      <div className="rounded-[16px] border border-[#E8E8EB] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F6] text-[#55565D]">
            <Wallet
              size={17}
              strokeWidth={1.7}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9A9BA2]">
              Receiving wallet
            </p>

            <p className="mt-1 truncate font-mono text-[11px] font-medium text-[#55565D]">
              {address
                ? shortAddress(address)
                : "Connect wallet"}
            </p>
          </div>

          {address && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F0FAF4] px-2.5 py-1 text-[9px] font-semibold text-[#31A66A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#31A66A]" />
              Connected
            </span>
          )}
        </div>
      </div>

      {/* =====================================================
          ERROR
         ===================================================== */}

      {formError && (
        <div className="flex items-start gap-3 rounded-[14px] border border-[#F2D5D5] bg-[#FFF8F8] px-4 py-3.5">
          <CircleAlert
            size={17}
            className="mt-0.5 shrink-0 text-[#D85C5C]"
          />

          <div>
            <p className="text-[11px] font-semibold text-[#B84D4D]">
              Unable to create request
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#B76A6A]">
              {formError}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          CREATE BUTTON
         ===================================================== */}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#111111] text-[12px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#EEEEF0] disabled:text-[#A0A1A8]"
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
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>

      {/* =====================================================
          SECURITY
         ===================================================== */}

      <div className="flex items-start justify-center gap-2 px-4">
        <CheckCircle2
          size={14}
          className="mt-0.5 shrink-0 text-[#8E929A]"
        />

        <p className="max-w-[360px] text-center text-[10px] leading-5 text-[#999AA2]">
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
      <span className="text-[10px] font-medium text-[#96979F]">
        {label}
      </span>

      <span className="text-[10px] font-semibold text-[#55565D]">
        {value}
      </span>
    </div>
  );
}
