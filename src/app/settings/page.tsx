"use client";

import { useState } from "react";

import {
  Settings as SettingsIcon,
  Wallet,
  Network,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Copy,
  Sparkles,
  Check,
} from "lucide-react";

import { useAccount } from "wagmi";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { UsernameModal } from "@/components/UsernameModal";

import {
  EXPLORER_URL,
  explorerAddressUrl,
} from "@/lib/config";

export default function SettingsPage() {
  const { address, isConnected } =
    useAccount();

  const [usernameOpen, setUsernameOpen] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  async function copyAddress() {
    if (!address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        address
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Ignore clipboard errors.
    }
  }

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

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

            <div className="mb-8">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#6366F1]" />

                <p className="text-[11px] font-semibold tracking-wide text-[#747986]">
                  PREFERENCES
                </p>

              </div>

              <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.055em]">
                Settings
              </h1>

              <p className="mt-2 text-[13px] text-[#7D838F]">
                Manage your Arc Pay wallet, identity, and network.
              </p>

            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,760px)_300px]">

              {/* ==================================================
                  SETTINGS
                  ================================================== */}

              <div className="space-y-5">

                {/* USERNAME */}

                <SettingsSection
                  icon={
                    <Sparkles
                      size={17}
                      strokeWidth={1.7}
                    />
                  }
                  iconClass="bg-[#F1EDFF] text-[#6D4AFF]"
                  title="Arc username"
                  description="Your human-readable payment identity."
                >

                  <button
                    type="button"
                    onClick={() =>
                      setUsernameOpen(true)
                    }
                    className="group flex min-h-[78px] w-full items-center gap-3 px-5 text-left transition hover:bg-[#FCFCFE] sm:px-6"
                  >

                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F7F3FF] text-[15px] font-semibold text-[#6D4AFF]">
                      @
                    </span>

                    <div className="min-w-0 flex-1">

                      <p className="text-[11px] font-semibold text-[#333740]">
                        Reserve username
                      </p>

                      <p className="mt-1 text-[9px] leading-5 text-[#9298A4]">
                        Let people pay you without sharing your wallet address.
                      </p>

                    </div>

                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#F1EDFF] px-3 py-1.5 text-[8px] font-semibold text-[#6D4AFF] transition group-hover:bg-[#EAE4FF]">
                      Manage
                      <ChevronRight size={10} />
                    </span>

                  </button>

                </SettingsSection>

                {/* WALLET */}

                <SettingsSection
                  icon={
                    <Wallet
                      size={17}
                      strokeWidth={1.7}
                    />
                  }
                  iconClass="bg-[#EAF2FF] text-[#2563EB]"
                  title="Wallet"
                  description="Your connected wallet information."
                >

                  <SettingsRow
                    label="Wallet status"
                    value={
                      isConnected
                        ? "Connected"
                        : "Not connected"
                    }
                    icon={
                      <Wallet size={14} />
                    }
                    valueClass={
                      isConnected
                        ? "text-[#16A36A]"
                        : "text-[#777D89]"
                    }
                    status={
                      isConnected
                        ? "success"
                        : undefined
                    }
                  />

                  <div className="flex min-h-[64px] items-center gap-3 border-b border-[#EEF0F4] px-5 sm:px-6">

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F5F8] text-[#777D89]">
                      <Copy size={14} />
                    </span>

                    <div className="min-w-0 flex-1">

                      <p className="text-[10px] font-semibold text-[#444952]">
                        Wallet address
                      </p>

                      <p className="mt-1 truncate font-mono text-[9px] text-[#9298A4]">
                        {shortAddress}
                      </p>

                    </div>

                    {address && (
                      <button
                        type="button"
                        onClick={
                          copyAddress
                        }
                        className="flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] border border-[#E2E5EA] bg-white px-2.5 text-[8px] font-semibold text-[#666C78] transition hover:bg-[#F5F6F8]"
                      >

                        {copied ? (
                          <Check
                            size={11}
                            className="text-[#16A36A]"
                          />
                        ) : (
                          <Copy size={11} />
                        )}

                        {copied
                          ? "Copied"
                          : "Copy"}

                      </button>
                    )}

                  </div>

                </SettingsSection>

                {/* NETWORK */}

                <SettingsSection
                  icon={
                    <Network
                      size={17}
                      strokeWidth={1.7}
                    />
                  }
                  iconClass="bg-[#EAF8F2] text-[#16A36A]"
                  title="Network"
                  description="Network used for Arc Pay payments."
                >

                  <SettingsRow
                    label="Network"
                    value="Arc Testnet"
                    icon={
                      <span className="h-2.5 w-2.5 rounded-full bg-[#16A36A] shadow-[0_0_0_4px_rgba(22,163,106,0.08)]" />
                    }
                    valueClass="text-[#16A36A]"
                    status="success"
                  />

                  <SettingsRow
                    label="Payment asset"
                    value="USDC"
                    icon={
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EEF2FF] text-[9px] font-bold text-[#2563EB]">
                        $
                      </span>
                    }
                  />

                  <a
                    href={`${EXPLORER_URL}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[64px] items-center gap-3 px-5 transition hover:bg-[#FCFCFE] sm:px-6"
                  >

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F5F8] text-[#777D89]">
                      <ExternalLink size={14} />
                    </span>

                    <div className="flex-1">

                      <p className="text-[10px] font-semibold text-[#444952]">
                        Explorer
                      </p>

                      <p className="mt-1 text-[9px] text-[#9298A4]">
                        View Arc Testnet activity
                      </p>

                    </div>

                    <ChevronRight
                      size={14}
                      className="text-[#A0A6B1]"
                    />

                  </a>

                </SettingsSection>

                {/* SECURITY */}

                <SettingsSection
                  icon={
                    <ShieldCheck
                      size={17}
                      strokeWidth={1.7}
                    />
                  }
                  iconClass="bg-[#EAF8F2] text-[#16A36A]"
                  title="Security"
                  description="How Arc Pay handles your wallet."
                >

                  <SettingsRow
                    label="Wallet custody"
                    value="Non-custodial"
                    icon={
                      <ShieldCheck size={14} />
                    }
                    valueClass="text-[#16A36A]"
                    status="success"
                  />

                  <SettingsRow
                    label="Private keys"
                    value="Never stored by Arc Pay"
                    icon={
                      <ShieldCheck size={14} />
                    }
                  />

                </SettingsSection>

                {/* ABOUT */}

                <SettingsSection
                  icon={
                    <SettingsIcon
                      size={17}
                      strokeWidth={1.7}
                    />
                  }
                  iconClass="bg-[#F1F2F6] text-[#666C78]"
                  title="About"
                  description="Information about this application."
                >

                  <SettingsRow
                    label="Application"
                    value="Arc Pay"
                  />

                  <SettingsRow
                    label="Environment"
                    value="Testnet"
                    valueClass="text-[#6366F1]"
                  />

                </SettingsSection>

                {/* FOOTER NOTE */}

                <div className="relative overflow-hidden rounded-[20px] bg-[#0C1220] p-5 shadow-[0_12px_35px_-20px_rgba(17,19,26,0.25)]">

                  <div className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-[#6366F1]/15 blur-[40px]" />

                  <div className="relative flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white/10 text-white ring-1 ring-white/10">

                      <ShieldCheck
                        size={16}
                        strokeWidth={1.6}
                      />

                    </div>

                    <div>

                      <p className="text-[10px] font-semibold text-white">
                        Non-custodial by design
                      </p>

                      <p className="mt-1 text-[9px] leading-5 text-white/50">
                        Your wallet and private keys remain under your control. Always verify the network before signing transactions.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  SIDE SUMMARY
                  ================================================== */}

              <aside className="hidden xl:block">

                <div className="arc-card overflow-hidden">

                  <div className="relative h-[125px] overflow-hidden bg-[#0C1220]">

                    <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#6366F1]/20 blur-[55px]" />

                    <div className="pointer-events-none absolute -bottom-20 left-0 h-40 w-40 rounded-full bg-[#2563EB]/15 blur-[55px]" />

                    <div className="relative flex h-full items-center justify-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-[17px] bg-white/10 text-white ring-1 ring-white/15">

                        <SettingsIcon
                          size={24}
                          strokeWidth={1.4}
                        />

                      </div>

                    </div>

                  </div>

                  <div className="p-5">

                    <div className="flex items-center gap-2">

                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" />

                      <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#8D939F]">
                        Arc Testnet
                      </span>

                    </div>

                    <h2 className="mt-3 text-[17px] font-semibold tracking-[-0.03em]">
                      Wallet settings
                    </h2>

                    <p className="mt-2 text-[9px] leading-5 text-[#858B97]">
                      Your wallet controls your identity and signs every payment.
                    </p>

                    <div className="mt-5 space-y-3 border-t border-[#EEF0F4] pt-4">

                      <MiniDetail
                        label="Network"
                        value="Arc Testnet"
                      />

                      <MiniDetail
                        label="Asset"
                        value="USDC"
                      />

                      <MiniDetail
                        label="Custody"
                        value="Non-custodial"
                      />

                    </div>

                  </div>

                </div>

              </aside>

            </div>

          </div>

        </main>

      </div>

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
   SETTINGS SECTION
   ============================================================ */

function SettingsSection({
  icon,
  iconClass,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="arc-card overflow-hidden">

      <div className="flex items-start gap-3 border-b border-[#EEF0F4] px-5 py-5 sm:px-6">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${iconClass}`}
        >
          {icon}
        </div>

        <div>

          <h2 className="text-[13px] font-semibold tracking-[-0.015em]">
            {title}
          </h2>

          <p className="mt-1 text-[9px] text-[#9298A4]">
            {description}
          </p>

        </div>

      </div>

      <div>
        {children}
      </div>

    </section>
  );
}

/* ============================================================
   SETTINGS ROW
   ============================================================ */

function SettingsRow({
  label,
  value,
  icon,
  valueClass = "text-[#555B67]",
  status,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
  status?: "success";
}) {
  return (
    <div className="flex min-h-[64px] items-center gap-3 border-b border-[#EEF0F4] px-5 last:border-b-0 sm:px-6">

      {icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F5F8] text-[#777D89]">
          {icon}
        </span>
      )}

      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-semibold text-[#444952]">
          {label}
        </p>

      </div>

      <div className="flex shrink-0 items-center gap-2">

        {status === "success" && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" />
        )}

        <span
          className={`max-w-[190px] truncate text-right text-[9px] font-medium ${valueClass}`}
        >
          {value}
        </span>

      </div>

    </div>
  );
}

/* ============================================================
   SIDE DETAIL
   ============================================================ */

function MiniDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <span className="text-[8px] text-[#999FAA]">
        {label}
      </span>

      <span className="text-[8px] font-semibold text-[#555B67]">
        {value}
      </span>

    </div>
  );
}
