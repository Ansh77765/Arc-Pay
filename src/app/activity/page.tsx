"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import {
  Activity as ActivityIcon,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";

import {
  getWalletActivity,
  type ActivityItem,
} from "@/lib/activity";

import { EXPLORER_URL } from "@/lib/config";

export default function ActivityPage() {
  const {
    address,
    isConnected,
  } = useAccount();

  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<"all" | "sent" | "received">(
      "all"
    );

  async function loadActivity() {
    if (!address) {
      setActivities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result =
        await getWalletActivity(address);

      setActivities(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load activity."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      if (!address) {
        setActivities([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await getWalletActivity(address);

        if (!cancelled) {
          setActivities(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load activity."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [address]);

  const filteredActivities =
    useMemo(() => {
      if (activeTab === "all") {
        return activities;
      }

      return activities.filter(
        (activity) =>
          activity.type === activeTab
      );
    }, [activities, activeTab]);

  const sentCount =
    activities.filter(
      (item) => item.type === "sent"
    ).length;

  const receivedCount =
    activities.filter(
      (item) => item.type === "received"
    ).length;

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
                    WALLET
                  </p>

                </div>

                <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.055em]">
                  Activity
                </h1>

                <p className="mt-2 text-[13px] text-[#7D838F]">
                  Track your USDC payments on Arc.
                </p>

              </div>

              <button
                type="button"
                onClick={loadActivity}
                disabled={
                  loading ||
                  !isConnected
                }
                className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#E1E4EA] bg-white px-4 text-[10px] font-semibold text-[#555B67] shadow-[0_1px_2px_rgba(17,19,26,0.03)] transition hover:border-[#D5D9E1] hover:bg-[#FAFAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >

                <RefreshCw
                  size={13}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

            {/* ==================================================
                SUMMARY
                ================================================== */}

            <div className="mb-6 grid gap-3 sm:grid-cols-3">

              <SummaryCard
                label="Total activity"
                value={activities.length}
                icon={
                  <ActivityIcon
                    size={16}
                    strokeWidth={1.7}
                  />
                }
                accent="purple"
              />

              <SummaryCard
                label="Sent"
                value={sentCount}
                icon={
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.8}
                  />
                }
                accent="blue"
              />

              <SummaryCard
                label="Received"
                value={receivedCount}
                icon={
                  <ArrowDownLeft
                    size={16}
                    strokeWidth={1.8}
                  />
                }
                accent="green"
              />

            </div>

            {/* ==================================================
                ACTIVITY CARD
                ================================================== */}

            <section className="arc-card overflow-hidden">

              {/* TABS */}

              <div className="flex flex-col border-b border-[#EEF0F4] sm:flex-row sm:items-center sm:justify-between">

                <div className="flex gap-1 px-4 sm:px-5">

                  <ActivityTab
                    label="All"
                    count={activities.length}
                    active={
                      activeTab === "all"
                    }
                    onClick={() =>
                      setActiveTab("all")
                    }
                  />

                  <ActivityTab
                    label="Sent"
                    count={sentCount}
                    active={
                      activeTab === "sent"
                    }
                    onClick={() =>
                      setActiveTab("sent")
                    }
                  />

                  <ActivityTab
                    label="Received"
                    count={receivedCount}
                    active={
                      activeTab === "received"
                    }
                    onClick={() =>
                      setActiveTab("received")
                    }
                  />

                </div>

                <div className="hidden items-center gap-2 px-5 pb-3 sm:flex sm:pb-0">

                  <div className="flex items-center gap-2 rounded-full bg-[#F4F5F8] px-3 py-1.5 text-[9px] font-semibold text-[#777D89]">

                    <Filter size={11} />

                    On-chain

                  </div>

                </div>

              </div>

              {/* TABLE HEADER */}

              {!loading &&
                !error &&
                filteredActivities.length >
                  0 && (
                  <div className="hidden grid-cols-[1fr_150px_150px] border-b border-[#EEF0F4] bg-[#FBFBFD] px-6 py-3 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#A0A6B1] sm:grid">

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
                )}

              {/* LOADING */}

              {loading && (
                <div className="flex min-h-[330px] flex-col items-center justify-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#F1F2FF] text-[#6366F1]">

                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                  </div>

                  <p className="mt-4 text-[11px] font-semibold">
                    Loading activity
                  </p>

                  <p className="mt-1 text-[9px] text-[#9298A4]">
                    Checking the Arc network…
                  </p>

                </div>
              )}

              {/* ERROR */}

              {!loading &&
                error && (
                  <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#FFF1F1] text-[#D05B5B]">

                      <ActivityIcon
                        size={20}
                        strokeWidth={1.5}
                      />

                    </div>

                    <h2 className="mt-5 text-[14px] font-semibold">
                      Couldn’t load activity
                    </h2>

                    <p className="mt-2 max-w-[360px] text-[10px] leading-5 text-[#8C929E]">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={loadActivity}
                      className="mt-5 flex h-9 items-center gap-2 rounded-full bg-[#11131A] px-4 text-[9px] font-semibold text-white transition hover:bg-[#272A32]"
                    >
                      <RefreshCw size={11} />
                      Try again
                    </button>

                  </div>
                )}

              {/* NOT CONNECTED */}

              {!loading &&
                !error &&
                !isConnected && (
                  <EmptyState
                    connected={false}
                    title="Connect your wallet"
                    description="Connect your wallet to see your USDC activity on Arc."
                  />
                )}

              {/* EMPTY */}

              {!loading &&
                !error &&
                isConnected &&
                filteredActivities.length ===
                  0 && (
                  <EmptyState
                    connected
                    title={
                      activeTab === "all"
                        ? "No activity yet"
                        : activeTab === "sent"
                        ? "No sent payments"
                        : "No received payments"
                    }
                    description={
                      activeTab === "all"
                        ? "Your sent and received USDC payments will appear here once there is on-chain activity."
                        : activeTab === "sent"
                        ? "USDC payments you send will appear here."
                        : "USDC payments received by your wallet will appear here."
                    }
                  />
                )}

              {/* ROWS */}

              {!loading &&
                !error &&
                filteredActivities.length >
                  0 && (
                  <div>
                    {filteredActivities.map(
                      (activity, index) => (
                        <ActivityRow
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

            {/* ==================================================
                FOOTER CARDS
                ================================================== */}

            <section className="mt-6 grid gap-3 md:grid-cols-3">

              <ActivityInfo
                icon={
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.8}
                  />
                }
                title="Sent"
                description="Outgoing USDC payments from your wallet."
                accent="blue"
              />

              <ActivityInfo
                icon={
                  <ArrowDownLeft
                    size={16}
                    strokeWidth={1.8}
                  />
                }
                title="Received"
                description="USDC received directly by your wallet."
                accent="green"
              />

              <ActivityInfo
                icon={
                  <ExternalLink
                    size={16}
                    strokeWidth={1.8}
                  />
                }
                title="Verified on-chain"
                description="Every transaction can be checked on ArcScan."
                accent="purple"
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
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 px-2 py-4 text-[10px] transition sm:px-3 ${
        active
          ? "font-semibold text-[#11131A]"
          : "font-medium text-[#949AA6] hover:text-[#555B67]"
      }`}
    >

      {label}

      <span
        className={`rounded-full px-1.5 py-0.5 text-[8px] ${
          active
            ? "bg-[#F0F1FF] text-[#5B61D6]"
            : "bg-[#F5F6F8] text-[#9AA0AB]"
        }`}
      >
        {count}
      </span>

      {active && (
        <span className="absolute bottom-[-1px] left-2 right-2 h-[2px] rounded-full bg-[#6366F1] sm:left-3 sm:right-3" />
      )}

    </button>
  );
}

/* ================================================================
   SUMMARY CARD
   ================================================================ */

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "blue" | "green" | "purple";
}) {
  const classes = {
    blue: "bg-[#EAF2FF] text-[#2563EB]",
    green: "bg-[#EAF8F2] text-[#16A36A]",
    purple: "bg-[#F1EDFF] text-[#6D4AFF]",
  };

  return (
    <div className="arc-card flex items-center justify-between p-4">

      <div>

        <p className="text-[9px] font-medium text-[#9298A4]">
          {label}
        </p>

        <p className="tabular mt-1 text-[21px] font-semibold tracking-[-0.04em]">
          {value}
        </p>

      </div>

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${classes[accent]}`}
      >
        {icon}
      </div>

    </div>
  );
}

/* ================================================================
   EMPTY STATE
   ================================================================ */

function EmptyState({
  title,
  description,
  connected,
}: {
  title: string;
  description: string;
  connected: boolean;
}) {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">

      <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#F1F2F7] text-[#777D89]">

        {connected ? (
          <ActivityIcon
            size={25}
            strokeWidth={1.45}
          />
        ) : (
          <Wallet
            size={25}
            strokeWidth={1.45}
          />
        )}

        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(17,19,26,0.08)]">

          {connected ? (
            <Clock3
              size={10}
              className="text-[#8C929E]"
            />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1]" />
          )}

        </span>

      </div>

      <h2 className="mt-5 text-[15px] font-semibold tracking-[-0.02em]">
        {title}
      </h2>

      <p className="mt-2 max-w-[340px] text-[10px] leading-5 text-[#8C929E]">
        {description}
      </p>

      {connected && (
        <div className="mt-5 flex items-center gap-2 rounded-full bg-[#F4F5F8] px-3.5 py-2 text-[8px] font-semibold text-[#858B97]">

          <Clock3 size={11} />

          Waiting for on-chain activity

        </div>
      )}

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
    <div className="group grid gap-4 border-b border-[#EEF0F4] px-5 py-4.5 transition last:border-b-0 hover:bg-[#FCFCFE] sm:grid-cols-[1fr_150px_150px] sm:items-center sm:px-6">

      {/* TRANSACTION */}

      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${
            isSent
              ? "bg-[#EAF2FF] text-[#2563EB]"
              : "bg-[#EAF8F2] text-[#16A36A]"
          }`}
        >

          {isSent ? (
            <ArrowUpRight
              size={17}
              strokeWidth={1.8}
            />
          ) : (
            <ArrowDownLeft
              size={17}
              strokeWidth={1.8}
            />
          )}

        </div>

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <p className="text-[11px] font-semibold">
              {isSent
                ? "USDC sent"
                : "USDC received"}
            </p>

            <span
              className={`hidden rounded-full px-2 py-0.5 text-[7px] font-semibold sm:inline-flex ${
                isSent
                  ? "bg-[#EEF4FF] text-[#5D78B8]"
                  : "bg-[#ECFAF4] text-[#4E9274]"
              }`}
            >
              {isSent
                ? "Outgoing"
                : "Incoming"}
            </span>

          </div>

          <p className="mt-1.5 truncate font-mono text-[8px] text-[#999FAA]">

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

      {/* STATUS */}

      <div className="flex items-center gap-2">

        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF8F2] text-[#16A36A]">

          <CheckCircle2
            size={12}
            strokeWidth={2}
          />

        </span>

        <div>

          <p className="text-[9px] font-semibold text-[#3F6954]">
            Confirmed
          </p>

          <p className="mt-0.5 text-[7px] text-[#A0A6B0]">
            On-chain
          </p>

        </div>

      </div>

      {/* AMOUNT */}

      <div className="flex items-center justify-between gap-3 sm:justify-end">

        <div className="text-left sm:text-right">

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
            className="mt-1 inline-flex items-center gap-1 text-[8px] font-medium text-[#9AA0AB] transition hover:text-[#5B61D6]"
          >
            View transaction
            <ExternalLink size={9} />
          </a>

        </div>

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
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: "blue" | "green" | "purple";
}) {
  const classes = {
    blue: "bg-[#EAF2FF] text-[#2563EB]",
    green: "bg-[#EAF8F2] text-[#16A36A]",
    purple: "bg-[#F1EDFF] text-[#6D4AFF]",
  };

  return (
    <div className="arc-card p-4 transition hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(17,19,26,0.045)]">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${classes[accent]}`}
      >
        {icon}
      </div>

      <h3 className="mt-3 text-[12px] font-semibold tracking-[-0.01em]">
        {title}
      </h3>

      <p className="mt-1.5 text-[10px] leading-5 text-[#8C929E]">
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
