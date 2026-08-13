import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Arc Pay — USDC payment links on Arc Testnet",
  description: "Create a shareable USDC payment link and get paid on Arc Testnet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas-field min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
