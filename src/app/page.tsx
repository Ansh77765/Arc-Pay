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

    <circle
      cx="15.5"
      cy="11.5"
      r=".7"
      fill="currentColor"
    />
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
    <div className="relative min-h-screen overflow-hidden bg-[#050811] text-white selection:bg-blue-500/30">

      {/* =========================================================
          ARC AURORA BACKGROUND
         ========================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        {/* Main moving aurora */}
        <div className="arc-aurora absolute -left-[15%] -top-[25%] h-[750px] w-[750px] rounded-full bg-blue-600/[0.16] blur-[150px]" />

        <div className="arc-aurora-delayed absolute right-[-15%] top-[8%] h-[650px] w-[650px] rounded-full bg-cyan-500/[0.09] blur-[150px]" />

        <div className="arc-aurora-slow absolute bottom-[-25%] left-[25%] h-[650px] w-[650px] rounded-full bg-violet-600/[0.08] blur-[160px]" />

        {/* Fine blue atmospheric glow */}
        <div className="absolute left-1/2 top-[18%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/[0.025] blur-[130px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(96,165,250,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,.35) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 80%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 80%)",
          }}
        />

        {/* Top light */}
        <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>

      {/* =========================================================
          TESTNET STRIP
         ========================================================= */}

      <div className="relative z-30 border-b border-white/[0.05] bg-[#060a12]/80 backdrop-blur-xl">

        <div className="mx-auto flex h-8 max-w-[1320px] items-center justify-center px-5">

          <div className="flex items-center gap-2 text-[10px] font-medium text-white/40">

            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/50" />

              <span className="relative h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>

            <span>Arc Testnet</span>

            <span className="text-white/15">
              ·
            </span>

            <span className="text-white/25">
              Testnet funds have no real value
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10">

        <TopBar />

        <main className="mx-auto max-w-[1320px] px-5 pb-24 pt-8 sm:px-8 lg:px-10">

          {/* =====================================================
              HERO
             ===================================================== */}

          <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">

                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/40" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-blue-400" />
                </span>

                Arc Payments
              </div>

              <h1 className="max-w-[700px] text-[34px] font-semibold leading-[1.05] tracking-[-0.055em] text-white sm:text-[44px]">

                Your money,
                <span className="ml-2 bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                  on Arc.
                </span>

              </h1>

              <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-white/35">
                Send and request USDC with simple,
                secure, non-custodial payments.
              </p>
            </div>

            {/* Network status */}
            <div className="group flex w-fit items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 backdrop-blur-xl transition hover:border-blue-400/20 hover:bg-blue-400/[0.04]">

              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />

                <span className="relative h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.55)]" />
              </span>

              <span className="text-[11px] font-medium text-white/55">
                Arc network
              </span>

              <span className="h-3 w-px bg-white/10" />

              <span className="text-[10px] text-emerald-300/60">
                Connected
              </span>
            </div>
          </header>

          {/* =====================================================
              BALANCE CARD
             ===================================================== */}

          <section className="group relative mb-6 overflow-hidden rounded-[28px] border border-white/[0.085] bg-[#0a101a]/75 shadow-[0_25px_80px_-35px_rgba(0,0,0,.8)] backdrop-blur-2xl">

            {/* animated border glow */}
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-blue-500/[0.08] via-transparent to-cyan-400/[0.025]" />

            <div className="relative grid lg:grid-cols-[1fr_auto]">

              <div className="p-7 sm:p-9 lg:p-10">

                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">

                  <Wallet />

                  Available balance
                </div>

                <div className="mt-5 flex items-end gap-3">

                  <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-[52px] font-semibold tracking-[-0.07em] text-transparent sm:text-[62px]">
                    —
                  </span>

                  <span className="mb-2.5 text-sm font-semibold text-blue-300/60">
                    USDC
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[10px] text-white/25">

                  <span className="h-1 w-1 rounded-full bg-white/20" />

                  Connect your wallet to view balance
                </div>
              </div>

              {/* Action area */}
              <div className="flex items-center border-t border-white/[0.055] p-5 sm:p-7 lg:border-l lg:border-t-0">

                <div className="grid grid-cols-2 gap-3">

                  {/* These are deliberately non-interactive until
                      the corresponding transaction flows exist. */}
                  <div className="flex h-12 min-w-[120px] cursor-default items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-5 text-sm font-semibold text-white/35">

                    <span className="text-blue-400/50">
                      +
                    </span>

                    Send
                  </div>

                  <a
                    href="#request-usdc"
                    className="flex h-12 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(37,99,235,.8)] transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_15px_35px_-12px_rgba(37,99,235,.9)] active:translate-y-0"
                  >
                    <Plus />

                    Request
                  </a>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="relative grid border-t border-white/[0.055] sm:grid-cols-3">

              <div className="border-b border-white/[0.055] px-6 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/20">
                  Network
                </p>

                <p className="mt-1.5 text-[11px] font-medium text-white/55">
                  Arc Testnet
                </p>
              </div>

              <div className="border-b border-white/[0.055] px-6 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/20">
                  Currency
                </p>

                <p className="mt-1.5 text-[11px] font-medium text-white/55">
                  USD Coin · USDC
                </p>
              </div>

              <div className="px-6 py-4">

                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/20">
                  Settlement
                </p>

                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-300/70">

                  <Shield />

                  Non-custodial
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              MAIN GRID
             ===================================================== */}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">

            {/* Activity */}
            <section className="overflow-hidden rounded-[26px] border border-white/[0.075] bg-[#090f18]/75 shadow-[0_25px_70px_-40px_rgba(0,0,0,.8)] backdrop-blur-2xl">

              <div className="flex items-center justify-between border-b border-white/[0.055] px-6 py-5">

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-[14px] font-semibold text-white/80">
                      Recent activity
                    </h2>

                    <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-0.5 text-[8px] font-medium text-white/20">
                      SOON
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] text-white/25">
                    Your latest payments and requests
                  </p>
                </div>

                <span className="flex items-center gap-1 text-[10px] font-medium text-white/15">
                  View all
                  <ChevronRight />
                </span>
              </div>

              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/[0.08] bg-gradient-to-br from-blue-500/[0.08] to-cyan-400/[0.025] text-blue-300/40">

                  <div className="absolute inset-0 rounded-2xl bg-blue-500/[0.06] blur-xl" />

                  <Activity />
                </div>

                <h3 className="mt-6 text-sm font-semibold text-white/60">
                  Nothing here yet
                </h3>

                <p className="mt-2 max-w-[300px] text-[11px] leading-5 text-white/25">
                  Once you send or receive USDC,
                  your payment activity will appear
                  here.
                </p>

                <a
                  href="#request-usdc"
                  className="mt-5 flex items-center gap-2 rounded-xl border border-blue-400/[0.1] bg-blue-500/[0.045] px-4 py-2.5 text-[10px] font-semibold text-blue-300/70 transition hover:border-blue-400/20 hover:bg-blue-500/[0.08] hover:text-blue-200"
                >
                  <Plus />

                  Create your first request
                </a>
              </div>
            </section>

            {/* Create payment */}
            <section
              id="request-usdc"
              className="scroll-mt-24 overflow-hidden rounded-[26px] border border-blue-400/[0.1] bg-[#090f18]/80 shadow-[0_25px_80px_-35px_rgba(0,0,0,.85)] backdrop-blur-2xl"
            >

              {/* subtle top accent */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-cyan-400/20" />

              <div className="border-b border-white/[0.055] px-6 py-6">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-2">

                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-400">
                        Payment request
                      </p>

                      <span className="h-1 w-1 rounded-full bg-blue-400/50" />
                    </div>

                    <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.035em] text-white">
                      Request USDC
                    </h2>

                    <p className="mt-2 text-[10px] leading-5 text-white/25">
                      Create a secure payment request
                      and share it with anyone.
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-400/[0.12] bg-blue-500/[0.06] px-2.5 py-1.5 text-[9px] font-bold tracking-wide text-blue-300/70">
                    USDC
                  </div>
                </div>
              </div>

              <div className="p-6">
                <CreatePaymentForm />
              </div>
            </section>
          </div>

          {/* =====================================================
              FEATURES
             ===================================================== */}

          <section className="mt-6 grid gap-3 md:grid-cols-3">

            <FeatureCard
              icon={<Plus />}
              accent="blue"
              title="Simple payment requests"
              description="Create a request, share the link, and get paid directly."
            />

            <FeatureCard
              icon={<Shield />}
              accent="green"
              title="You stay in control"
              description="Arc Pay never takes custody of your funds or private keys."
            />

            <FeatureCard
              icon={<External />}
              accent="violet"
              title="Verifiable payments"
              description="Every completed payment can be verified on-chain."
            />
          </section>

          {/* =====================================================
              FOOTER
             ===================================================== */}

          <footer className="mt-12 flex flex-col gap-3 border-t border-white/[0.05] pt-6 text-[9px] text-white/20 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2">

              <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-blue-400/10 bg-blue-500/[0.05]">

                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,.7)]" />

              </div>

              <span className="font-semibold text-white/35">
                Arc Pay
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              <span>Built on Arc</span>

              <span>·</span>

              <span>USDC payments</span>

              <span>·</span>

              <span>Testnet</span>
            </div>
          </footer>
        </main>
      </div>

      {/* =========================================================
          ANIMATION
         ========================================================= */}

      <style jsx global>{`
        @keyframes arcAurora {
          0% {
            transform: translate3d(-8%, -3%, 0) scale(1);
          }

          25% {
            transform: translate3d(7%, 4%, 0) scale(1.08);
          }

          50% {
            transform: translate3d(14%, -2%, 0) scale(0.96);
          }

          75% {
            transform: translate3d(-4%, 7%, 0) scale(1.05);
          }

          100% {
            transform: translate3d(-8%, -3%, 0) scale(1);
          }
        }

        @keyframes arcAuroraDelayed {
          0% {
            transform: translate3d(4%, 0, 0) scale(1);
          }

          33% {
            transform: translate3d(-8%, 8%, 0) scale(1.1);
          }

          66% {
            transform: translate3d(-14%, -5%, 0) scale(0.95);
          }

          100% {
            transform: translate3d(4%, 0, 0) scale(1);
          }
        }

        @keyframes arcAuroraSlow {
          0% {
            transform: translate3d(0, 5%, 0) scale(1);
          }

          50% {
            transform: translate3d(8%, -8%, 0) scale(1.1);
          }

          100% {
            transform: translate3d(0, 5%, 0) scale(1);
          }
        }

        .arc-aurora {
          animation: arcAurora 18s ease-in-out infinite;
          will-change: transform;
        }

        .arc-aurora-delayed {
          animation: arcAuroraDelayed 24s ease-in-out infinite;
          will-change: transform;
        }

        .arc-aurora-slow {
          animation: arcAuroraSlow 30s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .arc-aurora,
          .arc-aurora-delayed,
          .arc-aurora-slow {
            animation: none;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({
  icon,
  accent,
  title,
  description,
}: {
  icon: React.ReactNode;
  accent: "blue" | "green" | "violet";
  title: string;
  description: string;
}) {
  const accentStyles = {
    blue: {
      box: "border-blue-400/[0.08] bg-blue-500/[0.035]",
      icon: "border-blue-400/[0.1] bg-blue-500/[0.06] text-blue-300/70",
    },
    green: {
      box: "border-emerald-400/[0.07] bg-emerald-500/[0.025]",
      icon: "border-emerald-400/[0.09] bg-emerald-500/[0.05] text-emerald-300/65",
    },
    violet: {
      box: "border-violet-400/[0.08] bg-violet-500/[0.025]",
      icon: "border-violet-400/[0.1] bg-violet-500/[0.05] text-violet-300/65",
    },
  };

  return (
    <div
      className={`group rounded-2xl border bg-white/[0.012] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.02] ${accentStyles[accent].box}`}
    >
      <div
        className={`mb-5 flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105 ${accentStyles[accent].icon}`}
      >
        {icon}
      </div>

      <h3 className="text-xs font-semibold text-white/65">
        {title}
      </h3>

      <p className="mt-1.5 text-[10px] leading-5 text-white/25">
        {description}
      </p>
    </div>
  );
}
