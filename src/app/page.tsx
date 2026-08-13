"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletWidget } from "@/components/WalletWidget";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const recipient = address ?? "";

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-[-300px] left-[-100px] h-[600px] w-[900px] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto flex h-[92px] max-w-[1480px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-semibold shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              A
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Arc Pay
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-3 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="text-sm font-medium text-white/80">
                Arc Testnet
              </span>
            </div>

            <WalletWidget />
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] max-w-[1480px] items-center px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-24">
          
          {/* Left */}
          <div className="relative">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                Live on Arc Testnet
              </span>
            </div>

            <h1 className="max-w-[700px] text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
              Get paid in USDC
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
                One link, one payment
              </span>
            </h1>

            <p className="mt-8 max-w-[620px] text-lg leading-8 text-white/55">
              Request any exact USDC amount, share a link, and watch it
              settle on-chain — no invoices, no accounts, no middlemen.
              Every payment is a direct wallet-to-wallet transfer on Arc
              Testnet.
            </p>

            {/* Features */}
            <div className="mt-14 grid max-w-[680px] grid-cols-3 gap-6">
              <Feature
                icon="◎"
                title="NETWORK"
                value="Arc Testnet"
              />

              <Feature
                icon="$"
                title="ASSET"
                value="USDC"
              />

              <Feature
                icon="◇"
                title="SETTLEMENT"
                value="On-chain, direct"
              />
            </div>

            {/* Decorative waves */}
            <div className="pointer-events-none absolute -bottom-44 -left-24 hidden h-56 w-[850px] lg:block">
              <div className="absolute bottom-10 left-0 h-32 w-full -rotate-3 rounded-[50%] border-t border-blue-500/50 shadow-[0_-15px_70px_rgba(37,99,235,0.2)]" />
              <div className="absolute bottom-0 left-[-5%] h-32 w-[110%] rotate-1 rounded-[50%] border-t border-indigo-500/40" />
              <div className="absolute bottom-16 left-[10%] h-24 w-[80%] -rotate-6 rounded-[50%] border-t border-blue-400/30" />
            </div>
          </div>

          {/* Payment card */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[32px] bg-blue-600/[0.06] blur-2xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-blue-500/25 bg-[#07101f]/90 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
              
              {/* Card header */}
              <div className="mb-9 flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl shadow-[0_0_35px_rgba(37,99,235,0.35)]">
                  ↗
                </div>

                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Request a payment
                  </h2>

                  <p className="mt-2 max-w-[390px] text-sm leading-6 text-white/50">
                    Connect your wallet, set an amount, and get a
                    shareable payment link.
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-3 block text-sm font-medium text-white/75">
                  Amount
                </label>

                <div className="flex h-[62px] items-center rounded-xl border border-white/[0.10] bg-[#050b15] px-4 transition focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-lg font-semibold text-blue-400">
                    $
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="0.000001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="min-w-0 flex-1 bg-transparent text-xl text-white outline-none placeholder:text-white/30"
                  />

                  <span className="text-sm font-medium text-white/60">
                    USDC
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-white/75">
                    Description{" "}
                    <span className="font-normal text-white/35">
                      (optional)
                    </span>
                  </label>

                  <span className="text-xs text-white/35">
                    {description.length}/40
                  </span>
                </div>

                <input
                  value={description}
                  maxLength={40}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Design consultation — March"
                  className="h-[62px] w-full rounded-xl border border-white/[0.10] bg-[#050b15] px-4 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Recipient */}
              <div className="mt-7">
                <label className="mb-3 block text-sm font-medium text-white/75">
                  You'll receive payment at
                </label>

                <div className="flex h-[62px] items-center justify-between rounded-xl border border-white/[0.07] bg-[#050b15] px-4">
                  <span className="font-mono text-sm text-white/55">
                    {recipient
                      ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}`
                      : "Connect wallet first"}
                  </span>

                  <button
                    type="button"
                    disabled={!recipient}
                    onClick={() =>
                      navigator.clipboard.writeText(recipient)
                    }
                    className="text-white/45 transition hover:text-white disabled:opacity-30"
                  >
                    ▣
                  </button>
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                disabled={!isConnected || !amount || Number(amount) <= 0}
                className="group mt-8 flex h-[62px] w-full items-center justify-between rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-blue-600 px-5 text-base font-semibold shadow-[0_15px_35px_rgba(37,99,235,0.25)] transition hover:scale-[1.005] hover:shadow-[0_18px_45px_rgba(37,99,235,0.35)] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex-1 text-center">
                  {!isConnected
                    ? "Connect wallet to continue"
                    : "Create payment link"}
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl transition group-hover:translate-x-0.5">
                  →
                </span>
              </button>

              <p className="mt-5 text-center text-xs text-white/35">
                Only USDC on Arc Testnet is supported.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-500/10 bg-blue-500/10 text-lg text-blue-400">
        {icon}
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] text-blue-400">
          {title}
        </p>

        <p className="mt-1 text-sm font-medium text-white/80">
          {value}
        </p>
      </div>
    </div>
  );
}
