import Link from "next/link";
import { WalletWidget } from "./WalletWidget";

export function TopBar() {
  return (
    <header className="border-b border-line-soft">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[13px] font-bold text-white">
            A
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">Arc Pay</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-ink-faint sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Arc Testnet
          </span>
          <WalletWidget />
        </div>
      </div>
    </header>
  );
}
