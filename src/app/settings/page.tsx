"use client";

import {
  Settings as SettingsIcon,
  Wallet,
  Network,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  LogOut,
} from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";

import {
  useAccount,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

import { arcTestnet } from "@/lib/chain";
import {
  USDC_ADDRESS,
  explorerAddressUrl,
} from "@/lib/config";

export default function SettingsPage() {
  const { address, isConnected, chainId } =
    useAccount();

  const { disconnect } = useDisconnect();

  const {
    switchChain,
    isPending: isSwitching,
  } = useSwitchChain();

  const onArcTestnet =
    isConnected && chainId === arcTestnet.id;

  const copyAddress = async () => {
    if (!address) return;

    await navigator.clipboard.writeText(address);
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="px-6 pb-12 pt-7 sm:px-10 lg:px-12">

            {/* HEADER */}
            <div className="mb-7">
              <p className="text-[11px] font-medium text-[#85868E]">
                Preferences
              </p>

              <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.045em]">
                Settings
              </h1>

              <p className="mt-1.5 text-[12px] text-[#85868E]">
                Manage your Arc Pay wallet and network.
              </p>
            </div>

            <div className="max-w-[760px] space-y-4">

              {/* WALLET */}
              <SettingsSection
                icon={
                  <Wallet
                    size={17}
                    strokeWidth={1.7}
                  />
                }
                title="Wallet"
                description="Your connected wallet information."
              >
                <SettingsRow
                  label="Connection"
                  value={
                    isConnected
                      ? "Connected"
                      : "Not connected"
                  }
                  icon={
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isConnected
                          ? "bg-[#31A66A]"
                          : "bg-[#A0A1A8]"
                      }`}
                    />
                  }
                  valueClass={
                    isConnected
                      ? "text-[#31A66A]"
                      : "text-[#85868E]"
                  }
                />

                <SettingsRow
                  label="Address"
                  value={shortAddress}
                  icon={<Wallet size={15} />}
                  action={
                    address
                      ? copyAddress
                      : undefined
                  }
                />

                {isConnected && (
                  <SettingsRow
                    label="Disconnect"
                    value="Disconnect wallet"
                    icon={<LogOut size={15} />}
                    action={() => disconnect()}
                    valueClass="text-[#C95D5D]"
                  />
                )}
              </SettingsSection>

              {/* NETWORK */}
              <SettingsSection
                icon={
                  <Network
                    size={17}
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
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        onArcTestnet
                          ? "bg-[#31A66A]"
                          : "bg-[#D99A36]"
                      }`}
                    />
                  }
                  valueClass={
                    onArcTestnet
                      ? "text-[#31A66A]"
                      : "text-[#B07822]"
                  }
                />

                {!onArcTestnet &&
                  isConnected && (
                    <SettingsRow
                      label="Switch network"
                      value={
                        isSwitching
                          ? "Switching..."
                          : "Switch to Arc Testnet"
                      }
                      icon={
                        <Network size={15} />
                      }
                      action={() =>
                        switchChain({
                          chainId:
                            arcTestnet.id,
                        })
                      }
                      valueClass="text-[#111111]"
                    />
                  )}

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
                  label="USDC contract"
                  value={`${USDC_ADDRESS.slice(
                    0,
                    6
                  )}...${USDC_ADDRESS.slice(-4)}`}
                  icon={<Copy size={15} />}
                  action={async () => {
                    await navigator.clipboard.writeText(
                      USDC_ADDRESS
                    );
                  }}
                />

                <a
                  href={explorerAddressUrl(
                    USDC_ADDRESS
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[62px] items-center gap-3 border-b border-[#F0F0F2] px-6 text-left transition hover:bg-[#FAFAFA]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F8] text-[#777880]">
                    <ExternalLink size={15} />
                  </span>

                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-[#33343A]">
                      Explorer
                    </p>
                  </div>

                  <span className="text-[11px] text-[#55565D]">
                    View contract
                  </span>

                  <ExternalLink
                    size={14}
                    className="text-[#A0A1A8]"
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
                title="Security"
                description="How Arc Pay handles your wallet."
              >
                <SettingsRow
                  label="Wallet custody"
                  value="Non-custodial"
                  icon={
                    <ShieldCheck size={15} />
                  }
                  valueClass="text-[#31A66A]"
                />

                <SettingsRow
                  label="Private keys"
                  value="Never stored by Arc Pay"
                  icon={
                    <ShieldCheck size={15} />
                  }
                />

                <SettingsRow
                  label="Payment signing"
                  value="Wallet signature required"
                  icon={
                    <ShieldCheck size={15} />
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

                <SettingsRow
                  label="Network"
                  value="Arc Testnet"
                />
              </SettingsSection>

              {/* FOOTER */}
              <div className="rounded-[17px] bg-[#F7F7F8] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={15}
                    className="mt-0.5 text-[#55565D]"
                  />

                  <div>
                    <p className="text-[10px] font-semibold text-[#55565D]">
                      Non-custodial by design
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-[#8C8D95]">
                      Your wallet and private keys remain
                      under your control. Always verify the
                      network before signing transactions.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

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
    <section className="overflow-hidden rounded-[20px] border border-[#E7E7EA] bg-white">
      <div className="flex items-start gap-3 border-b border-[#EEEEF1] px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F6] text-[#55565D]">
          {icon}
        </div>

        <div>
          <h2 className="text-[13px] font-semibold">
            {title}
          </h2>

          <p className="mt-0.5 text-[10px] text-[#92939B]">
            {description}
          </p>
        </div>
      </div>

      <div>{children}</div>
    </section>
  );
}

function SettingsRow({
  label,
  value,
  icon,
  action,
  valueClass = "text-[#55565D]",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  action?: () => void | Promise<void>;
  valueClass?: string;
}) {
  const content = (
    <>
      {icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#777880]">
          {icon}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-[#33343A]">
          {label}
        </p>
      </div>

      <span
        className={`max-w-[260px] truncate text-[10px] ${valueClass}`}
      >
        {value}
      </span>
    </>
  );

  if (!action) {
    return (
      <div className="flex min-h-[58px] items-center gap-3 border-b border-[#F0F0F2] px-5 last:border-b-0">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={action}
      className="flex min-h-[58px] w-full items-center gap-3 border-b border-[#F0F0F2] px-5 text-left transition hover:bg-[#FAFAFA]"
    >
      {content}
    </button>
  );
}
