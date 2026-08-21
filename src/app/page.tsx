"use client";

import { TopBar } from "@/components/TopBar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Wallet,
  Activity,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";

function Sidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-[#E7E7EA] bg-white lg:flex lg:min-h-[calc(100vh-68px)] lg:flex-col">
      <div className="px-4 py-5">
        <nav className="space-y-1">
          <SidebarItem
            label="Home"
            icon={<HomeIcon />}
            active
          />

          <SidebarItem
            label="Payments"
            icon={<PaymentsIcon />}
          />

          <SidebarItem
            label="Activity"
            icon={<Activity size={20} strokeWidth={1.7} />}
          />
        </nav>
      </div>

      <div className="mt-auto border-t border-[#EEEEF1] p-4">
        <SidebarItem
          label="Settings"
          icon={<SettingsIcon />}
        />
      </div>
    </aside>
  );
}

function SidebarItem({
  label,
  icon,
  active = false,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-4 rounded-[24px] px-4 py-3 text-[15px] transition ${
        active
          ? "bg-[#F5F5F6] font-semibold text-[#111111]"
          : "font-normal text-[#242424] hover:bg-[#F7F7F8]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9v11h13V9" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6v-2.4h.9a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.73 5.7V5h2.4v.7a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.04v2.4h-.04A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="group flex w-[74px] flex-col items-center gap-2"
    >
      <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#F5F5F6] text-[#111111] transition group-hover:bg-[#EEEEF0]">
        {icon}
      </span>

      <span className="text-[13px] text-[#171717]">
        {label}
      </span>
    </button>
  );
}

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const [hideBalance, setHideBalance] = useState(false);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="px-6 pb-16 pt-8 sm:px-10 lg:px-12">

            {/* PAGE TITLE */}
            <div className="mb-8">
              <h1 className="text-[17px] font-semibold text-[#111111]">
                Home
              </h1>
            </div>

            {/* MAIN GRID */}
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_350px]">

              {/* LEFT */}
              <div className="min-w-0">

                {/* WALLET + BALANCE */}
                <section>
                  <div className="flex items-center gap-2 text-[14px] text-[#50515A]">
                    <span>Smart Wallet</span>

                    <button
                      type="button"
                      className="text-[#8B8C94] hover:text-[#111111]"
                      onClick={() => {
                        if (address) {
                          navigator.clipboard.writeText(address);
                        }
                      }}
                    >
                      <Copy size={15} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <h2 className="text-[46px] font-semibold tracking-[-0.055em] sm:text-[52px]">
                      {hideBalance ? "••••" : "$0.00"}
                    </h2>

                    <ChevronRight
                      size={22}
                      className="text-[#8D8E95]"
                    />
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[12px] text-[#777982]">
                    <span>
                      {isConnected
                        ? shortAddress
                        : "Connect wallet to view balance"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setHideBalance((value) => !value)
                      }
                      className="text-[#96979F]"
                      aria-label="Toggle balance visibility"
                    >
                      {hideBalance ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
                    </button>
                  </div>
                </section>

                {/* QUICK ACTIONS */}
                <section className="mt-9">
                  <div className="flex gap-5">
                    <ActionButton
                      label="Send"
                      icon={
                        <ArrowUpRight
                          size={25}
                          strokeWidth={1.7}
                        />
                      }
                    />

                    <ActionButton
                      label="Receive"
                      icon={
                        <ArrowDownLeft
                          size={25}
                          strokeWidth={1.7}
                        />
                      }
                    />
                  </div>
                </section>

                {/* NETWORK STRIP */}
                <section className="mt-12 rounded-[18px] border border-[#E9E9EC] bg-white px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F6]">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#31A66A]" />
                      </span>

                      <div>
                        <p className="text-[13px] font-medium">
                          Arc Network
                        </p>

                        <p className="mt-0.5 text-[11px] text-[#888991]">
                          Arc Testnet
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-[#31A66A]">
                      Connected
                    </span>
                  </div>
                </section>

                {/* TOKENS */}
                <section className="mt-10">
                  <div className="border-b border-[#E8E8EB]">
                    <div className="flex gap-8">
                      <button
                        type="button"
                        className="relative pb-4 text-[15px] font-semibold text-[#111111]"
                      >
                        Tokens

                        <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#111111]" />
                      </button>

                      <button
                        type="button"
                        className="pb-4 text-[15px] font-medium text-[#999AA2]"
                      >
                        Activity
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[18px] border border-[#E8E8EB] bg-white">
                    <div className="flex items-center justify-between px-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F1F2] text-[13px] font-bold">
                          $
                        </div>

                        <div>
                          <p className="text-[15px] font-medium">
                            USDC
                          </p>

                          <p className="mt-1 text-[11px] text-[#96979F]">
                            USD Coin
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[15px] font-semibold">
                          $0.00
                        </p>

                        <p className="mt-1 text-[11px] text-[#96979F]">
                          0.00 USDC
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* PAYMENT REQUEST */}
                <section className="mt-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-[19px] font-semibold">
                        Payment requests
                      </h2>

                      <p className="mt-1 text-[12px] text-[#898A92]">
                        Create a request to receive USDC.
                      </p>
                    </div>

                    <Plus
                      size={19}
                      className="text-[#777982]"
                    />
                  </div>

                  <div className="rounded-[18px] border border-[#E8E8EB] bg-white p-6">
                    <CreatePaymentForm />
                  </div>
                </section>

              </div>

              {/* RIGHT CARD */}
              <aside className="hidden xl:block">
                <div className="sticky top-[100px] rounded-[20px] border border-[#E7E7EA] bg-white p-6">

                  <div className="flex h-[120px] items-center justify-center rounded-[15px] bg-[#F7F7F8]">
                    <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[18px] bg-white shadow-sm">
                      <Wallet
                        size={32}
                        strokeWidth={1.4}
                        className="text-[#55565D]"
                      />
                    </div>
                  </div>

                  <h2 className="mt-6 text-[22px] font-semibold tracking-[-0.03em]">
                    Your wallet
                  </h2>

                  <p className="mt-2 text-[13px] leading-5 text-[#777982]">
                    Connect your wallet to start sending
                    and receiving USDC on Arc.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F6]">
                        <Wallet
                          size={17}
                          strokeWidth={1.7}
                        />
                      </span>

                      <div>
                        <p className="text-[12px] font-medium">
                          Wallet
                        </p>

                        <p className="mt-0.5 text-[11px] text-[#92939B]">
                          {shortAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F6]">
                        <Activity
                          size={17}
                          strokeWidth={1.7}
                        />
                      </span>

                      <div>
                        <p className="text-[12px] font-medium">
                          Network
                        </p>

                        <p className="mt-0.5 text-[11px] text-[#92939B]">
                          Arc Testnet
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 rounded-[14px] bg-[#F7F7F8] p-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#999AA2]">
                      Security
                    </p>

                    <p className="mt-2 text-[11px] leading-5 text-[#686970]">
                      Non-custodial. Your wallet remains
                      under your control.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
