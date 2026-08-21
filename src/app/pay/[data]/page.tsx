"use client";

import { decodeInvoice } from "@/lib/invoice";
import { PaymentView } from "@/components/PaymentView";
import { TopBar } from "@/components/TopBar";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Home,
} from "lucide-react";

export default function PayPage({
  params,
}: {
  params: { data: string };
}) {
  const invoice = decodeInvoice(params.data);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-white text-[#111111]">
        <TopBar />

        <main className="mx-auto flex min-h-[calc(100vh-68px)] max-w-[560px] flex-col items-center justify-center px-6 py-16">

          {/* Icon */}
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[20px] bg-[#F7F7F8] text-[#777880]">
            <AlertTriangle
              size={27}
              strokeWidth={1.5}
            />
          </div>

          {/* Content */}
          <div className="mt-7 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999AA2]">
              Invalid request
            </p>

            <h1 className="mt-2 text-[25px] font-semibold tracking-[-0.045em]">
              This payment link is invalid
            </h1>

            <p className="mx-auto mt-3 max-w-[390px] text-[12px] leading-6 text-[#85868E]">
              The payment link may be incomplete,
              expired, or corrupted. Ask the sender
              for a new payment link.
            </p>
          </div>

          {/* Action */}
          <Link
            href="/"
            className="mt-7 flex h-[48px] items-center gap-2 rounded-[14px] bg-[#111111] px-5 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
          >
            <Home
              size={15}
              strokeWidth={1.8}
            />

            Back to Arc Pay

            <ArrowRight
              size={14}
              strokeWidth={1.8}
            />
          </Link>

          {/* Footer */}
          <div className="mt-9 flex items-center gap-2 text-[9px] text-[#A0A1A8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#31A66A]" />
            Arc Pay · Arc Testnet
          </div>
        </main>
      </div>
    );
  }

  return <PaymentView invoice={invoice} />;
}
