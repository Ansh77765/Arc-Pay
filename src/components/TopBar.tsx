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

  const [copied, setCopied] = useState(false);

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

  const { disconnect } = useDisconnect();

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

  /*
   * REAL EIP-6963 WALLET DISCOVERY
   *
   * Wallet extensions announce their own:
   * - name
   * - icon
   * - rdns
   * - uuid
   */
  useEffect(() => {
    const discovered = new Map<
      string,
      WalletInfo
    >();

    const announce = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          info: WalletInfo;
        }>
      ).detail;

      if (!detail?.info?.uuid) return;

      discovered.set(
        detail.info.uuid,
        detail.info
      );

      setWallets(
        Array.from(discovered.values())
      );
    };

    window.addEventListener(
      "eip6963:announceProvider",
      announce
    );

    window.dispatchEvent(
      new Event("eip6963:requestProvider")
    );

    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        announce
      );
    };
  }, []);

  useEffect(() => {
    if (connected) {
      setWalletModalOpen(false);
    }
  }, [connected]);

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
        "Unable to copy address"
      );
    }
  };

  /*
   * Use the existing injected connector.
   *
   * We deliberately do NOT force chainId here.
   * This is the connection flow that you confirmed works.
   */
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
      connector: injectedConnector,
    });
  };

  const handleDisconnect = () => {
    disconnect();
    setAccountMenuOpen(false);
  };

  return (
    <>
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 h-[68px] border-b border-[#E7E7EA] bg-white">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#111111]">
              <span className="text-[15px] font-bold text-white">
                A
              </span>
            </div>

            <div className="leading-none">
              <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#111111]">
                Arc Pay
              </p>

              <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.15em] text-[#96979F]">
                Payments
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* NETWORK */}
            <div className="hidden items-center gap-2 rounded-full border border-[#E7E7EA] px-3 py-2 sm:flex">
              <span
                className={`h-[7px] w-[7px] rounded-full ${
                  connected &&
                  !onArcTestnet
                    ? "bg-[#D99A36]"
                    : "bg-[#31A66A]"
                }`}
              />

              <span className="text-[10px] font-medium text-[#66676E]">
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
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-[#66676E] transition hover:bg-[#F5F5F6] hover:text-[#111111]"
            >
              <Bell
                size={17}
                strokeWidth={1.7}
              />
            </button>

            {/* WRONG NETWORK */}
            {connected &&
            !onArcTestnet ? (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() =>
                  switchChain({
                    chainId:
                      arcTestnet.id,
                  })
                }
                className="flex h-[40px] items-center gap-2 rounded-full bg-[#111111] px-4 text-[10px] font-semibold text-white transition hover:bg-[#292929] disabled:opacity-60"
              >
                {isSwitching
                  ? "Switching..."
                  : "Switch network"}
              </button>
            ) : connected ? (

              /* CONNECTED */
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setAccountMenuOpen(
                      (value) => !value
                    )
                  }
                  className="flex h-[40px] items-center gap-2 rounded-full border border-[#E2E2E5] bg-white px-2.5 pr-3 transition hover:bg-[#F7F7F8]"
                >
                  <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#F1F1F2]">
                    <Wallet
                      size={14}
                      strokeWidth={1.7}
                    />
                  </span>

                  <span className="hidden text-[11px] font-medium text-[#33343A] sm:block">
                    {shortAddress}
                  </span>

                  <ChevronDown
                    size={13}
                    className={`text-[#96979F] transition-transform ${
                      accountMenuOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-[50px] w-[270px] overflow-hidden rounded-[18px] border border-[#E5E5E8] bg-white shadow-[0_18px_50px_-25px_rgba(0,0,0,.25)]">

                    <div className="border-b border-[#EEEEF1] p-4">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#999AA2]">
                        Connected wallet
                      </p>

                      <p className="mt-2 break-all font-mono text-[11px] text-[#44454B]">
                        {address}
                      </p>
                    </div>

                    <div className="p-2">

                      <button
                        type="button"
                        onClick={
                          copyAddress
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] text-[#55565D] hover:bg-[#F7F7F8]"
                      >
                        {copied ? (
                          <Check
                            size={15}
                          />
                        ) : (
                          <Copy
                            size={15}
                          />
                        )}

                        {copied
                          ? "Copied"
                          : "Copy address"}
                      </button>

                      {address && (
                        <a
                          href={explorerAddressUrl(
                            address
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] text-[#55565D] hover:bg-[#F7F7F8]"
                        >
                          <ExternalLink
                            size={15}
                          />

                          View on explorer
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={
                          handleDisconnect
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] text-red-500 hover:bg-red-50"
                      >
                        <LogOut
                          size={15}
                        />

                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>

            ) : (

              /* CONNECT */
              <button
                type="button"
                onClick={() =>
                  setWalletModalOpen(
                    true
                  )
                }
                className="flex h-[40px] items-center gap-2 rounded-full bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
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

      {/* WALLET MODAL */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-4 backdrop-blur-[3px]">

          <button
            type="button"
            aria-label="Close wallet modal"
            onClick={() =>
              setWalletModalOpen(
                false
              )
            }
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[24px] border border-[#E4E4E7] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,.28)]">

            {/* CLOSE */}
            <button
              type="button"
              onClick={() =>
                setWalletModalOpen(
                  false
                )
              }
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#E7E7EA] bg-white text-[#777880] hover:bg-[#F5F5F6]"
            >
              <X size={17} />
            </button>

            {/* HEADER */}
            <div className="px-6 pb-5 pt-8 text-center">

              <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-[#F5F5F6]">
                <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[#111111]">
                  <span className="text-[18px] font-bold text-white">
                    A
                  </span>
                </div>
              </div>

              <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.04em]">
                Connect your wallet
              </h2>

              <p className="mx-auto mt-2 max-w-[300px] text-[11px] leading-5 text-[#85868E]">
                Choose a wallet to connect
                to Arc Pay.
              </p>
            </div>

            {/* WALLETS */}
            <div className="px-5 pb-5">

              <div className="overflow-hidden rounded-[18px] border border-[#E3E3E6]">

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
                      className="group flex w-full items-center gap-4 border-b border-[#EEEEF1] px-4 py-3.5 text-left transition last:border-b-0 hover:bg-[#F8F8F9] disabled:opacity-50"
                    >

                      {/* REAL OFFICIAL ICON */}
                      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-[#F5F5F6]">
                        <img
                          src={
                            wallet.icon
                          }
                          alt=""
                          className="h-[29px] w-[29px] rounded-[8px] object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-[#222327]">
                          {
                            wallet.name
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-[#999AA2]">
                          {isPending
                            ? "Confirm in your wallet..."
                            : "Connect wallet"}
                        </p>
                      </div>

                      <ChevronDown
                        size={15}
                        className="-rotate-90 text-[#A0A1A8]"
                      />
                    </button>
                  )
                )}

                {wallets.length ===
                  0 && (
                    <div className="px-5 py-8 text-center">
                      <Wallet
                        size={22}
                        className="mx-auto text-[#777880]"
                      />

                      <p className="mt-3 text-[11px] font-semibold">
                        No browser wallets
                        detected
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-[#999AA2]">
                        Make sure your wallet
                        extension is installed
                        and enabled.
                      </p>
                    </div>
                  )}
              </div>

              {/* NETWORK */}
              <div className="mt-3 flex items-center gap-3 rounded-[15px] bg-[#F7F7F8] px-4 py-3">

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <span className="h-2 w-2 rounded-full bg-[#31A66A]" />
                </span>

                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-[#55565D]">
                    Arc Testnet
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#999AA2]">
                    USDC payments use Arc
                    Testnet.
                  </p>
                </div>

                <span className="text-[9px] font-medium text-[#31A66A]">
                  Testnet
                </span>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-3 rounded-[13px] border border-[#F0D4D4] bg-[#FFF8F8] px-4 py-3">

                  <p className="text-[10px] font-semibold text-[#B85D5D]">
                    Connection failed
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-[#B76A6A]">
                    {error.message}
                  </p>

                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-[#EEEEF1] px-5 py-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck
                  size={13}
                  className="text-[#8C8D95]"
                />

                <p className="text-[9px] text-[#8C8D95]">
                  Non-custodial. Your keys
                  stay with you.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
