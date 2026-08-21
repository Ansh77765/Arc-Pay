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
  Network,
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
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />

          <div className="h-10 w-[132px] animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />

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

          {wrongNetwork ? (
            <button
              type="button"
              disabled={isSwitching}
              onClick={() =>
                switchChain({
                  chainId: arcTestnet.id,
                })
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-3.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/[0.11] disabled:opacity-60"
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
                className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.035] px-2.5 pr-3 transition hover:bg-white/[0.06]"
              >
                <WalletAvatar />

                <div className="hidden text-left sm:block">
                  <div className="text-[11px] font-medium text-white/75">
                    {balanceLoading
                      ? shortAddr
                      : `${formatUsdc(
                          formatUnits(
                            balance ?? 0n,
                            USDC_DECIMALS
                          )
                        )} USDC`}
                  </div>

                  <div className="mt-0.5 flex items-center gap-1 text-[9px] text-white/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    Arc Testnet
                  </div>
                </div>

                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className={`ml-1 text-white/25 transition ${
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
              className="group flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.045] px-3.5 text-xs font-semibold text-white transition hover:border-white/[0.16] hover:bg-white/[0.07]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.07] text-white/65">
                <Wallet
                  size={15}
                  strokeWidth={1.8}
                />
              </span>

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
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.04]">
        <div className="absolute inset-0 bg-blue-500/[0.08]" />

        <div className="relative flex h-5 w-5 items-center justify-center rounded-md bg-white text-[10px] font-bold text-black">
          A
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="text-[14px] font-semibold tracking-[-0.02em]">
          Arc Pay
        </div>

        <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/25">
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
  /*
   * Keep every discovered wallet.
   *
   * EIP-6963 lets Wagmi discover multiple
   * injected wallets such as MetaMask, Rabby,
   * OKX, Brave, Phantom, etc.
   *
   * We only remove exact duplicate connector IDs.
   */
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
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

      {/* Main modal */}
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#111111] shadow-[0_35px_100px_rgba(0,0,0,0.8)]">

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.13] text-white/75 transition hover:bg-white/[0.07] hover:text-white"
        >
          <X
            size={24}
            strokeWidth={1.8}
          />
        </button>

        {/* Header */}
        <div className="shrink-0 px-8 pb-6 pt-9 text-center">

          {/* Arc Pay logo */}
          <div className="mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-[0_12px_35px_rgba(37,99,235,0.28)]">
            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#111111]">
              <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[25px] font-black text-white">
                A
              </div>
            </div>
          </div>

          <h2 className="mt-6 text-[28px] font-bold tracking-[-0.035em] text-white">
            Connect with Arc Pay
          </h2>

          <p className="mt-2 text-[13px] text-white/40">
            Choose a wallet to continue
          </p>
        </div>

        {/* Wallet list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-5">
          <div className="overflow-hidden rounded-[18px] border border-white/[0.13] bg-[#151515]">

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
                <Wallet
                  size={34}
                  strokeWidth={1.5}
                  className="mx-auto text-white/20"
                />

                <p className="mt-4 text-sm font-medium text-white/60">
                  No wallets detected
                </p>

                <p className="mt-2 text-xs text-white/30">
                  Install a browser wallet and
                  refresh the page.
                </p>
              </div>
            )}
          </div>

          {/* Connection error */}
          {error && (
            <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs leading-5 text-red-300">
              {error.message.includes(
                "User rejected"
              )
                ? "Connection request was rejected."
                : error.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.08] px-7 py-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] text-white/25">
            <ShieldCheck
              size={15}
              strokeWidth={1.7}
            />

            Arc Pay never has access to your
            private keys
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

  /*
   * Wagmi's EIP-6963 discovered connectors
   * expose the wallet icon.
   *
   * Cast keeps this compatible with the
   * installed Wagmi Connector type.
   */
  const connectorWithMeta =
    connector as Connector & {
      icon?: string;
      ready?: boolean;
    };

  const icon =
    connectorWithMeta.icon;

  /*
   * Injected connectors are discovered from
   * wallets installed in this browser.
   */
  const installed =
    connector.type === "injected" ||
    connectorWithMeta.ready === true;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.045] active:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 ${
        showBorder
          ? "border-b border-white/[0.1]"
          : ""
      }`}
    >
      {/* Real wallet icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center">
        {icon ? (
          <img
            src={icon}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-contain"
          />
        ) : (
          <FallbackWalletIcon />
        )}
      </div>

      {/* Wallet name */}
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-semibold tracking-[-0.015em] text-white">
          {name}
        </div>

        <div className="mt-1 text-[12px] text-white/35">
          {disabled
            ? "Confirm in your wallet…"
            : `Connect using ${name}`}
        </div>
      </div>

      {/* Installed */}
      {installed && (
        <span className="shrink-0 rounded-md border border-white/[0.08] bg-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/60">
          Installed
        </span>
      )}

      {/* Arrow */}
      <div className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center text-white/30 transition group-hover:text-white/65">
        <ArrowRight
          size={18}
          strokeWidth={1.6}
        />
      </div>
    </button>
  );
}

function FallbackWalletIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
      <Wallet
        size={21}
        strokeWidth={1.7}
        className="text-white/50"
      />
    </div>
  );
}

function WalletAvatar() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-[9px] font-black text-white">
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
    <div className="absolute right-0 top-[calc(100%+10px)] w-[300px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d1219] shadow-[0_30px_90px_-25px_rgba(0,0,0,.9)]">

      {/* Account header */}
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <WalletAvatar />

          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white/65">
              Connected wallet
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[9px] text-white/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              {address}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
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

        {/* Explorer link */}
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
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-medium text-white/45 transition hover:bg-white/[0.045] hover:text-white/70"
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
          ? "text-red-400/70 hover:bg-red-400/[0.06] hover:text-red-400"
          : "text-white/45 hover:bg-white/[0.045] hover:text-white/70"
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
          ? "bg-white/[0.06] text-white/80"
          : "text-white/30 hover:bg-white/[0.035] hover:text-white/60"
      }`}
    >
      {children}
    </button>
  );
}
