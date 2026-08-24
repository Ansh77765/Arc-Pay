"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Plus,
  Wallet,
} from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import { UsernameModal } from "@/components/UsernameModal";

import {
  USDC_ADDRESS,
  USDC_DECIMALS,
  EXPLORER_URL,
} from "@/lib/config";

import {
  getWalletActivity,
  type ActivityItem,
} from "@/lib/activity";

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
] as const;

export default function DashboardPage() {
  const [createPaymentOpen, setCreatePaymentOpen] =
    useState(false);

  const [usernameOpen, setUsernameOpen] =
    useState(false);

  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [activityLoading, setActivityLoading] =
    useState(false);

  const { address, isConnected } =
    useAccount();

  const {
    data: balance,
    isLoading: balanceLoading,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address
      ? [address]
      : undefined,
    query: {
      enabled:
        isConnected &&
        !!address,
    },
  });

  const formattedBalance =
    balance !== undefined
      ? (
          Number(balance) /
          10 ** USDC_DECIMALS
        ).toFixed(2)
      : "0.00";

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      if (!address) {
        setActivities([]);
        return;
      }

      setActivityLoading(true);

      try {
        const result =
          await getWalletActivity(address);

        if (!cancelled) {
          setActivities(result);
        }
      } catch {
        if (!cancelled) {
          setActivities([]);
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [address]);

  const recentActivities =
    activities.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#11131A]">

      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="px-5 pb-16 pt-7 sm:px-8 lg:px-10">

            {/* ==================================================
                HEADER
                ================================================== */}

            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-[#6366F1]" />

                  <p className="text-[11px] font-semibold tracking-wide text-[#747986]">
                    ARC PAY
                  </p>

                </div>

                <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.055em] text-[#11131A]">
                  Dashboard
                </h1>

                <p className="mt-2 text-[13px] text-[#7D838F]">
                  Your home for fast USDC payments on Arc.
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setUsernameOpen(true)
                  }
                  className="flex h-10 items-center justify-center rounded-full border border-[#E1E4EA] bg-white px-4 text-[11px] font-semibold text-[#414650] shadow-[0_1px_2px_rgba(17,19,26,0.03)] transition hover:border-[#D5D9E1] hover:bg-[#FAFAFC]"
                >
                  Reserve username
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCreatePaymentOpen(true)
                  }
                  className="arc-primary flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[11px] font-semibold"
                >
                  <Plus
                    size={14}
                    strokeWidth={2}
                  />

                  Request USDC
                </button>

              </div>

            </div>

            {/* ==================================================
                BALANCE
                ================================================== */}

            <section className="relative overflow-hidden rounded-[24px] bg-[#0C1220] shadow-[0_18px_50px_rgba(17,19,26,0.12)]">

              <div className="pointer-events-none absolute -right-20 -top-28 h-[320px] w-[320px] rounded-full bg-[#4F46E5]/20 blur-[80px]" />

              <div className="pointer-events-none absolute -bottom-40 right-[20%] h-[280px] w-[280px] rounded-full bg-[#2563EB]/10 blur-[80px]" />

              <div className="relative flex flex-col justify-between gap-8 p-6 sm:flex-row sm:items-end sm:p-8">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                      <span className="text-[14px] font-bold text-white">
                        $
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-white/60">
                      USDC Balance
                    </p>

                  </div>

                  <div className="mt-4 flex items-end gap-2">

                    <span className="tabular text-[44px] font-semibold leading-none tracking-[-0.065em] text-white">
                      {balanceLoading
                        ? "—"
                        : formattedBalance}
                    </span>

                    <span className="mb-1 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-white/70 ring-1 ring-white/10">
                      USDC
                    </span>

                  </div>

                  <div className="mt-4 flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />

                    <span className="text-[10px] text-white/50">
                      Available on Arc Testnet
                    </span>

                  </div>

                </div>

                <div className="flex gap-2">

                  <Link
                    href="/send"
                    className="flex h-10 items-center justify-center rounded-full bg-white/[0.07] px-5 text-[10px] font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/[0.12]"
                  >
                    Send
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setCreatePaymentOpen(true)
                    }
                    className="arc-accent flex h-10 items-center justify-center rounded-full px-5 text-[10px] font-semibold"
                  >
                    Request
                  </button>

                </div>

              </div>

            </section>

            {/* ==================================================
                QUICK ACTIONS
                ================================================== */}

            <div className="mt-7">

              <SectionHeading
                title="Quick actions"
                description="Move money in a few seconds."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    setCreatePaymentOpen(true)
                  }
                  className="group arc-card arc-card-hover relative overflow-hidden p-5 text-left"
                >

                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#8B5CF6]/[0.06] blur-2xl" />

                  <div className="relative flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#F1EDFF] text-[#6D4AFF]">
                      <ArrowDownLeft
                        size={19}
                        strokeWidth={1.8}
                      />
                    </div>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8EAF0] text-[#777D89] transition group-hover:border-[#D9DCE5] group-hover:text-[#4F46E5]">
                      →
                    </span>

                  </div>

                  <h2 className="relative mt-5 text-[14px] font-semibold tracking-[-0.02em]">
                    Request USDC
                  </h2>

                  <p className="relative mt-1.5 max-w-[340px] text-[11px] leading-5 text-[#858B97]">
                    Request USDC from another Arc Pay user.
                  </p>

                </button>

                <Link
                  href="/send"
                  className="group arc-card arc-card-hover relative overflow-hidden p-5"
                >

                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#2563EB]/[0.06] blur-2xl" />

                  <div className="relative flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EAF2FF] text-[#2563EB]">
                      <ArrowUpRight
                        size={19}
                        strokeWidth={1.8}
                      />
                    </div>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8EAF0] text-[#777D89] transition group-hover:border-[#D9DCE5] group-hover:text-[#2563EB]">
                      →
                    </span>

                  </div>

                  <h2 className="relative mt-5 text-[14px] font-semibold tracking-[-0.02em]">
                    Send USDC
                  </h2>

                  <p className="relative mt-1.5 max-w-[340px] text-[11px] leading-5 text-[#858B97]">
                    Send USDC directly to a wallet or Arc Pay username.
                  </p>

                </Link>

              </div>

            </div>

            {/* ==================================================
                RECENT ACTIVITY
                ================================================== */}

            <section className="arc-card mt-7 overflow-hidden">

              <div className="flex items-center justify-between border-b border-[#EEF0F4] px-5 py-5 sm:px-6">

                <div>

                  <h2 className="text-[14px] font-semibold tracking-[-0.02em]">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-[10px] text-[#9298A4]">
                    Your latest on-chain payments.
                  </p>

                </div>

                <Link
                  href="/activity"
                  className="rounded-full px-3 py-1.5 text-[10px] font-semibold text-[#5B61D6] transition hover:bg-[#F2F2FF]"
                >
                  View all
                </Link>

              </div>

              {activityLoading ? (

                <div className="flex min-h-[220px] items-center justify-center">

                  <div className="flex items-center gap-2 text-[10px] text-[#8D939F]">

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6366F1]" />

                    Loading activity…

                  </div>

                </div>

              ) : recentActivities.length === 0 ? (

                <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#F3F4F8] text-[#777D89]">

                    <Wallet
                      size={19}
                      strokeWidth={1.5}
                    />

                  </div>

                  <h3 className="mt-4 text-[13px] font-semibold">
                    No activity yet
                  </h3>

                  <p className="mt-1.5 max-w-[280px] text-[10px] leading-5 text-[#9298A4]">
                    Your sent and received USDC payments will appear here.
                  </p>

                </div>

              ) : (

                <div>

                  {recentActivities.map(
                    (activity, index) => (
                      <RecentActivityRow
                        key={`${activity.hash}-${activity.type}-${index}`}
                        activity={activity}
                      />
                    )
                  )}

                </div>

              )}

            </section>

            {/* ==================================================
                TRUST / NETWORK
                ================================================== */}

            <div className="mt-7 grid gap-3 md:grid-cols-3">

              <InfoCard
                title="Built on Arc"
                description="USDC-native payments settle directly on Arc Testnet."
                accent="blue"
              />

              <InfoCard
                title="Non-custodial"
                description="Your wallet stays under your control."
                accent="green"
              />

              <InfoCard
                title="Simple by design"
                description="Send, request, and track USDC without the clutter."
                accent="purple"
              />

            </div>

          </div>

        </main>

      </div>

      {/* ==================================================
          MODALS
          ================================================== */}

      <CreatePaymentForm
        open={createPaymentOpen}
        onClose={() =>
          setCreatePaymentOpen(false)
        }
      />

      <UsernameModal
        open={usernameOpen}
        onClose={() =>
          setUsernameOpen(false)
        }
        address={address}
      />

    </div>
  );
}

