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
  Bell,
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
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { address, isConnected, chainId } = useAccount();

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
    isConnected && chainId !== arcTestnet.id;

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

  const connected = mounted && isConnected;

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
      await navigator.clipboard.writeText(address);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      console.error("Unable to copy wallet address");
    }
  };

  const openWalletModal = () => {
    setAccountMenuOpen(false);
    setWalletModalOpen(true);
  };

  const handleConnect = (connector: Connector) => {
    connect({
      connector,
      chainId: arcTestnet.id,
    });
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 border-b border-[#E8EAF0] bg-white">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />

          <div className="h-10 w-[130px] animate-pulse rounded-xl bg-[#F0F1F5]" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E8EAF0] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Brand */}
          <Brand />

          {/* Desktop wallet area */}
          <div className="flex items-center gap-3">

            {/* Notification */}
            <button
              type="button"
              aria-label="Notifications"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#E8EAF0] bg-white text-[#8A919E] transition hover:bg-[#F7F8FC] hover:text-[#5B5FEF] sm:flex"
            >
              <Bell size={17} strokeWidth={1.8} />
            </button>

            {/* Wrong network */}
            {wrongNetwork ? (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() =>
                  switchChain({
                    chainId: arcTestnet.id,
                  })
                }
                className="flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
              >
                <AlertTriangle
                  size={14}
                  strokeWidth={1.8}
                />

                {isSwitching
                  ? "Switching..."
                  : "Switch to Arc"}
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
                  className={`flex h-10 items-center gap-2.5 rounded-xl border px-2.5 pr-3 transition ${
                    accountMenuOpen
                      ? "border-[#C9CCFA] bg-[#F0F1FF]"
                      : "border-[#E8EAF0] bg-white hover:bg-[#F7F8FC]"
                  }`}
                >
                  <WalletAvatar />

                  <div className="hidden text-left sm:block">
                    <div className="text-[11px] font-semibold text-[#303540]">
                      {balanceLoading
                        ? shortAddr
                        : `${formatUsdc(
                            formatUnits(
                              balance ?? 0n,
                              USDC_DECIMALS
                            )
                          )} USDC`}
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-[#969CA7]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Arc Testnet
                    </div>
                  </div>

                  <ChevronDown
                    size={14}
                    strokeWidth={1.8}
                    className={`ml-1 text-[#9AA0AA] transition-transform ${
                      accountMenuOpen
                        ? "rotate-180 text-[#5B5FEF]"
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
                      setAccountMenuOpen(false);
                    }}
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openWalletModal}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#5B5FEF] px-4 text-[11px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(91,95,239,.7)] transition hover:bg-[#4F53DE] hover:shadow-[0_10px_24px_-10px_rgba(91,95,239,.8)]"
              >
                <Wallet
                  size={15}
                  strokeWidth={1.8}
                />

                Connect wallet
              </button>
            )}
          </div>
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
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5B5FEF] shadow-[0_8px_20px_-10px_rgba(91,95,239,.65)]">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[11px] font-black text-[#5B5FEF]">
          A
        </div>
      </div>

      <div>
        <div className="text-[14px] font-bold tracking-[-0.02em] text-[#171A21]">
          Arc Pay
        </div>

        <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#A0A5AF]">
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
  onSelect: (connector: Connector) => void;
}) {
  const uniqueConnectors = connectors.filter(
    (connector, index, array) =>
      array.findIndex(
        (item) => item.id === connector.id
      ) === index
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111318]/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
    >
      <button
        type="button"
        aria-label="Close wallet selection"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[480px] flex-col overflow-hidden rounded-[24px] border border-[#E5E8EF] bg-white shadow-[0_30px_90px_-25px_rgba(20,30,60,.35)]">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#E8EAF0] bg-white text-[#9AA0AA] transition hover:bg-[#F7F8FC] hover:text-[#5B5FEF]"
        >
          <X size={17} />
        </button>

        {/* Header */}
        <div className="px-7 pb-6 pt-9 text-center">
          <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-[#5B5FEF] shadow-[0_15px_35px_-15px_rgba(91,95,239,.65)]">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[15px] bg-white text-[22px] font-black text-[#5B5FEF]">
              A
            </div>
          </div>

          <h2 className="mt-5 text-[22px] font-bold tracking-[-0.04em] text-[#20242D]">
            Connect with Arc Pay
          </h2>

          <p className="mt-2 text-[12px] text-[#969CA7]">
            Choose a wallet to continue
          </p>
        </div>

        {/* Wallet list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <div className="overflow-hidden rounded-2xl border border-[#E5E8EF]">
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

            {uniqueConnectors.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F1FF]">
                  <Wallet
                    size={22}
                    className="text-[#5B5FEF]"
                  />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#343944]">
                  No wallets detected
                </p>

                <p className="mt-1 text-xs text-[#969CA7]">
                  Install a browser wallet and
                  refresh the page.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[10px] leading-5 text-red-600">
              {error.message.includes(
                "User rejected"
              )
                ? "Connection request was rejected."
                : error.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#EEF0F4] px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-[9px] text-[#969CA7]">
            <ShieldCheck
              size={14}
              className="text-[#5B5FEF]"
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
  const connectorWithMeta =
    connector as Connector & {
      icon?: string;
      ready?: boolean;
    };

  const icon = connectorWithMeta.icon;

  const installed =
    connector.type === "injected" ||
    connectorWithMeta.ready === true;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group flex w-full items-center gap-4 bg-white px-4 py-4 text-left transition hover:bg-[#F7F8FC] disabled:cursor-not-allowed disabled:opacity-50 ${
        showBorder
          ? "border-b border-[#EEF0F4]"
          : ""
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E8EF] bg-[#F8F9FB]">
        {icon ? (
          <img
            src={icon}
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 rounded-lg object-contain"
          />
        ) : (
          <Wallet
            size={20}
            className="text-[#5B5FEF]"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-[#343944]">
          {connector.name}
        </div>

        <div className="mt-1 text-[10px] text-[#969CA7]">
          {disabled
            ? "Confirm in your wallet..."
            : `Connect using ${connector.name}`}
        </div>
      </div>

      {installed && (
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
          Installed
        </span>
      )}

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#B0B5BF] transition group-hover:bg-[#F0F1FF] group-hover:text-[#5B5FEF]">
        <ArrowRight size={17} />
      </div>
    </button>
  );
}

/* ===============================================================
   WALLET AVATAR
   =============================================================== */

function WalletAvatar() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5B5FEF] text-[9px] font-black text-white">
      A
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
    <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[290px] overflow-hidden rounded-2xl border border-[#E5E8EF] bg-white shadow-[0_20px_60px_-20px_rgba(20,30,60,.28)]">
      <div className="border-b border-[#EEF0F4] p-4">
        <div className="flex items-center gap-3">
          <WalletAvatar />

          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#343944]">
              Connected wallet
            </div>

            <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] text-[#969CA7]">
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
              <Check size={15} />
            ) : (
              <Copy size={15} />
            )
          }
          label={copied ? "Copied!" : "Copy address"}
          onClick={onCopy}
        />

        <a
          href={
            fullAddress
              ? explorerAddressUrl(fullAddress)
              : "#"
          }
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-medium text-[#6B7280] transition hover:bg-[#F7F8FC] hover:text-[#5B5FEF]"
        >
          <ExternalLink size={15} />
          View on explorer
        </a>

        <AccountAction
          danger
          icon={<LogOut size={15} />}
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
          ? "text-red-500 hover:bg-red-50"
          : "text-[#6B7280] hover:bg-[#F7F8FC] hover:text-[#5B5FEF]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
