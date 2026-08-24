"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
} from "wagmi";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Activity as ActivityIcon,
  Clock3,
  ExternalLink,
  Filter,
  Loader2,
} from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";

import {
  USDC_ADDRESS,
  USDC_DECIMALS,
  EXPLORER_URL,
} from "@/lib/config";

const erc20Abi = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

type ActivityType =
  | "all"
  | "sent"
  | "received";

type ActivityItem = {
  type: "sent" | "received";
  hash: string;
  from: string;
  to: string;
  amount: string;
};

export default function ActivityPage() {
  const {
    address,
    isConnected,
  } = useAccount();

  const [activeTab, setActiveTab] =
    useState<ActivityType>("all");

  /*
   * ============================================================
   * NOTE
   * ============================================================
   *
   * The current Wagmi setup doesn't expose historical event
   * queries directly here, so this page starts with the proper
   * connected-wallet structure.
   *
   * We'll use Arc's RPC/log history next rather than inventing
   * activity data.
   */

  const activities: ActivityItem[] = [];

  const filteredActivities =
    useMemo(() => {
      if (activeTab === "all") {
        return activities;
      }

      return activities.filter(
        (item) =>
          item.type ===
          activeTab
      );
    }, [activeTab]);

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

              <div className="flex items-center gap-2 rounded-full border border-[#E2E2E6] px-3.5 py-2">

                <Filter
                  size={13}
                  strokeWidth={1.7}
                />

                <span className="text-[10px] font-medium text-[#55565D]">
                  All activity
                </span>

              </div>

            </div>

            {/* ACTIVITY */}

            <section className="overflow-hidden rounded-[20px] border border-[#E7E7EA] bg-white">

              {/* TABS */}

              <div className="border-b border-[#E8E8EB] px-5">

                <div className="flex gap-7">

                  <ActivityTab
                    label="All"
                    active={
                      activeTab === "all"
                    }
                    onClick={() =>
                      setActiveTab("all")
                    }
                  />

                  <ActivityTab
                    label="Sent"
                    active={
                      activeTab === "sent"
                    }
                    onClick={() =>
                      setActiveTab("sent")
                    }
                  />

                  <ActivityTab
                    label="Received"
                    active={
                      activeTab === "received"
                    }
                    onClick={() =>
                      setActiveTab("received")
                    }
                  />

                </div>

              </div>

              {/* COLUMNS */}

              <div className="hidden grid-cols-[1fr_150px_130px] border-b border-[#EEEEF1] px-5 py-3.5 text-[9px] uppercase tracking-[0.1em] text-[#A0A1A8] sm:grid">

                <span>
                  Transaction
                </span>

                <span>
                  Status
                </span>

                <span className="text-right">
                  Amount
                </span>

              </div>

              {/* CONTENT */}

              {!isConnected ? (

                <EmptyState
                  title="Connect your wallet"
                  description="Connect your wallet to view your USDC activity on Arc."
                />

              ) : filteredActivities.length === 0 ? (

                <EmptyState
                  title="No activity yet"
                  description="Your sent and received USDC payments will appear here once there is on-chain activity."
                />

              ) : (

                <div>
                  {filteredActivities.map(
                    (activity) => (
                      <ActivityRow
                        key={
                          activity.hash
                        }
                        activity={
                          activity
                        }
                      />
                    )
                  )}
                </div>

              )}

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

/* ================================================================
   TAB
   ================================================================ */

function ActivityTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative py-4 text-[12px] ${
        active
          ? "font-semibold text-[#111111]"
          : "font-medium text-[#999AA2] hover:text-[#55565D]"
      }`}
    >
      {label}

      {active && (
        <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#111111]" />
      )}
    </button>
  );
}

/* ================================================================
   EMPTY STATE
   ================================================================ */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[#F5F5F6] text-[#777880]">

        <ActivityIcon
          size={23}
          strokeWidth={1.5}
        />

      </div>

      <h2 className="mt-5 text-[16px] font-semibold">
        {title}
      </h2>

      <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-[#8C8D95]">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 rounded-full bg-[#F7F7F8] px-3.5 py-2 text-[9px] font-medium text-[#85868E]">

        <Clock3 size={12} />

        Waiting for on-chain activity

      </div>

    </div>
  );
}

/* ================================================================
   ACTIVITY ROW
   ================================================================ */

function ActivityRow({
  activity,
}: {
  activity: ActivityItem;
}) {
  const isSent =
    activity.type === "sent";

  return (
    <div className="grid gap-3 border-b border-[#EEEEF1] px-5 py-4 sm:grid-cols-[1fr_150px_130px] sm:items-center">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F6]">

          {isSent ? (
            <ArrowUpRight
              size={15}
              strokeWidth={1.7}
            />
          ) : (
            <ArrowDownLeft
              size={15}
              strokeWidth={1.7}
            />
          )}

        </div>

        <div className="min-w-0">

          <p className="text-[11px] font-semibold">
            {isSent
              ? "USDC sent"
              : "USDC received"}
          </p>

          <p className="mt-1 truncate font-mono text-[9px] text-[#999AA2]">
            {isSent
              ? `To ${shortAddress(
                  activity.to
                )}`
              : `From ${shortAddress(
                  activity.from
                )}`}
          </p>

        </div>

      </div>

      <div>

        <span className="rounded-full bg-[#F0FAF4] px-2.5 py-1 text-[8px] font-semibold text-[#31A66A]">
          Confirmed
        </span>

      </div>

      <div className="text-left sm:text-right">

        <p
          className={`text-[11px] font-semibold ${
            isSent
              ? "text-[#D65A5A]"
              : "text-[#31A66A]"
          }`}
        >
          {isSent
            ? "-"
            : "+"}
          {activity.amount} USDC
        </p>

        <a
          href={`${EXPLORER_URL}/tx/${activity.hash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-[8px] text-[#999AA2] hover:text-[#55565D]"
        >
          View

          <ExternalLink
            size={9}
          />
        </a>

      </div>

    </div>
  );
}

/* ================================================================
   INFO CARD
   ================================================================ */

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

/* ================================================================
   SHORT ADDRESS
   ================================================================ */

function shortAddress(
  address: string
) {
  return `${address.slice(
    0,
    6
  )}...${address.slice(-4)}`;
}
