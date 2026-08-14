import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arc Pay",
  description: "Simple USDC payment requests on Arc Testnet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#05080f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
