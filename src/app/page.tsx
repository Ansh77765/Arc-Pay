import { TopBar } from "@/components/TopBar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";

function NetworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
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
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
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

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080f] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-360px] h-[720px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/[0.08] blur-[150px]" />
        <div className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.06] blur-[140px]" />
        <div className="absolute bottom-[-300px] left-[-200px] h-[600px] w-[600px] rounded-full bg-blue-500/[0.05] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="relative z-10">
        <TopBar />

        <main className="mx-auto max-w-[1380px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_520px] xl:gap-24">
            {/* LEFT SIDE */}
            <section className="animate-fade-up">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3.5 py-2 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
                  Live on Arc Testnet
                </span>
              </div>

              <h1 className="max-w-[760px] text-[3.35rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.3rem]">
                Get paid in
                <br />
                <span className="bg-gradient-to-r from-[#75a7ff] via-[#4f7fff] to-[#8b9dff] bg-clip-text text-transparent">
                  USDC.
                </span>
              </h1>

              <p className="mt-7 max-w-[610px] text-[16px] leading-8 text-white/45 sm:text-lg">
                Create a payment request, share one link, and receive USDC
                directly in your wallet. Simple, transparent, and settled
                on-chain.
              </p>

              {/* Trust row */}
              <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">
                    <NetworkIcon />
                  </span>
                  <span>Arc Testnet</span>
                </div>

                <div className="h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <span className="text-blue-400">
                    <CoinIcon />
                  </span>
                  <span>USDC payments</span>
                </div>

                <div className="h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <span className="text-blue-400">
                    <ShieldIcon />
                  </span>
                  <span>Non-custodial</span>
                </div>
              </div>

              {/* Feature cards */}
              <div className="mt-14 grid max-w-[680px] grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/30">
                    Network
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/75">
                    Arc Testnet
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/30">
                    Asset
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/75">
                    USDC
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/30">
                    Settlement
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/75">
                    On-chain
                  </p>
                </div>
              </div>
            </section>

            {/* PAYMENT CARD */}
            <section
              className="animate-fade-up relative"
              style={{ animationDelay: "80ms" }}
            >
              {/* Glow behind card */}
              <div className="absolute -inset-5 rounded-[32px] bg-blue-500/[0.08] blur-3xl" />

              <div className="relative overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#0a101c]/95 shadow-[0_35px_100px_-35px_rgba(0,0,0,.9)] backdrop-blur-xl">
                {/* Top accent */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />

                <div className="p-6 sm:p-8">
                  {/* Card heading */}
                  <div className="mb-7 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-400/80">
                        Payment request
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
                        Request a payment
                      </h2>

                      <p className="mt-2 max-w-[370px] text-sm leading-6 text-white/40">
                        Set the amount and create a secure shareable payment
                        link.
                      </p>
                    </div>

                    <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/[0.08] text-blue-400 sm:flex">
                      <ArrowUpRight />
                    </div>
                  </div>

                  {/* IMPORTANT:
                      Keep your original working form.
                      No custom submit button is added here. */}
                  <CreatePaymentForm />
                </div>

                {/* Bottom security strip */}
                <div className="border-t border-white/[0.06] bg-white/[0.015] px-6 py-4 sm:px-8">
                  <div className="flex items-center justify-center gap-2 text-[11px] text-white/30">
                    <ShieldIcon />
                    <span>
                      Payments settle directly wallet-to-wallet on Arc
                    </span>
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