/* ============================================================
   SECTION HEADING
   ============================================================ */

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>

      <h2 className="text-[14px] font-semibold tracking-[-0.02em]">
        {title}
      </h2>

      <p className="mt-1 text-[10px] text-[#9298A4]">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   RECENT ACTIVITY
   ============================================================ */

function RecentActivityRow({
  activity,
}: {
  activity: ActivityItem;
}) {
  const isSent =
    activity.type === "sent";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EEF0F4] px-5 py-4 transition last:border-b-0 hover:bg-[#FCFCFE] sm:px-6">

      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isSent
              ? "bg-[#EEF4FF] text-[#2563EB]"
              : "bg-[#ECFAF4] text-[#16A36A]"
          }`}
        >

          {isSent ? (
            <ArrowUpRight
              size={15}
              strokeWidth={1.8}
            />
          ) : (
            <ArrowDownLeft
              size={15}
              strokeWidth={1.8}
            />
          )}

        </div>

        <div className="min-w-0">

          <p className="text-[11px] font-semibold">
            {isSent
              ? "USDC sent"
              : "USDC received"}
          </p>

          <p className="mt-1 truncate font-mono text-[9px] text-[#999FAA]">
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

      <div className="flex shrink-0 items-center gap-3">

        <p
          className={`tabular text-[11px] font-semibold ${
            isSent
              ? "text-[#D05B5B]"
              : "text-[#16A36A]"
          }`}
        >
          {isSent ? "-" : "+"}
          {activity.amount} USDC
        </p>

        <a
          href={`${EXPLORER_URL}/tx/${activity.hash}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#A0A5B0] transition hover:bg-[#F4F5F8] hover:text-[#4F46E5]"
          title="View transaction"
        >
          <ExternalLink size={12} />
        </a>

      </div>

    </div>
  );
}

/* ============================================================
   INFO CARD
   ============================================================ */

function InfoCard({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: "blue" | "green" | "purple";
}) {
  const accentClasses = {
    blue: "bg-[#EAF2FF] text-[#2563EB]",
    green: "bg-[#EAF8F2] text-[#16A36A]",
    purple: "bg-[#F1EDFF] text-[#6D4AFF]",
  };

  return (
    <div className="arc-card p-4 transition hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(17,19,26,0.045)]">

      <div className="flex items-center gap-2">

        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${accentClasses[accent]}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        </span>

        <h3 className="text-[12px] font-semibold">
          {title}
        </h3>

      </div>

      <p className="mt-2.5 text-[10px] leading-5 text-[#858B97]">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   ADDRESS
   ============================================================ */

function shortAddress(
  address: string
) {
  return `${address.slice(
    0,
    6
  )}...${address.slice(-4)}`;
}
