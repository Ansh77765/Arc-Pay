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
} from "lucide-react";

import { useAccount } from "wagmi";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { UsernameModal } from "@/components/UsernameModal";

export default function SettingsPage() {
  const { address } = useAccount();

  const [usernameOpen, setUsernameOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-white text-[#111111]">

      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="px-6 pb-16 pt-8 sm:px-10 lg:px-12">

            {/* HEADER */}

            <div className="mb-9">

              <p className="text-[12px] font-medium text-[#85868E]">
                Preferences
              </p>

              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
                Settings
              </h1>

              <p className="mt-2 text-[13px] text-[#85868E]">
                Manage your Arc Pay wallet and network settings.
              </p>

            </div>

            <div className="max-w-[760px] space-y-6">

              {/* =====================================================
                  ARC USERNAME
                 ===================================================== */}

              <SettingsSection
                icon={
                  <Sparkles
                    size={18}
                    strokeWidth={1.7}
                  />
                }
                title="Arc username"
                description="Your human-readable payment identity."
              >
                <button
                  type="button"
                  onClick={() =>
                    setUsernameOpen(true)
                  }
                  className="flex min-h-[76px] w-full items-center gap-3 px-6 text-left transition hover:bg-[#FAFAFA]"
                >

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F6] text-[14px] font-semibold text-[#55565D]">
                    @
                  </span>

                  <div className="min-w-0 flex-1">

                    <p className="text-[12px] font-medium text-[#33343A]">
                      Reserve username
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-[#92939B]">
                      Let people pay you without sharing your wallet address.
                    </p>

                  </div>

                  <span className="shrink-0 text-[11px] font-medium text-[#777880]">
                    Reserve →
                  </span>

                </button>
              </SettingsSection>

              {/* =====================================================
                  WALLET
                 ===================================================== */}

              <SettingsSection
                icon={
                  <Wallet
                    size={18}
                    strokeWidth={1.7}
                  />
                }
                title="Wallet"
                description="Your connected wallet information."
              >

                <SettingsRow
                  label="Wallet"
                  value={
                    address
                      ? "Connected"
                      : "Not connected"
                  }
                  icon={
                    <Wallet size={16} />
                  }
                  valueClass={
                    address
                      ? "text-[#31A66A]"
                      : "text-[#55565D]"
                  }
                />

                <SettingsRow
                  label="Address"
                  value={
                    address
                      ? `${address.slice(
                          0,
                          6
                        )}...${address.slice(
                          -4
                        )}`
                      : "Connect wallet to view"
                  }
                  icon={
                    <Copy size={16} />
                  }
                />

              </SettingsSection>

              {/* =====================================================
                  NETWORK
                 ===================================================== */}

              <SettingsSection
                icon={
                  <Network
                    size={18}
                    strokeWidth={1.7}
                  />
                }
                title="Network"
                description="Network used for Arc Pay payments."
              >

                <SettingsRow
                  label="Network"
                  value="Arc Testnet"
                  icon={
                    <span className="h-2.5 w-2.5 rounded-full bg-[#31A66A]" />
                  }
                  valueClass="text-[#31A66A]"
                />

                <SettingsRow
                  label="Asset"
                  value="USDC"
                  icon={
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F1F1F2] text-[9px] font-bold">
                      $
                    </span>
                  }
                />

                <SettingsRow
                  label="Explorer"
                  value="Arc Explorer"
                  icon={
                    <ExternalLink
                      size={16}
                    />
                  }
                  chevron
                />

              </SettingsSection>

              {/* =====================================================
                  SECURITY
                 ===================================================== */}

              <SettingsSection
                icon={
                  <ShieldCheck
                    size={18}
                    strokeWidth={1.7}
                  />
                }
                title="Security"
                description="How Arc Pay handles your wallet."
              >

                <SettingsRow
                  label="Wallet custody"
                  value="Non-custodial"
                  icon={
                    <ShieldCheck size={16} />
                  }
                  valueClass="text-[#31A66A]"
                />

                <SettingsRow
                  label="Private keys"
                  value="Never stored by Arc Pay"
                  icon={
                    <ShieldCheck size={16} />
                  }
                />

              </SettingsSection>

              {/* =====================================================
                  ABOUT
                 ===================================================== */}

              <SettingsSection
                icon={
                  <SettingsIcon
                    size={18}
                    strokeWidth={1.7}
                  />
                }
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
                />

              </SettingsSection>

              {/* =====================================================
                  FOOTER NOTE
                 ===================================================== */}

              <div className="rounded-[18px] bg-[#F7F7F8] p-5">

                <p className="text-[11px] font-medium text-[#55565D]">
                  Arc Pay is non-custodial.
                </p>

                <p className="mt-1.5 text-[10px] leading-5 text-[#8C8D95]">
                  Your wallet and private keys remain under
                  your control. Always verify the network
                  before signing transactions.
                </p>

              </div>

            </div>
          </div>

        </main>
      </div>

      {/* ==========================================================
          USERNAME MODAL
         ========================================================== */}

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

/* ================================================================
   SETTINGS SECTION
   ================================================================ */

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#E7E7EA] bg-white">

      <div className="flex items-start gap-3 border-b border-[#EEEEF1] px-6 py-5">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F6] text-[#55565D]">
          {icon}
        </div>

        <div>

          <h2 className="text-[14px] font-semibold">
            {title}
          </h2>

          <p className="mt-1 text-[11px] text-[#92939B]">
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

/* ================================================================
   SETTINGS ROW
   ================================================================ */

function SettingsRow({
  label,
  value,
  icon,
  chevron = false,
  valueClass = "text-[#55565D]",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  chevron?: boolean;
  valueClass?: string;
}) {
  return (
    <button
      type="button"
      className="flex min-h-[62px] w-full items-center gap-3 border-b border-[#F0F0F2] px-6 text-left last:border-b-0 hover:bg-[#FAFAFA]"
    >

      {icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#777880]">
          {icon}
        </span>
      )}

      <div className="min-w-0 flex-1">

        <p className="text-[12px] font-medium text-[#33343A]">
          {label}
        </p>

      </div>

      <span
        className={`truncate text-[11px] ${valueClass}`}
      >
        {value}
      </span>

      {chevron && (
        <ChevronRight
          size={15}
          className="shrink-0 text-[#A0A1A8]"
        />
      )}

    </button>
  );
}
