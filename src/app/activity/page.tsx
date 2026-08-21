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
          <div className="px-6 pb-16 pt-8 sm:px-10 lg:px-12">

            {/* Header */}
            <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[12px] font-medium text-[#85868E]">
                  Wallet
                </p>

                <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
                  Activity
                </h1>

                <p className="mt-2 text-[13px] text-[#85868E]">
                  View your payment activity on Arc.
                </p>
              </div>

              <button
                type="button"
                className="flex h-10 items-center gap-2 self-start rounded-full border border-[#E2E2E6] px-4 text-[11px] font-medium text-[#55565D] transition hover:bg-[#F7F7F8] sm:self-auto"
              >
                <Filter size={14} strokeWidth={1.7} />
                All activity
              </button>
            </div>

            {/* Activity card */}
            <section className="overflow-hidden rounded-[22px] border border-[#E7E7EA] bg-white">

              {/* Tabs */}
              <div className="border-b border-[#E8E8EB] px-6">
                <div className="flex gap-8">
                  <button
                    type="button"
                    className="relative py-5 text-[14px] font-semibold text-[#111111]"
                  >
                    All

                    <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#111111]" />
                  </button>

                  <button
                    type="button"
                    className="py-5 text-[14px] font-medium text-[#999AA2]"
                  >
                    Sent
                  </button>

                  <button
                    type="button"
                    className="py-5 text-[14px] font-medium text-[#999AA2]"
                  >
                    Received
                  </button>
                </div>
              </div>

              {/* Column heading */}
              <div className="hidden grid-cols-[1fr_150px_130px] border-b border-[#EEEEF1] px-6 py-4 text-[10px] uppercase tracking-[0.1em] text-[#A0A1A8] sm:grid">
                <span>Transaction</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
              </div>

              {/* Empty state */}
              <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#F5F5F6] text-[#777880]">
                  <ActivityIcon
                    size={25}
                    strokeWidth={1.5}
                  />
                </div>

                <h2 className="mt-6 text-[17px] font-semibold">
                  No activity yet
                </h2>

                <p className="mt-2 max-w-[330px] text-[12px] leading-5 text-[#8C8D95]">
                  Your sent and received USDC payments
                  will appear here once activity is
                  available.
                </p>

                <div className="mt-6 flex items-center gap-2 rounded-full bg-[#F7F7F8] px-4 py-2.5 text-[10px] text-[#85868E]">
                  <Clock3 size={13} />
                  Waiting for on-chain activity
                </div>
              </div>
            </section>

            {/* Transaction anatomy */}
            <section className="mt-8 grid gap-4 md:grid-cols-3">

              <ActivityInfo
                icon={
                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.7}
                  />
                }
                title="Sent"
                description="Outgoing USDC payments."
              />

              <ActivityInfo
                icon={
                  <ArrowDownLeft
                    size={17}
                    strokeWidth={1.7}
                  />
                }
                title="Received"
                description="USDC received by your wallet."
              />

              <ActivityInfo
                icon={
                  <ExternalLink
                    size={17}
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
    <div className="rounded-[18px] border border-[#E7E7EA] bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F6] text-[#55565D]">
        {icon}
      </div>

      <h3 className="mt-4 text-[13px] font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-[11px] leading-5 text-[#8C8D95]">
        {description}
      </p>
    </div>
  );
}
