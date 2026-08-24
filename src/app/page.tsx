"use client";

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

  /*
   * ============================================================
   * REAL USDC BALANCE
   * ============================================================
   */

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

  /*
   * ============================================================
   * REAL ACTIVITY
   * ============================================================
   */

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
    <div className="min-h-screen bg-white text-[#111111]">

      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="px-6 pb-16 pt-8 sm:px-10 lg:px-12">

            {/* HEADER */}

            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-[12px] font-medium text-[#85868E]">
                  Overview
                </p>

                <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#111111]">
                  Dashboard
                </h1>

                <p className="mt-2 text-[13px] text-[#85868E]">
                  Send and receive USDC payments on Arc.
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setUsernameOpen(true)
                  }
                  className="flex h-10 items-center justify-center rounded-full border border-[#E1E1E4] bg-white px-4 text-[11px] font-semibold text-[#33343A] transition hover:bg-[#F7F7F8]"
                >
                  Reserve username
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCreatePaymentOpen(true)
                  }
                  className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
                >
                  <Plus
                    size={14}
                    strokeWidth={1.8}
                  />

                  Create payment
                </button>

              </div>
            </div>

            {/* BALANCE CARD */}

            <section className="rounded-[22px] border border-[#E7E7EA] bg-white">

              <div className="flex flex-col justify-between gap-8 p-6 sm:flex-row sm:items-end sm:p-7">

                <div>

                  <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#A0A1A8]">
                    Wallet balance
                  </p>

                  <div className="mt-3 flex items-end gap-2">

                    <span className="text-[38px] font-semibold tracking-[-0.05em] text-[#111111]">
                      {balanceLoading
                        ? "—"
                        : formattedBalance}
                    </span>

                    <span className="mb-1.5 rounded-full bg-[#F5F5F6] px-2.5 py-1 text-[9px] font-semibold text-[#66676E]">
                      USDC
                    </span>

                  </div>

                  <div className="mt-3 flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-[#31A66A]" />

                    <span className="text-[10px] text-[#85868E]">
                      Arc Testnet
                    </span>

                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-full bg-[#F7F7F8] px-3 py-2">

                  <Wallet
                    size={14}
                    strokeWidth={1.7}
                    className="text-[#777880]"
                  />

                  <span className="font-mono text-[10px] text-[#777880]">
                    {isConnected
                      ? "Wallet connected"
                      : "Wallet not connected"}
                  </span>

                </div>

              </div>

            </section>

            {/* QUICK ACTIONS */}

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {/* RECEIVE */}

              <button
                type="button"
                onClick={() =>
                  setCreatePaymentOpen(true)
                }
                className="group rounded-[20px] border border-[#E7E7EA] bg-white p-5 text-left transition hover:border-[#DADADF] hover:bg-[#FCFCFC]"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F6] text-[#55565D]">

                  <ArrowDownLeft
                    size={18}
                    strokeWidth={1.7}
                  />

                </div>

                <h2 className="mt-5 text-[14px] font-semibold text-[#111111]">
                  Receive USDC
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-[#8C8D95]">
                  Create a payment request and
                  share the link.
                </p>

                <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#55565D]">
                  Create request

                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>

              </button>

              {/* SEND */}

              <a
                href="/send"
                className="group rounded-[20px] border border-[#E7E7EA] bg-white p-5 text-left transition hover:border-[#DADADF] hover:bg-[#FCFCFC]"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F6] text-[#55565D]">

                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.7}
                  />

                </div>

                <h2 className="mt-5 text-[14px] font-semibold text-[#111111]">
                  Send USDC
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-[#8C8D95]">
                  Send USDC directly to a wallet
                  or Arc Pay username.
                </p>

                <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#55565D]">
                  Send payment

                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>

              </a>

            </div>

            {/* RECENT ACTIVITY */}

            <section className="mt-6 overflow-hidden rounded-[22px] border border-[#E7E7EA] bg-white">

              <div className="flex items-center justify-between border-b border-[#EEEEF1] px-6 py-5">

                <div>

                  <h2 className="text-[14px] font-semibold text-[#111111]">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-[10px] text-[#999AA2]">
                    Your latest payment activity.
                  </p>

                </div>

                <a
                  href="/activity"
                  className="text-[10px] font-medium text-[#777880] transition hover:text-[#111111]"
                >
                  View all
                </a>

              </div>

              {activityLoading ? (

                <div className="flex min-h-[240px] items-center justify-center">

                  <p className="text-[10px] text-[#999AA2]">
                    Loading activity…
                  </p>

                </div>

              ) : recentActivities.length === 0 ? (

                <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F6]">

                    <Wallet
                      size={19}
                      strokeWidth={1.5}
                      className="text-[#777880]"
                    />

                  </div>

                  <h3 className="mt-4 text-[13px] font-semibold text-[#33343A]">
                    No activity yet
                  </h3>

                  <p className="mt-1.5 max-w-[280px] text-[10px] leading-5 text-[#999AA2]">
                    Your sent and received USDC
                    payments will appear here.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setCreatePaymentOpen(true)
                    }
                    className="mt-5 flex items-center gap-2 rounded-full bg-[#F5F5F6] px-4 py-2.5 text-[10px] font-semibold text-[#55565D] transition hover:bg-[#EEEEF0]"
                  >
                    <Plus size={13} />

                    Create payment
                  </button>

                </div>

              ) : (

                <div>

                  {recentActivities.map(
                    (activity, index) => (
                      <RecentActivityRow
                        key={`${activity.hash}-${activity.type}-${index}`}
                        activity={
                          activity
                        }
                      />
                    )
                  )}

                </div>

              )}

            </section>

            {/* NETWORK INFO */}

            <section className="mt-6 grid gap-4 md:grid-cols-3">

              <InfoCard
                title="Arc Testnet"
                description="Payments settle directly on Arc."
              />

              <InfoCard
                title="USDC"
                description="Use USDC for every payment request."
              />

              <InfoCard
                title="Non-custodial"
                description="Your wallet and keys stay under your control."
              />

            </section>

          </div>
        </main>
      </div>

      {/* CREATE PAYMENT MODAL */}

      <CreatePaymentForm
        open={createPaymentOpen}
        onClose={() =>
          setCreatePaymentOpen(false)
        }
      />

      {/* USERNAME MODAL */}

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

function RecentActivityRow({
  activity,
}: {
  activity: ActivityItem;
}) {
  const isSent =
    activity.type === "sent";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EEEEF1] px-6 py-4 last:border-b-0">

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F6]">

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
              ? `To ${shortAddress(activity.to)}`
              : `From ${shortAddress(activity.from)}`}
          </p>

        </div>

      </div>

      <div className="flex shrink-0 items-center gap-3">

        <p
          className={`text-[11px] font-semibold ${
            isSent
              ? "text-[#D65A5A]"
              : "text-[#31A66A]"
          }`}
        >
          {isSent ? "-" : "+"}
          {activity.amount} USDC
        </p>

        <a
          href={`https://testnet.arcscan.app/tx/${activity.hash}`}
          target="_blank"
          rel="noreferrer"
          className="text-[#999AA2] transition hover:text-[#111111]"
          title="View transaction"
        >
          <ExternalLink size={12} />
        </a>

      </div>

    </div>
  );
}

function shortAddress(
  address: string
) {
  return `${address.slice(
    0,
    6
  )}...${address.slice(-4)}`;
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#E7E7EA] bg-white p-5">

      <div className="flex items-center gap-2">

        <span className="h-2 w-2 rounded-full bg-[#31A66A]" />

        <h3 className="text-[12px] font-semibold text-[#33343A]">
          {title}
        </h3>

      </div>

      <p className="mt-2 text-[10px] leading-5 text-[#8C8D95]">
        {description}
      </p>

    </div>
  );
}
