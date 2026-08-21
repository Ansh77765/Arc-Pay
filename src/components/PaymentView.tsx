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
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Very subtle background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-360px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/50 blur-[120px]" />
      </div>

      {/* Testnet strip */}
      <div className="relative z-30 border-b border-blue-100 bg-blue-50">
        <div className="mx-auto flex h-8 max-w-[1320px] items-center justify-center px-5">
          <div className="flex items-center gap-2 text-[10px] font-medium text-blue-700/70">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

            <span>Arc Testnet</span>

            <span className="text-blue-300">
              ·
            </span>

            <span>
              Testnet funds have no real value
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10">

        <TopBar />

        <main className="mx-auto max-w-[1320px] px-5 pb-20 pt-8 sm:px-8 lg:px-10">

          {/* Page heading */}
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                Payments
              </div>

              <h1 className="text-[30px] font-bold tracking-[-0.045em] text-slate-900 sm:text-[38px]">
                Your money, on Arc.
              </h1>

              <p className="mt-2 max-w-[540px] text-[13px] leading-6 text-slate-500">
                Send and request USDC with simple,
                secure, non-custodial payments.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>

              <span className="text-[11px] font-semibold text-slate-600">
                Arc network
              </span>

              <span className="text-[10px] text-slate-300">
                Connected
              </span>
            </div>
          </header>

          {/* Balance card */}
          <section className="relative mb-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-transparent to-transparent" />

            <div className="relative grid lg:grid-cols-[1fr_auto]">

              {/* Balance */}
              <div className="p-6 sm:p-8 lg:p-9">

                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                  <Wallet />

                  Available balance
                </div>

                <div className="mt-5 flex items-end gap-3">

                  <span className="text-[48px] font-bold tracking-[-0.065em] text-slate-900 sm:text-[58px]">
                    —
                  </span>

                  <span className="mb-2 text-sm font-semibold text-blue-600">
                    USDC
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                  Connect your wallet to view balance
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center border-t border-slate-100 p-5 sm:p-7 lg:border-l lg:border-t-0">

                <div className="grid grid-cols-2 gap-3">

                  {/* Informational button until send flow exists */}
                  <button
                    type="button"
                    disabled
                    title="Send flow coming soon"
                    className="flex h-12 min-w-[120px] cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-400"
                  >
                    <ArrowUp />

                    Send
                  </button>

                  {/* Request is available through the form below */}
                  <a
                    href="#request-usdc"
                    className="flex h-12 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    <Plus />

                    Request
                  </a>

                </div>
              </div>
            </div>

            {/* Account metadata */}
            <div className="relative grid border-t border-slate-100 sm:grid-cols-3">

              <div className="border-b border-slate-100 px-6 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Network
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-700">
                  Arc Testnet
                </p>
              </div>

              <div className="border-b border-slate-100 px-6 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Currency
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-700">
                  USD Coin · USDC
                </p>
              </div>

              <div className="px-6 py-4">

                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Settlement
                </p>

                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <Shield />

                  Non-custodial
                </div>
              </div>
            </div>
          </section>

          {/* Main content */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">

            {/* Activity */}
            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.045)]">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                <div>
                  <h2 className="text-[15px] font-bold text-slate-800">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Your latest payments and requests
                  </p>
                </div>

                {/* No activity page exists yet */}
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                  View all
                  <ChevronRight />
                </span>
              </div>

              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-500">
                  <Activity />
                </div>

                <h3 className="mt-5 text-sm font-semibold text-slate-700">
                  Nothing here yet
                </h3>

                <p className="mt-2 max-w-[300px] text-[11px] leading-5 text-slate-400">
                  Once you send or receive USDC,
                  your payment activity will appear
                  here.
                </p>

                <a
                  href="#request-usdc"
                  className="mt-5 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <Plus />

                  Create your first request
                </a>
              </div>
            </section>

            {/* Create request */}
            <section
              id="request-usdc"
              className="scroll-mt-24 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.045)]"
            >

              <div className="border-b border-slate-100 px-6 py-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-blue-600">
                      Payment request
                    </p>

                    <h2 className="mt-1.5 text-[19px] font-bold tracking-[-0.03em] text-slate-800">
                      Request USDC
                    </h2>

                    <p className="mt-2 text-[11px] leading-5 text-slate-400">
                      Create a payment request and
                      share it with anyone.
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[9px] font-bold tracking-wide text-blue-600">
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

            <PrincipleCard
              icon={
                <Plus />
              }
              title="Simple payment requests"
              description="Create a request, share the link, and get paid directly."
              iconClass="bg-blue-50 text-blue-600 border-blue-100"
            />

            <PrincipleCard
              icon={
                <Shield />
              }
              title="You stay in control"
              description="Arc Pay never takes custody of your funds or private keys."
              iconClass="bg-emerald-50 text-emerald-600 border-emerald-100"
            />

            <PrincipleCard
              icon={
                <External />
              }
              title="Verifiable payments"
              description="Every completed payment can be verified on-chain."
              iconClass="bg-indigo-50 text-indigo-600 border-indigo-100"
            />

          </section>

          {/* Footer */}
          <footer className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <span className="font-bold text-slate-600">
              Arc Pay
            </span>

            <div className="flex flex-wrap items-center gap-4">
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

function PrincipleCard({
  icon,
  title,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]">

      <div
        className={`mb-5 flex h-9 w-9 items-center justify-center rounded-xl border ${iconClass}`}
      >
        {icon}
      </div>

      <h3 className="text-xs font-bold text-slate-700">
        {title}
      </h3>

      <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}
