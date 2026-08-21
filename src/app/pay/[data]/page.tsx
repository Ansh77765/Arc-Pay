"use client";

import { decodeInvoice } from "@/lib/invoice";
import { PaymentView } from "@/components/PaymentView";
import { TopBar } from "@/components/TopBar";
import Link from "next/link";

export default function PayPage({
  params,
}: {
  params: { data: string };
}) {
  const invoice = decodeInvoice(params.data);

  if (!invoice) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050811] text-white">

        {/* Aurora background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">

          <div className="absolute -left-[20%] -top-[25%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.10] blur-[150px]" />

          <div className="absolute -right-[20%] top-[15%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10">
          <TopBar />

          <main className="mx-auto flex min-h-[calc(100vh-68px)] max-w-md flex-col items-center justify-center px-6 py-16 text-center">

            {/* Error icon */}
            <div className="relative">

              <div className="absolute inset-0 rounded-[22px] bg-red-500/[0.08] blur-2xl" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-red-400/10 bg-red-500/[0.06] text-red-300">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3.5 20 18a1.5 1.5 0 0 1-1.3 2.25H5.3A1.5 1.5 0 0 1 4 18L12 3.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M12 9v4.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="16.5"
                    r=".8"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-6">

              <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-red-300/50">
                Invalid request
              </div>

              <h1 className="text-[22px] font-bold tracking-[-0.035em] text-white/85">
                This payment link is invalid
              </h1>

              <p className="mx-auto mt-3 max-w-[350px] text-[12px] leading-6 text-white/30">
                The link may be incomplete or corrupted.
                Ask the sender for a fresh link, or create
                your own payment request.
              </p>
            </div>

            <Link
              href="/"
              className="group relative mt-7 flex h-11 items-center justify-center overflow-hidden rounded-xl border border-blue-300/[0.12] bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-[11px] font-semibold text-white shadow-[0_12px_30px_-14px_rgba(37,99,235,.8)] transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_16px_35px_-12px_rgba(37,99,235,.85)]"
            >
              <span className="pointer-events-none absolute inset-y-0 left-[-80%] w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent transition-transform duration-700 group-hover:translate-x-[300%]" />

              <span className="relative flex items-center gap-2">
                Create a payment link

                <span className="text-white/50 transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>

            <div className="mt-8 flex items-center gap-2 text-[9px] text-white/15">

              <span className="h-1.5 w-1.5 rounded-full bg-blue-400/50" />

              Arc Pay
            </div>

          </main>
        </div>
      </div>
    );
  }

  return <PaymentView invoice={invoice} />;
}
