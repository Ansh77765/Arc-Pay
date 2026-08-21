"use client";

import {
  Activity as ActivityIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  ExternalLink,
  Filter,
} from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="px-6 pb-12 pt-7 sm:px-10 lg:px-12">

            {/* HEADER */}
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium text-[#85868E]">
                  Wallet
                </p>

                <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.045em]">
                  Activity
                </h1>

                <p className="mt-1.5 text-[12px] text-[#85868E]">
                  View your payment activity on Arc.
                </p>
              </div>

              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-full border border-[#E2E2E6] px-3.5 text-[10px] font-medium text-[#55565D] transition hover:bg-[#F7F7F8]"
              >
                <Filter
                  size={13}
                  strokeWidth={1.7}
                />

                All activity
              </button>
            </div>

            {/* ACTIVITY */}
            <section className="overflow-hidden rounded-[20px] border border-[#E7E7EA] bg-white">

              {/* TABS */}
              <div className="border-b border-[#E8E8EB] px-5">
                <div className="flex gap-7">

                  <button
                    type="button"
                    className="relative py-4 text-[12px] font-semibold text-[#111111]"
                  >
                    All

                    <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#111111]" />
                  </button>

                  <button
                    type="button"
                    className="py-4 text-[12px] font-medium text-[#999AA2] hover:text-[#55565D]"
                  >
                    Sent
                  </button>

                  <button
                    type="button"
                    className="py-4 text-[12px] font-medium text-[#999AA2] hover:text-[#55565D]"
                  >
                    Received
                  </button>
                </div>
              </div>

              {/* COLUMNS */}
              <div className="hidden grid-cols-[1fr_150px_130px] border-b border-[#EEEEF1] px-5 py-3.5 text-[9px] uppercase tracking-[0.1em] text-[#A0A1A8] sm:grid">
                <span>Transaction</span>
                <span>Status</span>
                <span className="text-right">
                  Amount
                </span>
              </div>

              {/* EMPTY STATE */}
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[#F5F5F6] text-[#777880]">
                  <ActivityIcon
                    size={23}
                    strokeWidth={1.5}
                  />
                </div>

                <h2 className="mt-5 text-[16px] font-semibold">
                  No activity yet
                </h2>

                <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-[#8C8D95]">
                  Your sent and received USDC
                  payments will appear here once
                  there is on-chain activity.
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-full bg-[#F7F7F8] px-3.5 py-2 text-[9px] font-medium text-[#85868E]">
                  <Clock3 size={12} />
                  Waiting for on-chain activity
                </div>
              </div>
            </section>

            {/* ACTIVITY TYPES */}
            <section className="mt-6 grid gap-3 md:grid-cols-3">

              <ActivityInfo
                icon={
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.7}
                  />
                }
                title="Sent"
                description="Outgoing USDC payments."
              />

              <ActivityInfo
                icon={
                  <ArrowDownLeft
                    size={16}
                    strokeWidth={1.7}
                  />
                }
                title="Received"
                description="USDC received by your wallet."
              />

              <ActivityInfo
                icon={
                  <ExternalLink
                    size={16}
                    strokeWidth={1.7}
                  />
                }
                title="On-chain"
                description="Transactions can be verified on Arc."
              />

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function ActivityInfo({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[17px] border border-[#E7E7EA] bg-white p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F6] text-[#55565D]">
        {icon}
      </div>

      <h3 className="mt-3 text-[12px] font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-5 text-[#8C8D95]">
        {description}
      </p>
    </div>
  );
}
