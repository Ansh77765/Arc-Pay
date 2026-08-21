"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import type { Connector } from "wagmi";
import { formatUnits } from "viem";
import {
  X,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  ShieldCheck,
  Wallet,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

import { arcTestnet } from "@/lib/chain";
import { erc20Abi } from "@/lib/erc20";

import {
  USDC_ADDRESS,
  USDC_DECIMALS,
  explorerAddressUrl,
} from "@/lib/config";

import {
  shortAddress,
  formatUsdc,
} from "@/lib/format";

export function TopBar() {
  const [mounted, setMounted] = useState(false);

  const [walletModalOpen, setWalletModalOpen] =
    useState(false);

  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    address,
    isConnected,
    chainId,
  } = useAccount();

  const {
    connectors,
    connect,
    isPending,
    error: connectError,
  } = useConnect();

  const { disconnect } = useDisconnect();

  const {
    switchChain,
    isPending: isSwitching,
  } = useSwitchChain();

  const wrongNetwork =
    isConnected &&
    chainId !== arcTestnet.id;

  const {
    data: balance,
    isLoading: balanceLoading,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled:
        Boolean(address) && !wrongNetwork,
      refetchInterval: 15_000,
    },
  });

  const connected =
    mounted && isConnected;

  const shortAddr = address
    ? shortAddress(address)
    : "";

  useEffect(() => {
    if (connected) {
      setWalletModalOpen(false);
    }
  }, [connected]);

  useEffect(() => {
    if (!walletModalOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [walletModalOpen]);

  const copyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(
        address
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      console.error(
        "Unable to copy wallet address"
      );
    }
  };

  const openWalletModal = () => {
    setAccountMenuOpen(false);
    setWalletModalOpen(true);
  };

  const handleConnect = (
    connector: Connector
  ) => {
    connect({
      connector,
      chainId: arcTestnet.id,
    });
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050811]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">

          <Brand />

          <div className="h-10 w-[132px] animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050811]/75 backdrop-blur-2xl">

        {/* subtle top aurora */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Brand */}
          <Brand />

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">

            <NavItem active>
              Overview
            </NavItem>

            <NavItem>
              Payments
            </NavItem>

            <NavItem>
              Activity
            </NavItem>
          </nav>

          {/* Wallet */}
          {wrongNetwork ? (
            <button
              type="button"
              disabled={isSwitching}
              onClick={() =>
                switchChain({
                  chainId: arcTestnet.id,
                })
              }
              className="group inline-flex h-10 items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3.5 text-xs font-semibold text-amber-300/80 shadow-[0_8px_25px_-15px_rgba(251,191,36,.5)] transition-all hover:border-amber-400/25 hover:bg-amber-400/[0.09] disabled:opacity-60"
            >
              <AlertTriangle
                size={14}
                strokeWidth={1.8}
              />

              {isSwitching
                ? "Switching…"
                : "Switch to Arc Testnet"}
            </button>
          ) : connected ? (
            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setAccountMenuOpen(
                    (value) => !value
                  )
                }
                className={`group flex h-10 items-center gap-2.5 rounded-xl border px-2.5 pr-3 transition-all duration-200 ${
                  accountMenuOpen
                    ? "border-blue-400/20 bg-blue-500/[0.07] shadow-[0_10px_30px_-20px_rgba(37,99,235,.7)]"
                    : "border-white/[0.07] bg-white/[0.035] hover:border-blue-400/15 hover:bg-blue-500/[0.045]"
                }`}
              >

                <WalletAvatar />

                <div className="hidden text-left sm:block">

                  <div className="text-[11px] font-semibold text-white/70">

                    {balanceLoading
                      ? shortAddr
                      : `${formatUsdc(
                          formatUnits(
                            balance ?? 0n,
                            USDC_DECIMALS
                          )
                        )} USDC`}
                  </div>

                  <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/25">

                    <span className="relative flex h-1.5 w-1.5">

                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/25" />

                      <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,.45)]" />
                    </span>

                    Arc Testnet
                  </div>
                </div>

                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className={`ml-1 text-white/25 transition-transform duration-200 ${
                    accountMenuOpen
                      ? "rotate-180 text-blue-300/70"
                      : ""
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <AccountMenu
                  fullAddress={address ?? ""}
                  address={shortAddr}
                  copied={copied}
                  onCopy={copyAddress}
                  onDisconnect={() => {
                    disconnect();

                    setAccountMenuOpen(
                      false
                    );
                  }}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openWalletModal}
              className="group relative flex h-10 items-center gap-2 overflow-hidden rounded-xl border border-blue-300/[0.12] bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-xs font-semibold text-white shadow-[0_10px_25px_-13px_rgba(37,99,235,.8)] transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_14px_30px_-12px_rgba(37,99,235,.85)] active:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-y-0 left-[-100%] w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.18] to-transparent transition-transform duration-700 group-hover:translate-x-[300%]" />

              <Wallet
                size={15}
                strokeWidth={1.8}
                className="relative"
              />

              <span className="relative">
                Connect wallet
              </span>
            </button>
          )}
        </div>
      </header>

      {walletModalOpen && (
        <WalletModal
          connectors={connectors}
          isPending={isPending}
          error={connectError}
          onClose={() =>
            setWalletModalOpen(false)
          }
          onSelect={handleConnect}
        />
      )}
    </>
  );
}

/* ===============================================================
   BRAND
   =============================================================== */

function Brand() {
  return (
    <div className="group flex items-center gap-3">

      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/10 bg-gradient-to-br from-blue-600 to-blue-500 shadow-[0_8px_25px_-10px_rgba(37,99,235,.8)]">

        <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md transition-opacity duration-300 group-hover:opacity-80" />

        <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[11px] font-black text-blue-600">
          A
        </div>
      </div>

      <div className="hidden sm:block">

        <div className="text-[14px] font-bold tracking-[-0.02em] text-white/85">
          Arc Pay
        </div>

        <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/25">
          Payments
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   WALLET MODAL
   =============================================================== */

function WalletModal({
  connectors,
  isPending,
  error,
  onClose,
  onSelect,
}: {
  connectors: readonly Connector[];
  isPending: boolean;
  error: Error | null;
  onClose: () => void;
  onSelect: (
    connector: Connector
  ) => void;
}) {
  const uniqueConnectors =
    connectors.filter(
      (connector, index, array) =>
        array.findIndex(
          (item) =>
            item.id === connector.id
        ) === index
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02050b]/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
    >

      {/* Ambient modal glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.08] blur-[130px]" />

      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close wallet selection"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[500px] flex-col overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#090f18]/95 shadow-[0_35px_100px_-30px_rgba(0,0,0,.95)] backdrop-blur-2xl">

        {/* Aurora edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-cyan-400/20" />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/30 transition hover:border-blue-400/15 hover:bg-blue-500/[0.06] hover:text-blue-300"
        >
          <X
            size={18}
            strokeWidth={1.8}
          />
        </button>

        {/* Header */}
        <div className="px-7 pb-6 pt-9 text-center">

          <div className="relative mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[23px] border border-blue-400/10 bg-gradient-to-br from-blue-600 to-blue-500 shadow-[0_15px_40px_-15px_rgba(37,99,235,.8)]">

            <div className="absolute inset-0 rounded-[23px] bg-blue-500/20 blur-xl" />

            <div className="relative flex h-[58px] w-[58px] items-center justify-center rounded-[17px] bg-white text-[25px] font-black text-blue-600">
              A
            </div>
          </div>

          <h2 className="mt-5 text-[24px] font-bold tracking-[-0.04em] text-white/90">
            Connect with Arc Pay
          </h2>

          <p className="mt-2 text-[12px] text-white/30">
            Choose a wallet to continue
          </p>
        </div>

        {/* Wallet list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018]">

            {uniqueConnectors.map(
              (connector, index) => (
                <WalletOption
                  key={`${connector.id}-${index}`}
                  connector={connector}
                  disabled={isPending}
                  showBorder={
                    index <
                    uniqueConnectors.length - 1
                  }
                  onClick={() =>
                    onSelect(connector)
                  }
                />
              )
            )}

            {uniqueConnectors.length ===
              0 && (
              <div className="px-6 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.06]">
                  <Wallet
                    size={22}
                    className="text-blue-300/70"
                  />
                </div>

                <p className="mt-4 text-sm font-semibold text-white/60">
                  No wallets detected
                </p>

                <p className="mt-1 text-xs text-white/25">
                  Install a browser wallet and
                  refresh the page.
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-xl border border-red-400/10 bg-red-500/[0.05] px-4 py-3 text-[10px] leading-5 text-red-300/70">
              {error.message.includes(
                "User rejected"
              )
                ? "Connection request was rejected."
                : error.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.055] px-6 py-4">

          <div className="flex items-center justify-center gap-2 text-[9px] text-white/20">

            <ShieldCheck
              size={14}
              strokeWidth={1.7}
              className="text-blue-400/60"
            />

            Your keys stay in your wallet
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   WALLET OPTION
   =============================================================== */

function WalletOption({
  connector,
  disabled,
  showBorder,
  onClick,
}: {
  connector: Connector;
  disabled?: boolean;
  showBorder: boolean;
  onClick: () => void;
}) {
  const name = connector.name;

  const connectorWithMeta =
    connector as Connector & {
      icon?: string;
      ready?: boolean;
    };

  const icon =
    connectorWithMeta.icon;

  const installed =
    connector.type === "injected" ||
    connectorWithMeta.ready === true;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group flex w-full items-center gap-4 bg-[#0a1019]/70 px-4 py-4 text-left transition-all duration-200 hover:bg-blue-500/[0.045] active:bg-blue-500/[0.07] disabled:cursor-not-allowed disabled:opacity-50 ${
        showBorder
          ? "border-b border-white/[0.055]"
          : ""
      }`}
    >

      {/* Wallet icon */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] shadow-sm transition-all duration-200 group-hover:border-blue-400/15 group-hover:bg-blue-500/[0.045]">

        {icon ? (
          <img
            src={icon}
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/[0.07]">
            <Wallet
              size={20}
              strokeWidth={1.7}
              className="text-blue-300/70"
            />
          </div>
        )}
      </div>

      {/* Wallet information */}
      <div className="min-w-0 flex-1">

        <div className="text-[13px] font-semibold text-white/70 transition-colors group-hover:text-white/85">
          {name}
        </div>

        <div className="mt-1 text-[10px] text-white/25">
          {disabled
            ? "Confirm in your wallet…"
            : `Connect using ${name}`}
        </div>
      </div>

      {/* Installed */}
      {installed && (
        <span className="shrink-0 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1 text-[9px] font-semibold text-emerald-300/60">
          Installed
        </span>
      )}

      {/* Arrow */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/15 transition-all duration-200 group-hover:bg-blue-500/[0.08] group-hover:text-blue-300/70">
        <ArrowRight
          size={17}
          strokeWidth={1.7}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}

