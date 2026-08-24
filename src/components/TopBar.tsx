"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  Wallet,
  X,
  ShieldCheck,
} from "lucide-react";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

import { arcTestnet } from "@/lib/chain";
import { explorerAddressUrl } from "@/lib/config";

type WalletInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

export function TopBar() {
  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [walletModalOpen, setWalletModalOpen] =
    useState(false);

  const [wallets, setWallets] =
    useState<WalletInfo[]>([]);

  const {
    address,
    isConnected,
    chainId,
  } = useAccount();

  const {
    connectors,
    connect,
    isPending,
    error,
  } = useConnect();

  const { disconnect } =
    useDisconnect();

  const {
    switchChain,
    isPending: isSwitching,
  } = useSwitchChain();

  const connected =
    isConnected && !!address;

  const onArcTestnet =
    connected &&
    chainId === arcTestnet.id;

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  /* =========================================================
     WALLET DISCOVERY
     ========================================================= */

  useEffect(() => {
    const discovered = new Map<
      string,
      WalletInfo
    >();

    const handleAnnouncement = (
      event: Event
    ) => {
      const detail = (
        event as CustomEvent<{
          info: WalletInfo;
        }>
      ).detail;

      if (!detail?.info?.uuid) {
        return;
      }

      discovered.set(
        detail.info.uuid,
        detail.info
      );

      setWallets(
        Array.from(
          discovered.values()
        )
      );
    };

    window.addEventListener(
      "eip6963:announceProvider",
      handleAnnouncement
    );

    window.dispatchEvent(
      new Event(
        "eip6963:requestProvider"
      )
    );

    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handleAnnouncement
      );
    };
  }, []);

  /* =========================================================
     CLOSE WALLET MODAL AFTER CONNECT
     ========================================================= */

  useEffect(() => {
    if (connected) {
      setWalletModalOpen(false);
    }
  }, [connected]);

  /* =========================================================
     ESC
     ========================================================= */

  useEffect(() => {
    if (!walletModalOpen) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setWalletModalOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [walletModalOpen]);

  /* =========================================================
     COPY
     ========================================================= */

  const copyAddress = async () => {
    if (!address) {
      return;
    }

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
        "Unable to copy address"
      );
    }
  };

  /* =========================================================
     CONNECT
     ========================================================= */

  const handleConnect = () => {
    const injectedConnector =
      connectors.find(
        (connector) =>
          connector.id === "injected"
      );

    if (!injectedConnector) {
      return;
    }

    connect({
      connector:
        injectedConnector,
    });
  };

  /* =========================================================
     DISCONNECT
     ========================================================= */

  const handleDisconnect = () => {
    disconnect();
    setAccountMenuOpen(false);
  };

  return (
    <>
      {/* =====================================================
          TOP BAR
          ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#E9EBF0]/80 bg-white/85 backdrop-blur-xl">

        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* =================================================
              BRAND
              ================================================= */}

          <div className="flex items-center gap-3">

            <div className="relative flex h-[36px] w-[36px] items-center justify-center rounded-[11px] bg-[#0C1220] shadow-[0_5px_16px_rgba(17,19,26,0.10)]">

              <div className="absolute inset-[1px] rounded-[10px] bg-gradient-to-br from-[#111827] to-[#172554]" />

              <span className="relative text-[14px] font-bold text-white">
                A
              </span>

            </div>

            <div className="leading-none">

              <div className="flex items-center gap-2">

                <p className="text-[14px] font-semibold tracking-[-0.025em] text-[#11131A]">
                  Arc Pay
                </p>

                <span className="hidden rounded-full bg-[#F0F1FF] px-1.5 py-0.5 text-[7px] font-bold text-[#5B61D6] sm:inline">
                  TESTNET
                </span>

              </div>

              <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.16em] text-[#9AA0AB]">
                Payments infrastructure
              </p>

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
              ================================================= */}

          <div className="flex items-center gap-2">

            {/* NETWORK */}

            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-2 sm:flex ${
                connected &&
                !onArcTestnet
                  ? "border-[#F0D9BA] bg-[#FFF9F0]"
                  : "border-[#E6E8ED] bg-[#FBFBFD]"
              }`}
            >

              <span
                className={`h-[6px] w-[6px] rounded-full ${
                  connected &&
                  !onArcTestnet
                    ? "bg-[#D99A36]"
                    : "bg-[#16A36A]"
                }`}
              />

              <span
                className={`text-[9px] font-semibold ${
                  connected &&
                  !onArcTestnet
                    ? "text-[#A36D22]"
                    : "text-[#69707C]"
                }`}
              >
                {connected &&
                !onArcTestnet
                  ? "Wrong network"
                  : "Arc Testnet"}
              </span>

            </div>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-[#737985] transition hover:bg-[#F3F4F7] hover:text-[#11131A]"
            >

              <Bell
                size={17}
                strokeWidth={1.65}
              />

              <span className="absolute right-[9px] top-[8px] h-[5px] w-[5px] rounded-full bg-[#6366F1] ring-2 ring-white" />

            </button>

            {/* WRONG NETWORK */}

            {connected &&
            !onArcTestnet ? (

              <button
                type="button"
                disabled={
                  isSwitching
                }
                onClick={() =>
                  switchChain({
                    chainId:
                      arcTestnet.id,
                  })
                }
                className="flex h-[40px] items-center gap-2 rounded-full bg-[#11131A] px-4 text-[10px] font-semibold text-white shadow-[0_5px_16px_rgba(17,19,26,0.12)] transition hover:bg-[#292D36] disabled:opacity-60"
              >

                {isSwitching
                  ? "Switching..."
                  : "Switch network"}

              </button>

            ) : connected ? (

              /* =================================================
                 CONNECTED WALLET
                 ================================================= */

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setAccountMenuOpen(
                      (value) =>
                        !value
                    )
                  }
                  className="flex h-[40px] items-center gap-2 rounded-full border border-[#E0E3E9] bg-white px-2.5 pr-3 shadow-[0_1px_2px_rgba(17,19,26,0.03)] transition hover:border-[#D5D9E1] hover:bg-[#FAFAFC]"
                >

                  <span className="relative flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#EEF2FF] text-[#5962D8]">

                    <Wallet
                      size={14}
                      strokeWidth={1.7}
                    />

                    <span className="absolute bottom-0 right-0 h-[6px] w-[6px] rounded-full bg-[#16A36A] ring-2 ring-white" />

                  </span>

                  <span className="hidden font-mono text-[9px] font-semibold text-[#3F444D] sm:block">
                    {shortAddress}
                  </span>

                  <ChevronDown
                    size={13}
                    className={`text-[#9298A4] transition-transform ${
                      accountMenuOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                </button>

                {/* ACCOUNT MENU */}

                {accountMenuOpen && (

                  <div className="absolute right-0 top-[50px] w-[285px] overflow-hidden rounded-[20px] border border-[#E2E5EA] bg-white shadow-[0_22px_60px_-28px_rgba(17,19,26,0.28)]">

                    {/* HEADER */}

                    <div className="bg-[#FAFBFD] p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-[#5962D8]">

                          <Wallet
                            size={17}
                            strokeWidth={1.6}
                          />

                        </div>

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <p className="text-[10px] font-semibold text-[#333740]">
                              Connected wallet
                            </p>

                            <span className="flex items-center gap-1 rounded-full bg-[#EAF8F2] px-1.5 py-0.5 text-[7px] font-bold text-[#16A36A]">

                              <span className="h-1 w-1 rounded-full bg-current" />

                              LIVE

                            </span>

                          </div>

                          <p className="mt-1 truncate font-mono text-[9px] text-[#8D939F]">
                            {shortAddress}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="border-t border-[#EEF0F4]" />

                    <div className="p-2">

                      {/* COPY */}

                      <button
                        type="button"
                        onClick={
                          copyAddress
                        }
                        className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[10px] font-medium text-[#555B67] transition hover:bg-[#F5F6F9] hover:text-[#11131A]"
                      >

                        <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#F1F2F6]">

                          {copied ? (
                            <Check
                              size={13}
                              className="text-[#16A36A]"
                            />
                          ) : (
                            <Copy
                              size={13}
                            />
                          )}

                        </span>

                        <span className="flex-1">

                          {copied
                            ? "Address copied"
                            : "Copy address"}

                        </span>

                      </button>

                      {/* EXPLORER */}

                      {address && (

                        <a
                          href={explorerAddressUrl(
                            address
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[10px] font-medium text-[#555B67] transition hover:bg-[#F5F6F9] hover:text-[#11131A]"
                        >

                          <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#F1F2F6]">

                            <ExternalLink
                              size={13}
                            />

                          </span>

                          View on explorer

                        </a>

                      )}

                      {/* DISCONNECT */}

                      <button
                        type="button"
                        onClick={
                          handleDisconnect
                        }
                        className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[10px] font-medium text-[#C15B5B] transition hover:bg-[#FFF4F4]"
                      >

                        <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#FFF1F1]">

                          <LogOut
                            size={13}
                          />

                        </span>

                        Disconnect

                      </button>

                    </div>

                  </div>

                )}

              </div>

            ) : (

              /* =================================================
                 CONNECT WALLET
                 ================================================= */

              <button
                type="button"
                onClick={() =>
                  setWalletModalOpen(
                    true
                  )
                }
                className="flex h-[40px] items-center gap-2 rounded-full bg-[#11131A] px-4 text-[10px] font-semibold text-white shadow-[0_5px_18px_rgba(17,19,26,0.12)] transition hover:-translate-y-[1px] hover:bg-[#292D36]"
              >

                <Wallet
                  size={14}
                  strokeWidth={1.8}
                />

                Connect wallet

              </button>

            )}

          </div>

        </div>

      </header>

      {/* =====================================================
          WALLET MODAL
          ===================================================== */}

      {walletModalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C1220]/25 px-4 backdrop-blur-[5px]">

          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close wallet modal"
            onClick={() =>
              setWalletModalOpen(
                false
              )
            }
            className="absolute inset-0 cursor-default"
          />

          {/* MODAL */}

          <div className="relative z-10 flex max-h-[78vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[25px] border border-[#E1E4EA] bg-[#FBFBFD] shadow-[0_35px_100px_-35px_rgba(17,19,26,0.30)]">

            {/* CLOSE */}

            <button
              type="button"
              aria-label="Close"
              onClick={() =>
                setWalletModalOpen(
                  false
                )
              }
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E6EB] bg-white text-[#777D89] transition hover:bg-[#F3F4F7] hover:text-[#11131A]"
            >

              <X
                size={14}
                strokeWidth={1.8}
              />

            </button>

            {/* HEADER */}

            <div className="relative overflow-hidden px-6 pb-5 pt-7 text-center">

              <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#6366F1]/[0.08] blur-[55px]" />

              <div className="relative mx-auto flex h-[50px] w-[50px] items-center justify-center rounded-[16px] bg-[#0C1220] shadow-[0_10px_28px_rgba(17,19,26,0.14)]">

                <span className="text-[16px] font-bold text-white">
                  A
                </span>

              </div>

              <p className="relative mt-4 text-[8px] font-bold uppercase tracking-[0.18em] text-[#6366F1]">
                Arc Pay
              </p>

              <h2 className="relative mt-1 text-[19px] font-semibold tracking-[-0.04em] text-[#11131A]">
                Connect your wallet
              </h2>

              <p className="relative mx-auto mt-1.5 max-w-[280px] text-[9px] leading-4 text-[#858B97]">
                Choose a wallet to start sending and receiving USDC on Arc.
              </p>

            </div>

            {/* WALLET LIST */}

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">

              <div className="overflow-hidden rounded-[17px] border border-[#E1E4EA] bg-white">

                {wallets.map(
                  (wallet) => (

                    <button
                      key={
                        wallet.uuid
                      }
                      type="button"
                      disabled={
                        isPending
                      }
                      onClick={
                        handleConnect
                      }
                      className="group flex h-[64px] w-full items-center gap-3 border-b border-[#EEF0F4] px-3.5 text-left transition last:border-b-0 hover:bg-[#FAFBFD] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#F3F4F7]">

                        <img
                          src={
                            wallet.icon
                          }
                          alt={`${wallet.name} logo`}
                          className="h-[28px] w-[28px] rounded-[7px] object-contain"
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-[10px] font-semibold text-[#22252C]">
                          {wallet.name}
                        </p>

                        <p className="mt-1 text-[8px] text-[#999FAA]">
                          {isPending
                            ? "Confirm in your wallet..."
                            : "Connect wallet"}
                        </p>

                      </div>

                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F6F8] text-[#9AA0AB] transition group-hover:bg-[#EEF2FF] group-hover:text-[#5962D8]">

                        <ChevronDown
                          size={13}
                          strokeWidth={1.7}
                          className="-rotate-90"
                        />

                      </span>

                    </button>

                  )
                )}

                {wallets.length ===
                  0 && (

                  <div className="px-5 py-9 text-center">

                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F2F6]">

                      <Wallet
                        size={18}
                        className="text-[#777D89]"
                      />

                    </div>

                    <p className="mt-3 text-[10px] font-semibold text-[#555B67]">
                      No browser wallets detected
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-[#999FAA]">
                      Install a compatible wallet and refresh the page.
                    </p>

                  </div>

                )}

              </div>

              {/* NETWORK */}

              <div className="mt-2.5 flex items-center gap-2.5 rounded-[14px] border border-[#E8EAF0] bg-white px-3 py-2.5">

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF8F2]">

                  <span className="h-2 w-2 rounded-full bg-[#16A36A]" />

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[9px] font-semibold text-[#555B67]">
                    Arc Testnet
                  </p>

                  <p className="mt-0.5 text-[8px] text-[#999FAA]">
                    USDC payments on Arc.
                  </p>

                </div>

                <span className="rounded-full bg-[#EAF8F2] px-2 py-1 text-[7px] font-bold text-[#16A36A]">
                  TESTNET
                </span>

              </div>

              {/* ERROR */}

              {error && (

                <div className="mt-2.5 rounded-[13px] border border-[#E7CACA] bg-[#FFF6F6] px-3 py-2.5">

                  <p className="text-[9px] font-semibold text-[#B65353]">
                    Connection failed
                  </p>

                  <p className="mt-1 text-[8px] leading-4 text-[#B76A6A]">
                    {error.message}
                  </p>

                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="shrink-0 border-t border-[#EEF0F4] px-4 py-3 text-center">

              <div className="flex items-center justify-center gap-1.5">

                <ShieldCheck
                  size={12}
                  className="text-[#8C929E]"
                />

                <p className="text-[8px] text-[#8C929E]">
                  Non-custodial · Your keys stay with you
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
}
