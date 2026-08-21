
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
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />

          <div className="h-10 w-[132px] animate-pulse rounded-xl bg-slate-100" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
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
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
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
                className="flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 pr-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <WalletAvatar />

                <div className="hidden text-left sm:block">
                  <div className="text-[11px] font-semibold text-slate-700">
                    {balanceLoading
                      ? shortAddr
                      : `${formatUsdc(
                          formatUnits(
                            balance ?? 0n,
                            USDC_DECIMALS
                          )
                        )} USDC`}
                  </div>

                  <div className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    Arc Testnet
                  </div>
                </div>

                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className={`ml-1 text-slate-300 transition ${
                    accountMenuOpen
                      ? "rotate-180"
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
              className="group flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20"
            >
              <Wallet
                size={15}
                strokeWidth={1.8}
              />

              <span>
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

function Brand() {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-600/20">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[11px] font-black text-blue-600">
          A
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="text-[14px] font-bold tracking-[-0.02em] text-slate-900">
          Arc Pay
        </div>

        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Payments
        </div>
      </div>
    </div>
  );
}

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
    >

      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close wallet selection"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[500px] flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <X
            size={19}
            strokeWidth={1.8}
          />
        </button>

        {/* Header */}
        <div className="px-7 pb-6 pt-9 text-center">

          {/* Arc logo */}
          <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-blue-600 shadow-[0_12px_30px_rgba(37,99,235,0.22)]">
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[17px] bg-white text-[25px] font-black text-blue-600">
              A
            </div>
          </div>

          <h2 className="mt-5 text-[25px] font-bold tracking-[-0.035em] text-slate-900">
            Connect with Arc Pay
          </h2>

          <p className="mt-2 text-[13px] text-slate-400">
            Choose a wallet to continue
          </p>
        </div>

        {/* Wallet list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

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

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Wallet
                    size={22}
                    className="text-blue-500"
                  />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  No wallets detected
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Install a browser wallet and
                  refresh the page.
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
              {error.message.includes(
                "User rejected"
              )
                ? "Connection request was rejected."
                : error.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck
              size={14}
              strokeWidth={1.7}
              className="text-blue-500"
            />

            Your keys stay in your wallet
          </div>
        </div>
      </div>
    </div>
  );
}

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
      className={`group flex w-full items-center gap-4 bg-white px-4 py-4 text-left transition hover:bg-blue-50/70 active:bg-blue-100/60 disabled:cursor-not-allowed disabled:opacity-50 ${
        showBorder
          ? "border-b border-slate-200"
          : ""
      }`}
    >

      {/* Wallet icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:border-blue-200">
        {icon ? (
          <img
            src={icon}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Wallet
              size={20}
              strokeWidth={1.7}
              className="text-blue-500"
            />
          </div>
        )}
      </div>

      {/* Wallet information */}
      <div className="min-w-0 flex-1">

        <div className="text-[14px] font-semibold text-slate-800">
          {name}
        </div>

        <div className="mt-1 text-[11px] text-slate-400">
          {disabled
            ? "Confirm in your wallet…"
            : `Connect using ${name}`}
        </div>
      </div>

      {/* Installed */}
      {installed && (
        <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
          Installed
        </span>
      )}

      {/* Arrow */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition group-hover:bg-blue-100 group-hover:text-blue-600">
        <ArrowRight
          size={17}
          strokeWidth={1.7}
        />
      </div>
    </button>
  );
}

function WalletAvatar() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-[9px] font-black text-white">
      A
    </div>
  );
}

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
    <div className="absolute right-0 top-[calc(100%+10px)] w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">

      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">

          <WalletAvatar />

          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-700">
              Connected wallet
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

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
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-medium text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
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
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {icon}

      {label}
    </button>
  );
}

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
      className={`rounded-lg px-3.5 py-2 text-[11px] font-medium transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
