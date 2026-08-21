"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      className={`
        group
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        border
        border-transparent
        px-2
        py-1.5
        text-[10px]
        font-semibold
        transition-all
        duration-200
        ${
          copied
            ? "border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-300/80"
            : "text-white/25 hover:border-blue-400/10 hover:bg-blue-500/[0.06] hover:text-blue-300/80"
        }
        ${className}
      `}
    >
      {copied ? (
        <>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/[0.10]">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-white/[0.025] transition-colors group-hover:bg-blue-500/[0.08]">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="9"
                y="9"
                width="12"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />

              <path
                d="M5 15V5a2 2 0 0 1 2-2h10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <span>{label}</span>
        </>
      )}
    </button>
  );
}
