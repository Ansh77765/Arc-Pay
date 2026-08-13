import { TopBar } from "@/components/TopBar";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 sm:pt-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_420px] lg:items-start">
          <section className="animate-fade-up">
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-good" />
              Live on Arc Testnet
            </span>
            <h1 className="max-w-md text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Get paid in USDC.
              <br />
              <span className="text-ink-dim">One link, one payment.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-dim">
              Request an exact USDC amount, share a link, and watch it settle on-chain — no
              invoices, no accounts, no middleman. Every payment is a direct wallet-to-wallet
              transfer on Arc Testnet.
            </p>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line-soft pt-8">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-faint">Network</dt>
                <dd className="mt-1 text-sm font-medium text-ink">Arc Testnet</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-faint">Asset</dt>
                <dd className="mt-1 text-sm font-medium text-ink">USDC</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-faint">Settlement</dt>
                <dd className="mt-1 text-sm font-medium text-ink">On-chain, direct</dd>
              </div>
            </dl>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-line bg-canvas-panel p-6 shadow-card sm:p-7"
            style={{ animationDelay: "80ms" }}
          >
            <h2 className="mb-1 text-base font-semibold text-ink">Request a payment</h2>
            <p className="mb-6 text-sm text-ink-dim">
              Connect your wallet, set an amount, and get a shareable link.
            </p>
            <CreatePaymentForm />
          </section>
        </div>
      </main>
    </div>
  );
}
