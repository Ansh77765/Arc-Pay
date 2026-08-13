"use client";

import { decodeInvoice } from "@/lib/invoice";
import { PaymentView } from "@/components/PaymentView";
import { TopBar } from "@/components/TopBar";
import Link from "next/link";

export default function PayPage({ params }: { params: { data: string } }) {
  const invoice = decodeInvoice(params.data);

  if (!invoice) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 pt-24 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bad/10 text-bad">
            !
          </span>
          <h1 className="text-lg font-semibold text-ink">This payment link is invalid</h1>
          <p className="text-sm text-ink-dim">
            The link may be incomplete or corrupted. Ask the sender for a fresh link, or create
            your own.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Create a payment link
          </Link>
        </div>
      </div>
    );
  }

  return <PaymentView invoice={invoice} />;
}
