"use client";

import { TopBar } from "@/components/TopBar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M7 17 17 7M8 7h9v9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDownLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M17 7 7 17M16 17H7V8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M9.5 14.5 14.5 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.1 17.1 5.7 18.5a3.5 3.5 0 0 1-5-5l3.2-3.2a3.5 3.5 0 0 1 5 0"
        transform="translate(2 0)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="m16.9 6.9 1.4-1.4a3.5 3.5 0 0 1 5 5l-3.2 3.2a3.5 3.5 0 0 1-5 0"
        transform="translate(-2 0)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 8h14.5A1.5 1.5 0 0 1 20 9.5V14h-4.5a2.5 2.5 0 1 1 0-5H20"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="15.5" cy="11.5" r=".7" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 12h4l2.2-6 4 12 2.1-6H20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-420px] h-[760px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/[0.07] blur-[150px]" />
        <div className="absolute right-[-300px] top-[35%] h-[600px] w-[600px] rounded-full bg-indigo-500/[0.035] blur-[150px]" />
      </div>

      {/* Testnet banner */}
      <div className="relative z-30 border-b border-amber-300/[0.08] bg-amber-300/[0.035]">
        <div className="mx-auto flex min-h-9 max-w-[1280px] items-center justify-center px-5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-amber-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Arc Testnet
            <span className="text-white/20">•</span>
            Testnet funds have no real value
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <TopBar />

        <main className="mx-auto max-w-[1280px] px-5 pb-24 pt-8 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-blue-400/70">
                Payments
              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Welcome to Arc Pay
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                Request and receive USDC directly to your wallet.
                Simple, non-custodial payments built on Arc.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/45">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.4)]" />
              Arc network connected
            </div>
          </div>

          {/* Balance card */}
          <section className="mb-6 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0c1119] shadow-[0_30px_100px_-50px_rgba(0,0,0,.9)]">
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute right-[-100px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-500/[0.08] blur-[100px]" />

              <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
                <div>
                  <div className="flex items-center gap-2 text-xs text-white/35">
                    <WalletIcon />
                    <span>Available balance</span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
                      —
                    </span>

                    <span className="text-sm font-medium text-white/35">
                      USDC
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-white/25">
                    Connect your wallet to view your balance
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90">
                    <ArrowUpRight />
                    Send
                  </button>

                  <button className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.07]">
                    <ArrowDownLeft />
                    Request
                  </button>
                </div>
              </div>
            </div>

            <div className="grid border-t border-white/[0.06] sm:grid-cols-3">
              <div className="border-b border-white/[0.06] px-6 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                  Network
                </p>
                <p className="mt-1 text-sm font-medium text-white/70">
                  Arc Testnet
                </p>
              </div>

              <div className="border-b border-white/[0.06] px-6 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                  Asset
                </p>
                <p className="mt-1 text-sm font-medium text-white/70">
                  USD Coin
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                  Security
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-400/80">
                  <ShieldIcon />
                  Non-custodial
                </div>
              </div>
            </div>
          </section>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Activity */}
            <section className="rounded-[24px] border border-white/[0.08] bg-[#0b1017]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold">Recent activity</h2>
                  <p className="mt-1 text-xs text-white/30">
                    Your latest payment activity
                  </p>
                </div>

                <button className="text-xs font-medium text-blue-400 transition hover:text-blue-300">
                  View all
                </button>
              </div>

              {/* Empty state */}
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-white/30">
                  <ActivityIcon />
                </div>

                <h3 className="mt-4 text-sm font-medium text-white/65">
                  No payments yet
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-5 text-white/30">
                  Your sent and received payments will appear here once
                  you start using Arc Pay.
                </p>
              </div>
            </section>

            {/* Request */}
            <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0b1017]">
              <div className="border-b border-white/[0.06] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-400/70">
                      New payment
                    </p>

                    <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em]">
                      Request USDC
                    </h2>
                  </div>

                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-[10px] font-medium text-white/40">
                    USDC
                  </div>
                </div>

                <p className="mt-2 text-xs leading-5 text-white/30">
                  Create a secure payment request and share it with anyone.
                </p>
              </div>

              <div className="p-6">
                <CreatePaymentForm />
              </div>
            </section>
          </div>

          {/* Trust row */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/[0.08] text-blue-400">
                <LinkIcon />
              </div>

              <div>
                <p className="text-xs font-medium text-white/65">
                  Shareable links
                </p>
                <p className="mt-0.5 text-[11px] text-white/25">
                  Request payments anywhere
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/[0.08] text-emerald-400">
                <ShieldIcon />
              </div>

              <div>
                <p className="text-xs font-medium text-white/65">
                  Non-custodial
                </p>
                <p className="mt-0.5 text-[11px] text-white/25">
                  Funds go directly to you
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/[0.08] text-purple-400">
                <ActivityIcon />
              </div>

              <div>
                <p className="text-xs font-medium text-white/65">
                  On-chain
                </p>
                <p className="mt-0.5 text-[11px] text-white/25">
                  Verifiable Arc transactions
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-[11px] text-white/20 sm:flex-row">
            <span>Arc Pay</span>

            <span>
              Non-custodial USDC payments on Arc Testnet
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
