"use client";

import { TopBar } from "@/components/TopBar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import { useAccount, useConnect } from "wagmi";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
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

function QrPlaceholder() {
  const blocks = [
    0, 1, 2, 5, 7, 10, 12, 14, 16, 18, 20, 21, 23, 24,
  ];

  return (
    <div className="relative flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <div className="grid grid-cols-5 gap-1 opacity-20">
        {Array.from({ length: 25 }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-[2px] ${
              blocks.includes(i)
                ? "bg-white"
                : "bg-transparent"
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-full border border-white/[0.08] bg-[#0b111d] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
          Preview
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  function handleConnect() {
    const connector = connectors[0];

    if (connector) {
      connect({ connector });
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080f] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-420px] h-[800px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/[0.06] blur-[150px] animate-pulse" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.025),transparent_35%)]" />
      </div>

      {/* Testnet warning */}
      <div className="relative z-30 border-b border-amber-400/10 bg-amber-400/[0.045]">
        <div className="mx-auto flex min-h-9 max-w-[1380px] items-center justify-center px-5 text-center">
          <p className="text-[11px] font-medium tracking-wide text-amber-200/65">
            <span className="mr-2 text-amber-300">⚠</span>
            Testnet — tokens have no real value
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <TopBar />

        <main className="mx-auto max-w-[1380px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_500px] lg:gap-20 xl:gap-28">
            {/* LEFT SIDE */}
            <section className="animate-[fadeUp_.6s_ease-out] pt-2">
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-blue-400/75">
                Simple USDC payments
              </p>

              <h1 className="max-w-[720px] text-[3.25rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.2rem]">
                Get paid
                <br />
                <span className="bg-gradient-to-r from-[#8bb3ff] via-[#5685ff] to-[#91a5ff] bg-clip-text text-transparent">
                  without the friction.
                </span>
              </h1>

              <p className="mt-7 max-w-[590px] text-base leading-8 text-white/45 sm:text-lg">
                Create a USDC payment request, share one link,
                and receive funds directly in your wallet.
              </p>

              {/* Primary wallet CTA */}
              {!isConnected && (
                <div className="mt-9 animate-[fadeUp_.7s_ease-out]">
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-white px-5 text-sm font-semibold text-[#080b12] shadow-[0_12px_35px_-12px_rgba(255,255,255,.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0"
                  >
                    Connect wallet

                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      <path
                        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Compact summary */}
              <div className="mt-12 max-w-[620px] rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 animate-[fadeUp_.8s_ease-out]">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                      Payment
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/75">
                      USDC
                    </p>
                  </div>

                  <div className="h-8 w-px bg-white/[0.07]" />

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                      Network
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/75">
                      Arc Testnet
                    </p>
                  </div>

                  <div className="h-8 w-px bg-white/[0.07]" />

                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">
                      <ShieldIcon />
                    </span>

                    <div>
                      <p className="text-sm font-medium text-white/70">
                        Non-custodial
                      </p>

                      <p className="text-[11px] text-white/30">
                        Funds go straight to your wallet
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <p className="text-xs leading-5 text-white/35">
                    Your funds go directly to your wallet —
                    we never hold or control your money.
                  </p>
                </div>
              </div>
            </section>

            {/* RIGHT SIDE */}
            <section className="space-y-5 animate-[fadeIn_.7s_ease-out]">
              {/* Form card */}
              <div className="overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#0a101c]/95 shadow-[0_35px_100px_-40px_rgba(0,0,0,.95)] backdrop-blur-xl">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />

                <div className="p-6 sm:p-8">
                  <div className="mb-7">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-400/75">
                          Payment request
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                          Create a request
                        </h2>
                      </div>

                      <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-[10px] font-medium text-white/35">
                        USDC
                      </div>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-white/35">
                      Enter the amount and what the payment is for.
                    </p>
                  </div>

                  <CreatePaymentForm />
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-[24px] border border-white/[0.07] bg-[#090e18]/80 p-5 animate-[fadeUp_.9s_ease-out]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                      After you create it
                    </p>

                    <p className="mt-1 text-sm font-medium text-white/65">
                      Payment link preview
                    </p>
                  </div>

                  <span className="text-white/35">
                    <LinkIcon />
                  </span>
                </div>

                <div className="flex items-center gap-5 rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
                  <QrPlaceholder />

                  <div className="min-w-0">
                    <p className="text-xs text-white/30">
                      Shareable payment request
                    </p>

                    <p className="mt-2 text-lg font-semibold text-white/35">
                      25.00 USDC
                    </p>

                    <div className="mt-3 h-2 w-28 rounded-full bg-white/[0.06]" />

                    <div className="mt-2 h-2 w-20 rounded-full bg-white/[0.04]" />

                    <p className="mt-4 text-[11px] leading-5 text-white/25">
                      A unique link and QR code are generated
                      after your wallet signs the request.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
