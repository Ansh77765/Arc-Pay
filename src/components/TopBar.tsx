"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

export function TopBar() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  /*
   * TEMPORARY STATE
   *
   * These are typed explicitly so TypeScript does not infer
   * the empty string as a literal type.
   *
   * We will connect these to your real wallet state next.
   */
  const connected: boolean = false;
  const address: string = "";

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

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

  return (
    <>
      {/* ================================ */}
      {/* Top Navigation                   */}
      {/* ================================ */}

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Brand */}
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

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem active>Overview</NavItem>
            <NavItem>Payments</NavItem>
            <NavItem>Activity</NavItem>
          </nav>

          {/* Wallet */}
          {connected ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((value) => !value)}
                className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.035] px-2.5 pr-3 transition hover:bg-white/[0.06]"
              >
                <WalletAvatar />

                <div className="hidden text-left sm:block">
                  <div className="text-[11px] font-medium text-white/75">
                    {shortAddress}
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
                    accountMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <AccountMenu
                  address={shortAddress}
                  copied={copied}
                  onCopy={copyAddress}
                  onDisconnect={() => {
                    // Connect your existing disconnect function here.
                    setAccountMenuOpen(false);
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
                <Wallet size={15} strokeWidth={1.8} />
              </span>

              <span>Connect wallet</span>
            </button>
          )}
        </div>
      </header>

      {/* ================================ */}
      {/* Wallet Modal                     */}
      {/* ================================ */}

      {walletModalOpen && (
        <WalletModal
          onClose={() => setWalletModalOpen(false)}
          onWalletSelect={(wallet) => {
            /*
             * TEMPORARY:
             *
             * Connect these buttons to your existing wallet
             * connection functions.
             */

            console.log("Selected wallet:", wallet);

            setWalletModalOpen(false);
          }}
        />
      )}
    </>
  );
}

/* ===================================== */
/* Wallet Modal                          */
/* ===================================== */

function WalletModal({
  onClose,
  onWalletSelect,
}: {
  onClose: () => void;
  onWalletSelect: (wallet: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close wallet modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#0b1017] shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)]">
        {/* Header */}
        <div className="border-b border-white/[0.06] px-6 pb-5 pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                  <Wallet
                    size={16}
                    className="text-blue-400"
                    strokeWidth={1.8}
                  />
                </div>

                <h2 className="text-[17px] font-semibold tracking-[-0.025em]">
                  Connect wallet
                </h2>
              </div>

              <p className="mt-3 max-w-[320px] text-[11px] leading-5 text-white/30">
                Connect your wallet to send, receive, and manage USDC
                payments on Arc.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[0.05] hover:text-white/60"
            >
              <X size={17} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        {/* Wallet list */}
        <div className="p-3">
          <WalletOption
            name="MetaMask"
            description="Connect using MetaMask"
            logo={<MetaMaskLogo />}
            onClick={() => onWalletSelect("metamask")}
          />

          <WalletOption
            name="Coinbase Wallet"
            description="Connect using Coinbase Wallet"
            logo={<CoinbaseLogo />}
            onClick={() => onWalletSelect("coinbase")}
          />

          <WalletOption
            name="WalletConnect"
            description="Connect with any compatible wallet"
            logo={<WalletConnectLogo />}
            onClick={() => onWalletSelect("walletconnect")}
          />

          <WalletOption
            name="Rabby Wallet"
            description="Connect using Rabby"
            logo={<RabbyLogo />}
            onClick={() => onWalletSelect("rabby")}
          />
        </div>

        {/* Network */}
        <div className="mx-5 mb-4 rounded-xl border border-blue-400/[0.08] bg-blue-400/[0.025] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/[0.09] text-blue-400">
              <Network size={15} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <div className="text-[10px] font-semibold text-white/55">
                Arc Testnet
              </div>

              <div className="mt-0.5 text-[9px] text-white/25">
                Your wallet will connect to Arc
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-400/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Available
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-[9px] text-white/20">
            <ShieldCheck size={13} strokeWidth={1.7} />
            Arc Pay never has access to your private keys
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================== */
/* Wallet Option                         */
/* ===================================== */

function WalletOption({
  name,
  description,
  logo,
  onClick,
}: {
  name: string;
  description: string;
  logo: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition hover:bg-white/[0.045] active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] shadow-inner">
        {logo}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-white/75 transition group-hover:text-white">
          {name}
        </div>

        <div className="mt-1 text-[10px] text-white/25">
          {description}
        </div>
      </div>

      <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white/15 transition group-hover:bg-white/[0.05] group-hover:text-white/50">
        <ArrowRight size={14} strokeWidth={1.7} />
      </div>
    </button>
  );
}

/* ===================================== */
/* Wallet Logos                          */
/* ===================================== */

function MetaMaskLogo() {
  return (
    <div className="relative flex h-7 w-7 items-center justify-center">
      <div className="absolute inset-[3px] rotate-45 rounded-[5px] bg-gradient-to-br from-orange-400 via-orange-500 to-red-500" />

      <div className="relative text-[9px] font-black text-white">
        M
      </div>
    </div>
  );
}

function CoinbaseLogo() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1652f0]">
      <div className="h-3 w-3 rounded-full bg-white" />
    </div>
  );
}

function WalletConnectLogo() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b99fc] text-[12px] font-bold text-white">
      W
    </div>
  );
}

function RabbyLogo() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#708cff]">
      <span className="text-[12px] font-black text-white">R</span>
    </div>
  );
}

/* ===================================== */
/* Connected Wallet Avatar               */
/* ===================================== */

function WalletAvatar() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-[9px] font-black text-white">
      M
    </div>
  );
}

/* ===================================== */
/* Account Menu                          */
/* ===================================== */

function AccountMenu({
  address,
  copied,
  onCopy,
  onDisconnect,
}: {
  address: string;
  copied: boolean;
  onCopy: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] w-[300px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d1219] shadow-[0_30px_90px_-25px_rgba(0,0,0,.9)]">
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

      <div className="p-2">
        <AccountAction
          icon={<Copy size={15} strokeWidth={1.7} />}
          label={copied ? "Copied!" : "Copy address"}
          onClick={onCopy}
        />

        <AccountAction
          icon={<ExternalLink size={15} strokeWidth={1.7} />}
          label="View on explorer"
        />

        <AccountAction
          danger
          icon={<LogOut size={15} strokeWidth={1.7} />}
          label="Disconnect"
          onClick={onDisconnect}
        />
      </div>
    </div>
  );
}

/* ===================================== */
/* Account Action                        */
/* ===================================== */

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

/* ===================================== */
/* Navigation                            */
/* ===================================== */

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