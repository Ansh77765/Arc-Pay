"use client";

import { motion } from "motion/react";
import { TopBar } from "@/components/TopBar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";

const ease = [0.22, 1, 0.36, 1] as const;

function NetworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.8 12h16.4M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5C9.8 18.1 8.7 15.3 8.7 12S9.8 5.9 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14.7 8.7c-.7-.6-1.6-.9-2.7-.9-1.6 0-2.8.8-2.8 2 0 3.1 5.6 1.1 5.6 4 0 1.3-1.1 2.1-2.8 2.1-1.2 0-2.2-.4-2.9-1.1M12 6.1v11.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 3.5 19.5 6.4v5.1c0 4.4-2.8 7.6-7.5 9-4.7-1.4-7.5-4.6-7.5-9V6.4L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m8.7 12 2.1 2.1 4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080f] text-white">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.45, 0.65, 0.45],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-[-380px] h-[760px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/[0.07] blur-[150px]"
        />

        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.045] blur-[150px]"
        />
      </div>

      <div className="relative z-10">
        <TopBar />

        <main className="mx-auto max-w-[1380px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_520px] xl:gap-24">

            {/* LEFT */}
            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease }}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3.5 py-2"
              >
                <span className="relative flex h-2 w-2">
                  <motion.span
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.7, 0, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute h-full w-full rounded-full bg-emerald-400"
                  />

                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
                  Live on Arc Testnet
                </span>
              </motion.div>

              <h1 className="max-w-[760px] text-[3.35rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.3rem]">
                Get paid in
                <br />

                <span className="bg-gradient-to-r from-[#76a8ff] via-[#4e7fff] to-[#879bff] bg-clip-text text-transparent">
                  USDC.
                </span>
              </h1>

              <p className="mt-7 max-w-[610px] text-[16px] leading-8 text-white/45 sm:text-lg">
                Create a payment request, share one link, and receive USDC
                directly in your wallet. Simple, transparent, and settled
                on-chain.
              </p>

              {/* Trust */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6, ease }}
                className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 text-sm text-white/40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">
                    <NetworkIcon />
                  </span>
                  Arc Testnet
                </div>

                <span className="h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <span className="text-blue-400">
                    <CoinIcon />
                  </span>
                  USDC payments
                </div>

                <span className="h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <span className="text-blue-400">
                    <ShieldIcon />
                  </span>
                  Non-custodial
                </div>
              </motion.div>

              {/* Product facts */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6, ease }}
                className="mt-12 grid max-w-[650px] grid-cols-3 divide-x divide-white/[0.07] border-y border-white/[0.07] py-5"
              >
                <div className="pr-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                    Network
                  </p>
                  <p className="mt-1.5 text-sm text-white/70">
                    Arc Testnet
                  </p>
                </div>

                <div className="px-5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                    Asset
                  </p>
                  <p className="mt-1.5 text-sm text-white/70">
                    USDC
                  </p>
                </div>

                <div className="pl-5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                    Settlement
                  </p>
                  <p className="mt-1.5 text-sm text-white/70">
                    On-chain
                  </p>
                </div>
              </motion.div>
            </motion.section>

            {/* PAYMENT CARD */}
            <motion.section
              initial={{ opacity: 0, x: 24, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.75, ease }}
              className="relative"
            >
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.025, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-6 rounded-[32px] bg-blue-500/[0.06] blur-3xl"
              />

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.25 }}
                className="relative overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#0a101c]/95 shadow-[0_35px_100px_-35px_rgba(0,0,0,.9)] backdrop-blur-xl"
              >
                <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />

                <div className="p-6 sm:p-8">
                  <div className="mb-7">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-400/80">
                      Payment request
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                      Request a payment
                    </h2>

                    <p className="mt-2 max-w-[380px] text-sm leading-6 text-white/40">
                      Set an amount and create a secure payment link.
                    </p>
                  </div>

                  {/* IMPORTANT:
                      Your working form stays completely untouched. */}
                  <CreatePaymentForm />
                </div>

                <div className="border-t border-white/[0.06] px-6 py-4 sm:px-8">
                  <div className="flex items-center justify-center gap-2 text-[11px] text-white/25">
                    <ShieldIcon />
                    <span>
                      Direct wallet-to-wallet settlement on Arc
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}
