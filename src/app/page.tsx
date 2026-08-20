"use client";

import { TopBar } from "@/components/TopBar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";

function Icon({
  children,
  className = "h-4 w-4",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ArrowUp = () => (
  <Icon>
    <path
      d="M12 19V5M6.5 10.5 12 5l5.5 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const ArrowDown = () => (
  <Icon>
    <path
      d="M12 5v14M17.5 13.5 12 19l-5.5-5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const Plus = () => (
  <Icon>
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Icon>
);

const ChevronRight = () => (
  <Icon>
    <path
      d="m9 18 6-6-6-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const Copy = () => (
  <Icon>
    <rect
      x="8"
      y="8"
      width="11"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </Icon>
);

const Wallet = () => (
  <Icon className="h-5 w-5">
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
    <circle cx="15.5" cy="11.5" r=".7" fill="currentColor" />
  </Icon>
);

const Activity = () => (
  <Icon className="h-5 w-5">
    <path
      d="M4 12h4l2-6 4 12 2-6h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const Shield = () => (
  <Icon className="h-4 w-4">
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
  </Icon>
);

const External = () => (
  <Icon>
    <path
      d="M14 5h5v5M19 5l-8 8"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </Icon>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[850px] -translate-x-1/2 rounded-full bg-blue-500/[0.055] blur-[140px]" />
        <div className="absolute right-[-250px] top-[30%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.025] blur-[130px]" />
      </div>

      {/* Testnet strip */}
      <div className="relative z-30 border-b border-white/[0.045] bg-[#090c11]">
        <div className="mx-auto flex h-8 max-w-[1320px] items-center justify-center px-5">
          <div className="flex items-center gap-2 text-[10px] font-medium text-white/35">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Arc Testnet
            <span className="text-white/15">·</span>
            Testnet funds have no real value
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <TopBar />

        <main className="mx-auto max-w-[1320px] px-5 pb-20 pt-7 sm:px-8 lg:px-10">
          {/* Page heading */}
          <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-blue-400/70">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Payments
              </div>

              <h1 className="text-[30px] font-semibold tracking-[-0.045em] sm:text-[36px]">
                Your money, on Arc.
              </h1>

              <p className="mt-2 max-w-[540px] text-[13px] leading-6 text-white/35">
                Send and request USDC with simple, secure, non-custodial
                payments.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[11px] font-medium text-white/45">
                Arc network
              </span>

              <span className="text-[10px] text-white/15">Connected</span>
            </div>
          </header>

          {/* Balance */}
          <section className="group relative mb-6 overflow-hidden rounded-[26px] border border-white/[0.075] bg-[#0c1118]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.035] via-transparent to-transparent" />

            <div className="relative grid lg:grid-cols-[1fr_auto]">
              <div className="p-6 sm:p-8 lg:p-9">
                <div className="flex items-center gap-2 text-[11px] font-medium text-white/35">
                  <Wallet />
                  Available balance
                </div>

                <div className="mt-5 flex items-end gap-3">
                  <span className="text-[48px] font-semibold tracking-[-0.065em] sm:text-[58px]">
                    —
                  </span>

                  <span className="mb-2 text-sm font-medium text-white/30">
                    USDC
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-white/25">
                  <span>Connect your wallet to view balance</span>
                </div>
              </div>

              <div className="flex items-center border-t border-white/[0.055] p-5 sm:p-7 lg:border-l lg:border-t-0">
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex h-12 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.98]">
                    <ArrowUp />
                    Send
                  </button>

                  <button className="flex h-12 min-w-[120px] items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.035] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.06] active:scale-[0.98]">
                    <Plus />
                    Request
                  </button>
                </div>
              </div>
            </div>

            {/* Account metadata */}
            <div className="relative grid border-t border-white/[0.055] sm:grid-cols-3">
              <div className="border-b border-white/[0.055] px-6 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/20">
                  Network
                </p>
                <p className="mt-1 text-xs font-medium text-white/55">
                  Arc Testnet
                </p>
              </div>

              <div className="border-b border-white/[0.055] px-6 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/20">
                  Currency
                </p>
                <p className="mt-1 text-xs font-medium text-white/55">
                  USD Coin · USDC
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/20">
                  Settlement
                </p>

                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-400/75">
                  <Shield />
                  Non-custodial
                </div>
              </div>
            </div>
          </section>

          {/* Main content */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
            {/* Activity */}
            <section className="overflow-hidden rounded-[24px] border border-white/[0.075] bg-[#0b1016]">
              <div className="flex items-center justify-between border-b border-white/[0.055] px-6 py-5">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-[11px] text-white/25">
                    Your latest payments and requests
                  </p>
                </div>

                <button className="flex items-center gap-1 text-[11px] font-medium text-blue-400 transition hover:text-blue-300">
                  View all
                  <ChevronRight />
                </button>
              </div>

              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-white/25">
                  <Activity />
                </div>

                <h3 className="mt-5 text-sm font-medium text-white/60">
                  Nothing here yet
                </h3>

                <p className="mt-2 max-w-[300px] text-[11px] leading-5 text-white/25">
                  Once you send or receive USDC, your payment activity will
                  appear here.
                </p>

                <button className="mt-5 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-[11px] font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white">
                  <Plus />
                  Create your first request
                </button>
              </div>
            </section>

            {/* Create request */}
            <section className="overflow-hidden rounded-[24px] border border-white/[0.075] bg-[#0b1016]">
              <div className="border-b border-white/[0.055] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-blue-400/75">
                      Payment request
                    </p>

                    <h2 className="mt-1.5 text-[19px] font-semibold tracking-[-0.03em]">
                      Request USDC
                    </h2>

                    <p className="mt-2 text-[11px] leading-5 text-white/25">
                      Create a payment request and share it with anyone.
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-[9px] font-semibold tracking-wide text-white/35">
                    USDC
                  </div>
                </div>
              </div>

              <div className="p-6">
                <CreatePaymentForm />
              </div>
            </section>
          </div>

          {/* Product principles */}
          <section className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 transition hover:border-white/[0.09]">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-blue-400">
                <Plus />
              </div>

              <h3 className="text-xs font-semibold text-white/65">
                Simple payment requests
              </h3>

              <p className="mt-1.5 text-[11px] leading-5 text-white/25">
                Create a request, share the link, and get paid directly.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 transition hover:border-white/[0.09]">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-emerald-400">
                <Shield />
              </div>

              <h3 className="text-xs font-semibold text-white/65">
                You stay in control
              </h3>

              <p className="mt-1.5 text-[11px] leading-5 text-white/25">
                Arc Pay never takes custody of your funds or private keys.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 transition hover:border-white/[0.09]">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-purple-400">
                <External />
              </div>

              <h3 className="text-xs font-semibold text-white/65">
                Verifiable payments
              </h3>

              <p className="mt-1.5 text-[11px] leading-5 text-white/25">
                Every completed payment can be verified on-chain.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 flex flex-col gap-3 border-t border-white/[0.05] pt-6 text-[10px] text-white/20 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-white/30">Arc Pay</span>

            <div className="flex items-center gap-4">
              <span>Built on Arc</span>
              <span>·</span>
              <span>USDC payments</span>
              <span>·</span>
              <span>Testnet</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