/* ===============================================================
   WALLET AVATAR
   =============================================================== */

function WalletAvatar() {
  return (
    <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-blue-300/10 bg-gradient-to-br from-blue-600 to-blue-500 text-[9px] font-black text-white shadow-[0_5px_15px_-8px_rgba(37,99,235,.8)]">

      <span className="absolute inset-0 rounded-lg bg-blue-500/20 blur-sm" />

      <span className="relative">
        A
      </span>
    </div>
  );
}

/* ===============================================================
   ACCOUNT MENU
   =============================================================== */

function AccountMenu({
  fullAddress,
  address,
  copied,
  onCopy,
  onDisconnect,
}: {
  fullAddress: string;
  address: string;
  copied: boolean;
  onCopy: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] w-[300px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090f18]/95 shadow-[0_25px_70px_-25px_rgba(0,0,0,.95)] backdrop-blur-2xl">

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

      <div className="border-b border-white/[0.055] p-4">

        <div className="flex items-center gap-3">

          <WalletAvatar />

          <div className="min-w-0">

            <div className="text-[11px] font-semibold text-white/70">
              Connected wallet
            </div>

            <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] text-white/25">

              <span className="relative flex h-1.5 w-1.5">

                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />

                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              {address}
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">

        <AccountAction
          icon={
            copied ? (
              <Check
                size={15}
                strokeWidth={1.7}
              />
            ) : (
              <Copy
                size={15}
                strokeWidth={1.7}
              />
            )
          }
          label={
            copied
              ? "Copied!"
              : "Copy address"
          }
          onClick={onCopy}
        />

        <a
          href={
            fullAddress
              ? explorerAddressUrl(
                  fullAddress
                )
              : "#"
          }
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-medium text-white/35 transition hover:bg-blue-500/[0.06] hover:text-blue-300/80"
        >
          <ExternalLink
            size={15}
            strokeWidth={1.7}
          />

          View on explorer
        </a>

        <AccountAction
          danger
          icon={
            <LogOut
              size={15}
              strokeWidth={1.7}
            />
          }
          label="Disconnect"
          onClick={onDisconnect}
        />
      </div>
    </div>
  );
}

/* ===============================================================
   ACCOUNT ACTION
   =============================================================== */

function AccountAction({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-medium transition ${
        danger
          ? "text-red-300/60 hover:bg-red-500/[0.05] hover:text-red-300"
          : "text-white/35 hover:bg-blue-500/[0.06] hover:text-blue-300/80"
      }`}
    >
      {icon}

      {label}
    </button>
  );
}

/* ===============================================================
   NAV ITEM
   =============================================================== */

function NavItem({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`rounded-lg px-3.5 py-2 text-[11px] font-medium transition-all duration-200 ${
        active
          ? "border border-blue-400/[0.08] bg-blue-500/[0.07] text-blue-300/80"
          : "text-white/25 hover:bg-white/[0.025] hover:text-white/55"
      }`}
    >
      {children}
    </button>
  );
}
