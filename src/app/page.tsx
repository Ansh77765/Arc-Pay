"use client";

import { TopBar } from "@/components/TopBar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import {
  Home,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Settings,
  Wallet,
  ShieldCheck,
  Plus,
  ChevronRight,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-[#E8EAF0] bg-white lg:flex lg:min-h-[calc(100vh-68px)] lg:flex-col">
      <div className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A0A5B1]">
          Menu
        </p>

        <nav className="space-y-1">
          <SidebarItem
            icon={<Home size={17} />}
            label="Home"
            active
          />

          <SidebarItem
            icon={<ArrowUpRight size={17} />}
            label="Send"
          />

          <SidebarItem
            icon={<ArrowDownLeft size={17} />}
            label="Receive"
          />

          <SidebarItem
            icon={<Activity size={17} />}
            label="Activity"
          />
        </nav>
      </div>

      <div className="border-t border-[#E8EAF0] p-4">
        <SidebarItem
          icon={<Settings size={17} />}
          label="Settings"
        />
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
        active
          ? "bg-[#EEF2FF] text-[#5B5FEF]"
          : "text-[#6B7280] hover:bg-[#F7F8FC] hover:text-[#111318]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#111318]">
      {/* Existing real wallet connection */}
      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar />

        <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B5FEF]">
                Arc Pay
              </p>

              <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#111318] sm:text-[32px]">
                Home
              </h1>

              <p className="mt-1.5 text-[13px] text-[#737987]">
                Manage your USDC payments on Arc.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#E3E6ED] bg-white px-3.5 py-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] font-medium text-[#596170]">
                Arc Testnet
              </span>
            </div>
          </header>

          {/* Balance */}
          <section className="mb-6 overflow-hidden rounded-[24px] border border-[#E5E8EF] bg-white shadow-[0_12px_40px_-25px_rgba(20,30,60,0.25)]">
            <div className="flex flex-col justify-between gap-8 p-7 sm:p-9 lg:flex-row lg:items-center lg:p-10">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B919D]">
                  <Wallet size={15} />
                  Available balance
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-[48px] font-semibold tracking-[-0.06em] text-[#111318] sm:text-[58px]">
                    —
                  </span>

                  <span className="text-sm font-semibold text-[#5B5FEF]">
                    USDC
                  </span>
                </div>

                <p className="mt-2 text-[12px] text-[#9AA0AA]">
                  Connect your wallet to view your balance.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex h-11 items-center gap-2 rounded-xl border border-[#DDE1E9] bg-white px-5 text-[12px] font-semibold text-[#687080] transition hover:border-[#C8CDD8] hover:bg-[#F9FAFC]"
                >
                  <ArrowUpRight size={16} />
                  Send
                </button>

                <a
                  href="#request-usdc"
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#5B5FEF] px-5 text-[12px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(91,95,239,.8)] transition hover:-translate-y-0.5 hover:bg-[#4F53DE]"
                >
                  <Plus size={16} />
                  Request
                </a>
              </div>
            </div>

            <div className="grid border-t border-[#EEF0F4] sm:grid-cols-3">
              <InfoItem
                label="Network"
                value="Arc Testnet"
              />

              <InfoItem
                label="Currency"
                value="USD Coin · USDC"
                bordered
              />

              <InfoItem
                label="Settlement"
                value="Non-custodial"
                icon={<ShieldCheck size={14} />}
                success
              />
            </div>
          </section>

          {/* Main content */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            {/* Activity */}
            <section className="overflow-hidden rounded-[22px] border border-[#E5E8EF] bg-white shadow-[0_12px_40px_-28px_rgba(20,30,60,0.22)]">
              <div className="flex items-center justify-between border-b border-[#EEF0F4] px-6 py-5">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#20242D]">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-[11px] text-[#969CA7]">
                    Your latest payments and requests
                  </p>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#5B5FEF]"
                >
                  View all
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F1FF] text-[#5B5FEF]">
                  <Activity size={22} />
                </div>

                <h3 className="mt-5 text-[14px] font-semibold text-[#343944]">
                  No activity yet
                </h3>

                <p className="mt-2 max-w-[290px] text-[11px] leading-5 text-[#979DA8]">
                  Your completed payment activity will
                  appear here.
                </p>

                <a
                  href="#request-usdc"
                  className="mt-5 rounded-xl border border-[#DCDFFB] bg-[#F5F5FF] px-4 py-2.5 text-[11px] font-semibold text-[#5B5FEF] transition hover:bg-[#EEEDFF]"
                >
                  Create payment request
                </a>
              </div>
            </section>

            {/* Request */}
            <section
              id="request-usdc"
              className="scroll-mt-24 overflow-hidden rounded-[22px] border border-[#E5E8EF] bg-white shadow-[0_12px_40px_-28px_rgba(20,30,60,0.22)]"
            >
              <div className="border-b border-[#EEF0F4] px-6 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5B5FEF]">
                      Payment request
                    </p>

                    <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.035em] text-[#20242D]">
                      Request USDC
                    </h2>

                    <p className="mt-2 text-[11px] leading-5 text-[#969CA7]">
                      Create a secure payment request
                      and share it with anyone.
                    </p>
                  </div>

                  <span className="rounded-lg bg-[#F0F1FF] px-2.5 py-1.5 text-[9px] font-bold text-[#5B5FEF]">
                    USDC
                  </span>
                </div>
              </div>

              <div className="p-6">
                <CreatePaymentForm />
              </div>
            </section>
          </div>

          {/* Trust / information */}
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Simple payment requests"
              description="Create a request, share the link, and get paid directly."
            />

            <FeatureCard
              title="Non-custodial"
              description="Your funds and private keys remain under your control."
            />

            <FeatureCard
              title="On-chain settlement"
              description="Completed payments can be verified directly on Arc."
            />
          </section>

          <footer className="mt-10 border-t border-[#E5E8EF] pt-5 text-[10px] text-[#A0A5AF]">
            Arc Pay · USDC payments · Arc Testnet
          </footer>
        </main>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
  bordered = false,
  success = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  bordered?: boolean;
  success?: boolean;
}) {
  return (
    <div
      className={`px-6 py-4 ${
        bordered ? "border-y border-[#EEF0F4] sm:border-x sm:border-y-0" : ""
      }`}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#A0A5AF]">
        {label}
      </p>

      <div
        className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium ${
          success ? "text-emerald-600" : "text-[#596170]"
        }`}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#E5E8EF] bg-white p-5 shadow-[0_8px_30px_-25px_rgba(20,30,60,0.25)]">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F1FF] text-[#5B5FEF]">
        <ShieldCheck size={17} />
      </div>

      <h3 className="text-[12px] font-semibold text-[#343944]">
        {title}
      </h3>

      <p className="mt-1.5 text-[10px] leading-5 text-[#969CA7]">
        {description}
      </p>
    </div>
  );
}
